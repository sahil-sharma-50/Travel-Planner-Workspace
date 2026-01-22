import json
import logging
import os
from datetime import datetime

from openai import OpenAI

logger = logging.getLogger(__name__)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def extract_form_data(user_prompt: str, tool_calls: list = None):
    """
    Extract travel form data (city, dates, checklist) from user prompt using LLM.

    Args:
        user_prompt: The raw text input from the user.
        tool_calls: Optional list of tool calls from the LLM.

    Returns:
        dict: A dictionary containing extracted city, dates, and checklist items.
    """
    form_data = {"city": "", "startDate": "", "endDate": "", "checklist": {}}

    # Use LLM to intelligently extract form data
    try:
        current_date = datetime.now().strftime("%Y-%m-%d")

        extraction_prompt = f"""Extract travel planning information from the user's message. Today's date is {current_date}.

User message: "{user_prompt}"

Extract the following information:
1. **City/Destination**: Any city or destination mentioned (e.g., Paris, New York, Tokyo)
2. **Start Date**: The beginning date of the trip in YYYY-MM-DD format
3. **End Date**: The end date of the trip in YYYY-MM-DD format (if mentioned)
4. **Checklist Items**: Identify if the user has mentioned having/packing any of these items:
   - passport: passport or travel documents
   - visa: visa or entry permits
   - tickets: flight tickets, train tickets, or bookings
   - hotel: hotel reservations or accommodation bookings
   - luggage: luggage, bags, or baggage packed
   - insurance: travel insurance
   - currency: foreign currency or money exchanged
   - medications: medications or medical supplies

For checklist items, mark as true ONLY if the user explicitly indicates they HAVE, PACKED, or COMPLETED that item (e.g., "I have my passport", "tickets are booked", "packed my luggage").

Respond ONLY with valid JSON in this exact format:
{{
  "city": "city name in lowercase or empty string if not found",
  "startDate": "YYYY-MM-DD or empty string if not found",
  "endDate": "YYYY-MM-DD or empty string if not found",
  "checklist": {{
    "passport": true/false,
    "visa": true/false,
    "tickets": true/false,
    "hotel": true/false,
    "luggage": true/false,
    "insurance": true/false,
    "currency": true/false,
    "medications": true/false
  }}
}}

Examples:
- "I'm planning a trip to Paris from March 15 to March 20" → {{"city": "paris", "startDate": "2026-03-15", "endDate": "2026-03-20", "checklist": {{}}}}
- "Going to Tokyo next month, I have my passport and visa ready" → {{"city": "tokyo", "startDate": "", "endDate": "", "checklist": {{"passport": true, "visa": true}}}}
- "Booked my flight to London for June 5th. Hotel is also confirmed." → {{"city": "london", "startDate": "2026-06-05", "endDate": "", "checklist": {{"tickets": true, "hotel": true}}}}"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a precise data extraction assistant. Extract travel information and respond only with valid JSON.",
                },
                {"role": "user", "content": extraction_prompt},
            ],
            temperature=0,
            max_tokens=500,
        )

        extracted_text = response.choices[0].message.content.strip()

        # Remove markdown code blocks if present
        if extracted_text.startswith("```json"):
            extracted_text = extracted_text[7:]
        if extracted_text.startswith("```"):
            extracted_text = extracted_text[3:]
        if extracted_text.endswith("```"):
            extracted_text = extracted_text[:-3]
        extracted_text = extracted_text.strip()

        # Parse the JSON response
        extracted_data = json.loads(extracted_text)

        # Update form_data with extracted information
        if extracted_data.get("city"):
            form_data["city"] = extracted_data["city"].lower()

        if extracted_data.get("startDate"):
            form_data["startDate"] = extracted_data["startDate"]

        if extracted_data.get("endDate"):
            form_data["endDate"] = extracted_data["endDate"]

        # Update checklist (only include items that are True)
        if extracted_data.get("checklist"):
            for item, status in extracted_data["checklist"].items():
                if status is True:
                    form_data["checklist"][item] = True

        logger.info(f"LLM extracted form data: {form_data}")

    except Exception as e:
        logger.error(f"Error during LLM extraction: {e}")
        # Fallback: try to get city from tool calls if available
        if tool_calls:
            for tool_call in tool_calls:
                try:
                    function_args = json.loads(tool_call.function.arguments)
                    if "city" in function_args:
                        form_data["city"] = function_args["city"].lower()
                        break
                except Exception:
                    pass

    return form_data
