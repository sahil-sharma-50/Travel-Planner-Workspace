import os
import requests
from fastapi import APIRouter, HTTPException
from dotenv import load_dotenv
from pathlib import Path

# Explicitly load .env from the backend directory
env_path = Path(__file__).resolve().parent.parent.parent.parent / ".env"
load_dotenv(env_path)

router = APIRouter(prefix="/api/v1", tags=["weather"])

OPENWEATHERMAP_API_KEY = os.getenv("OPENWEATHERMAP_API_KEY")

@router.get("/weather/{city}")
def get_weather(city: str):
    """
    Fetch current weather data for a given city from OpenWeatherMap API.
    
    Args:
        city: The name of the city to get weather for.
        
    Returns:
        dict: The raw JSON response from OpenWeatherMap.
        
    Raises:
        HTTPException: If the API key is missing or the API request fails.
    """
    if not OPENWEATHERMAP_API_KEY:
        raise HTTPException(status_code=500, detail="OpenWeatherMap API key not configured")
    
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={OPENWEATHERMAP_API_KEY}&units=metric"
    response = requests.get(url)
    
    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail=f"Error fetching weather data: {response.text}")
