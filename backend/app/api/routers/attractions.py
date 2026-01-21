from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/v1", tags=["attractions"])

ATTRACTIONS = {
    "new york": {
        "attractions": [
            { "name": "Central Park", "type": "park", "rating": 4.9 },
            { "name": "Statue of Liberty", "type": "landmark", "rating": 4.7 },
            { "name": "Times Square", "type": "landmark", "rating": 4.6 },
            { "name": "Metropolitan Museum of Art", "type": "museum", "rating": 4.8 }
        ]
    },
    "paris": {
        "attractions": [
            { "name": "Eiffel Tower", "type": "landmark", "rating": 4.8 },
            { "name": "Louvre Museum", "type": "museum", "rating": 4.7 },
            { "name": "Notre-Dame Cathedral", "type": "religious", "rating": 4.6 },
            { "name": "Montmartre", "type": "culture", "rating": 4.7 }
        ]
    },
    "london": {
        "attractions": [
            { "name": "British Museum", "type": "museum", "rating": 4.7 },
            { "name": "Tower of London", "type": "historic", "rating": 4.6 },
            { "name": "London Eye", "type": "landmark", "rating": 4.5 },
            { "name": "Buckingham Palace", "type": "landmark", "rating": 4.6 }
        ]
    },
    "tokyo": {
        "attractions": [
            { "name": "Senso-ji Temple", "type": "religious", "rating": 4.8 },
            { "name": "Tokyo Tower", "type": "landmark", "rating": 4.6 },
            { "name": "Shinjuku Gyoen National Garden", "type": "park", "rating": 4.7 },
            { "name": "Meiji Shrine", "type": "religious", "rating": 4.8 }
        ]
    },
    "barcelona": {
        "attractions": [
            { "name": "Sagrada Familia", "type": "landmark", "rating": 4.9 },
            { "name": "Camp Nou (Stadium)", "type": "sports", "rating": 4.8 },
            { "name": "Gothic Quarter", "type": "culture", "rating": 4.7 },
            { "name": "Park Güell", "type": "park", "rating": 4.8 }
        ]
    },
    "berlin": {
        "attractions": [
            { "name": "Brandenburg Gate", "type": "landmark", "rating": 4.7 },
            { "name": "Berlin Wall Memorial", "type": "historic", "rating": 4.6 },
            { "name": "Museum Island", "type": "museum", "rating": 4.8 },
            { "name": "Reichstag Building", "type": "historic", "rating": 4.7 }
        ]
    },
    "rome": {
        "attractions": [
            { "name": "Colosseum", "type": "historic", "rating": 4.8 },
            { "name": "Roman Forum", "type": "historic", "rating": 4.7 },
            { "name": "Vatican Museums", "type": "museum", "rating": 4.8 },
            { "name": "Trevi Fountain", "type": "landmark", "rating": 4.6 }
        ]
    },
    "sydney": {
        "attractions": [
            { "name": "Sydney Opera House", "type": "landmark", "rating": 4.8 },
            { "name": "Sydney Harbour Bridge", "type": "landmark", "rating": 4.7 },
            { "name": "Bondi Beach", "type": "beach", "rating": 4.6 },
            { "name": "Taronga Zoo", "type": "zoo", "rating": 4.7 }
        ]
    },
    "dubai": {
        "attractions": [
            { "name": "Burj Khalifa", "type": "landmark", "rating": 4.8 },
            { "name": "Dubai Mall", "type": "shopping", "rating": 4.7 },
            { "name": "Palm Jumeirah", "type": "landmark", "rating": 4.6 },
            { "name": "Desert Safari", "type": "experience", "rating": 4.7 }
        ]
    },
    "mumbai": {
        "attractions": [
            { "name": "Gateway of India", "type": "landmark", "rating": 4.6 },
            { "name": "Marine Drive", "type": "landmark", "rating": 4.7 },
            { "name": "Elephanta Caves", "type": "historic", "rating": 4.5 },
            { "name": "Chhatrapati Shivaji Maharaj Terminus", "type": "historic", "rating": 4.7 }
        ]
    },
    "toronto": {
        "attractions": [
            { "name": "CN Tower", "type": "landmark", "rating": 4.7 },
            { "name": "Royal Ontario Museum", "type": "museum", "rating": 4.6 },
            { "name": "Toronto Islands", "type": "park", "rating": 4.7 },
            { "name": "Distillery Historic District", "type": "culture", "rating": 4.6 }
        ]
    }
}

@router.get("/attractions/{city}")
def get_attractions(city: str):
    """
    Get top tourist attractions for a given city from the local database.
    
    Args:
        city: The name of the city.
        
    Returns:
        dict: List of attractions with types and ratings.
        
    Raises:
        HTTPException: If the city is not found in the database.
    """
    city_lower = city.lower()
    if city_lower in ATTRACTIONS:
        return ATTRACTIONS[city_lower]
    else:
        raise HTTPException(status_code=404, detail="City not found in attractions database")
