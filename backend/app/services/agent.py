import os
import json
import logging
from openai import OpenAI
from app.core.prompts import SYSTEM_PROMPT, PREFERENCES_PROMPT
from app.services.extractor import extract_form_data
from app.services.tools import get_weather_tool, get_attractions_tool, get_shows_tool, TOOLS_DEFINITION

logger = logging.getLogger(__name__)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def run_agent_stream(user_prompt: str, conversation_history: list, session_id: str, sessions: dict, is_planning_only: bool = False):
    """
    Main agent execution loop with streaming response.
    
    Args:
        user_prompt: The user's input.
        conversation_history: List of previous messages in the session.
        session_id: Session identifier.
        sessions: Reference to the session storage.
        is_planning_only: If True, stop after generating the plan.
        
    Yields:
        str: JSON-encoded status, plan, result, or client action.
    """
    # Load user preferences
    try:
        with open('knowledge.json', 'r') as f:
            knowledge = json.load(f)
            user_info = knowledge.get('user', {})
            user_name = user_info.get('name', 'User')
            preferences = user_info.get('preferences', {})
            interests = ', '.join(preferences.get('interests', []))
    except Exception as e:
        logger.warning(f"Could not load knowledge.json: {e}")
        user_name = 'User'
        interests = ''
    
    system_prompt = SYSTEM_PROMPT.format(user_name=user_name)
    
    if interests:
        system_prompt += PREFERENCES_PROMPT.format(user_name=user_name, interests=interests)
    
    # Build messages
    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(conversation_history)
    messages.append({"role": "user", "content": user_prompt})
    
    yield json.dumps({"type": "status", "content": "Analyzing request...", "reason": "Understanding your travel query"}) + "\n"

    # First call to see if tools are needed
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        tools=TOOLS_DEFINITION,
        tool_choice="auto",
    )
    
    response_message = response.choices[0].message
    tool_calls = response_message.tool_calls
    
    # Generate and send plan
    if tool_calls:
        plan_steps = []
        for tool_call in tool_calls:
            function_name = tool_call.function.name
            function_args = json.loads(tool_call.function.arguments)
            city = function_args.get("city", "unknown")
            
            step_descriptions = {
                "get_weather": f"Check weather in {city}",
                "get_attractions": f"Find attractions in {city}",
                "get_shows": f"Find shows in {city}"
            }
            plan_steps.append(step_descriptions.get(function_name, f"Call {function_name}"))
        
        plan_text = " → ".join(plan_steps) + " → Generate recommendation"
        yield json.dumps({"type": "plan", "content": plan_text}) + "\n"
    
        messages.append(response_message)
        
        available_functions = {
            "get_weather": get_weather_tool,
            "get_attractions": get_attractions_tool,
            "get_shows": get_shows_tool,
        }
        
        for tool_call in tool_calls:
            function_name = tool_call.function.name
            function_to_call = available_functions[function_name]
            function_args = json.loads(tool_call.function.arguments)
            
            # Yield status update
            params_str = ', '.join([f"{k}={v}" for k, v in function_args.items()])
            reasons = {
                "get_weather": "Checking current weather conditions",
                "get_attractions": "Finding tourist attractions",
                "get_shows": "Looking for events and shows"
            }
            yield json.dumps({
                "type": "status", 
                "content": f"Calling {function_name}({params_str})",
                "reason": reasons.get(function_name, "Gathering information")
            }) + "\n"
            
            try:
                function_response = function_to_call(city=function_args.get("city"))
                yield json.dumps({
                    "type": "status",
                    "content": f"{function_name} completed",
                    "reason": "Data retrieved successfully",
                    "status": "success"
                }) + "\n"
            except Exception as e:
                logger.error(f"Error calling {function_name}: {str(e)}")
                function_response = {"error": str(e)}
                yield json.dumps({
                    "type": "status",
                    "content": f"{function_name} failed",
                    "reason": f"Error: {str(e)}",
                    "status": "failed"
                }) + "\n"
            
            messages.append({
                "tool_call_id": tool_call.id,
                "role": "tool",
                "name": function_name,
                "content": json.dumps(function_response, default=str),
            })
            
        yield json.dumps({"type": "status", "content": "Generating final response...", "reason": "Creating personalized recommendation"}) + "\n"

        # Second call for final response
        final_response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
        )
        content = final_response.choices[0].message.content
        yield json.dumps({"type": "result", "content": content}) + "\n"
        
        if is_planning_only:
            return

        # Emit travel form update action
        form_data = extract_form_data(user_prompt, tool_calls)
        yield json.dumps({
            "type": "client_action",
            "action": "update_travel_form",
            "data": form_data
        }) + "\n"
        
        # Send structured data for table display
        structured_data = {"attractions": [], "shows": [], "weather": None}
        for tool_call in tool_calls:
            function_name = tool_call.function.name
            function_args = json.loads(tool_call.function.arguments)
            
            if function_name == "get_weather":
                city = function_args.get("city", "")
                structured_data["weather"] = get_weather_tool(city)
            elif function_name == "get_attractions":
                from app.api.routers import attractions as attr_router
                city_key = function_args.get("city", "").lower()
                if city_key in attr_router.ATTRACTIONS:
                    structured_data["attractions"] = attr_router.ATTRACTIONS[city_key]["attractions"]
            elif function_name == "get_shows":
                from app.api.routers import shows as show_router
                city_key = function_args.get("city", "").lower()
                if city_key in show_router.SHOWS:
                    structured_data["shows"] = show_router.SHOWS[city_key]["shows"]
        
        if structured_data["attractions"] or structured_data["shows"] or structured_data["weather"]:
            yield json.dumps({"type": "structured_data", "content": structured_data}) + "\n"
        
        # Client actions for UI
        if structured_data["attractions"] or structured_data["shows"]:
            yield json.dumps({
                "type": "client_action",
                "action": "auto_select_preferences",
                "data": {
                    "attractions": [item["name"] for item in structured_data["attractions"]],
                    "shows": [item["name"] for item in structured_data["shows"]]
                }
            }) + "\n"
            yield json.dumps({
                "type": "client_action",
                "action": "enable_download",
                "data": {
                    "city": function_args.get("city", "Unknown"),
                    "weather": structured_data.get("weather")
                }
            }) + "\n"
        
        # Update session history
        sessions[session_id].append({"role": "user", "content": user_prompt})
        sessions[session_id].append({"role": "assistant", "content": content})
    else:
        content = response_message.content
        yield json.dumps({"type": "result", "content": content}) + "\n"
        
        if is_planning_only:
            return

        form_data = extract_form_data(user_prompt)
        yield json.dumps({
            "type": "client_action",
            "action": "update_travel_form",
            "data": form_data
        }) + "\n"
        
        sessions[session_id].append({"role": "user", "content": user_prompt})
        sessions[session_id].append({"role": "assistant", "content": content})
