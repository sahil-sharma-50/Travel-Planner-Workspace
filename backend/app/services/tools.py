import logging
from app.api.routers import weather, attractions, shows

logger = logging.getLogger(__name__)

def get_weather_tool(city: str):
    """
    Get current weather for a specific city and transform to frontend format.
    
    Args:
        city: The name of the city.
        
    Returns:
        dict: Weather data including temperature, description, humidity, and wind speed.
    """
    try:
        raw_data = weather.get_weather(city)
        return {
            "temperature": round(raw_data["main"]["temp"]),
            "description": raw_data["weather"][0]["description"],
            "humidity": raw_data["main"]["humidity"],
            "wind_speed": round(raw_data["wind"]["speed"], 1)
        }
    except Exception as e:
        logger.error(f"Error fetching weather for {city}: {str(e)}")
        return {
            "temperature": "N/A",
            "description": "Unable to fetch weather",
            "humidity": "N/A",
            "wind_speed": "N/A"
        }

def get_attractions_tool(city: str):
    """Get tourist attractions for a specific city."""
    try:
        return attractions.get_attractions(city)
    except Exception as e:
        logger.error(f"Error fetching attractions for {city}: {str(e)}")
        return f"Error fetching attractions: {str(e)}"

def get_shows_tool(city: str):
    """Get current shows for a specific city."""
    try:
        return shows.get_shows(city)
    except Exception as e:
        logger.error(f"Error fetching shows for {city}: {str(e)}")
        return f"Error fetching shows: {str(e)}"

def change_theme_tool(theme: str):
    """
    Change the application theme.
    
    Args:
        theme: The theme to change to ('light' or 'dark').
    """
    return {"status": "success", "theme": theme}

TOOLS_DEFINITION = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get current weather for a given city.",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {
                        "type": "string",
                        "description": "The city to get weather for, e.g. New York, London",
                    },
                },
                "required": ["city"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_attractions",
            "description": "Get top tourist attractions for a given city.",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {
                        "type": "string",
                        "description": "The city to get attractions for",
                    },
                },
                "required": ["city"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_shows",
            "description": "Get current events/shows for a given city.",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {
                        "type": "string",
                        "description": "The city to get shows for",
                    },
                },
                "required": ["city"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "change_theme",
            "description": "Change the application theme to light or dark.",
            "parameters": {
                "type": "object",
                "properties": {
                    "theme": {
                        "type": "string",
                        "enum": ["light", "dark"],
                        "description": "The theme to switch to",
                    },
                },
                "required": ["theme"],
            },
        },
    },
]
