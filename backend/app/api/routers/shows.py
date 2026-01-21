from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/v1", tags=["shows"])

SHOWS = {
    "new york": {
        "day": "Friday",
        "shows": [
            { "name": "The Lion King", "type": "musical", "time": "20:00", "price": 100 },
            { "name": "Hamilton", "type": "musical", "time": "19:00", "price": 150 },
            { "name": "Wicked", "type": "musical", "time": "19:30", "price": 95 },
            { "name": "Chicago", "type": "musical", "time": "20:30", "price": 85 },
            { "name": "NBA: Knicks vs Celtics", "type": "sports", "time": "18:00", "price": 70 }
        ]
    },
    "paris": {
        "day": "Saturday",
        "shows": [
            { "name": "Moulin Rouge", "type": "cabaret", "time": "21:00", "price": 120 },
            { "name": "Opera Garnier", "type": "opera", "time": "19:30", "price": 80 },
            { "name": "Louvre Night Tour", "type": "exhibition", "time": "18:30", "price": 25 },
            { "name": "Paris Jazz Club", "type": "concert", "time": "20:00", "price": 40 },
            { "name": "Comédie-Française", "type": "theatre", "time": "19:00", "price": 60 }
        ]
    },
    "london": {
        "day": "Thursday",
        "shows": [
            { "name": "The Phantom of the Opera", "type": "musical", "time": "19:30", "price": 60 },
            { "name": "Les Miserables", "type": "musical", "time": "19:30", "price": 55 },
            { "name": "The Book of Mormon", "type": "musical", "time": "20:00", "price": 75 },
            { "name": "West End Comedy Night", "type": "comedy", "time": "21:00", "price": 35 },
            { "name": "Arsenal vs Chelsea", "type": "sports", "time": "18:30", "price": 65 }
        ]
    },
    "tokyo": {
        "day": "Sunday",
        "shows": [
            { "name": "Kabuki-za Theatre", "type": "theatre", "time": "18:00", "price": 40 },
            { "name": "Sumo Wrestling", "type": "sports", "time": "14:00", "price": 30 },
            { "name": "Tokyo Philharmonic", "type": "concert", "time": "19:00", "price": 50 },
            { "name": "Anime Film Festival", "type": "movie", "time": "20:00", "price": 15 },
            { "name": "Shibuya Live House", "type": "concert", "time": "21:30", "price": 35 }
        ]
    },
    "barcelona": {
        "day": "Saturday",
        "shows": [
            { "name": "FC Barcelona vs Real Madrid", "type": "sports", "time": "20:45", "price": 45 },
            { "name": "Dune: Part Two - Cinema Renoir", "type": "movie", "time": "19:30", "price": 12 },
            { "name": "Flamenco Night", "type": "dance", "time": "21:00", "price": 30 },
            { "name": "Barcelona Jazz Festival", "type": "concert", "time": "20:00", "price": 35 },
            { "name": "Teatre Lliure Play", "type": "theatre", "time": "19:00", "price": 28 }
        ]
    },
    "berlin": {
        "day": "Friday",
        "shows": [
            { "name": "Berlin Philharmonic", "type": "concert", "time": "20:00", "price": 55 },
            { "name": "Berghain Night", "type": "club", "time": "23:59", "price": 25 },
            { "name": "Brecht Theatre", "type": "theatre", "time": "19:30", "price": 40 },
            { "name": "Bundesliga Match", "type": "sports", "time": "18:30", "price": 50 },
            { "name": "Silent Disco", "type": "party", "time": "21:00", "price": 20 }
        ]
    },
    "rome": {
        "day": "Wednesday",
        "shows": [
            { "name": "Colosseum Night Tour", "type": "tour", "time": "20:00", "price": 30 },
            { "name": "Italian Opera Night", "type": "opera", "time": "19:00", "price": 70 },
            { "name": "AS Roma Match", "type": "sports", "time": "20:45", "price": 55 },
            { "name": "Classical Guitar Concert", "type": "concert", "time": "18:30", "price": 25 },
            { "name": "Open-Air Cinema", "type": "movie", "time": "21:30", "price": 10 }
        ]
    },
    "sydney": {
        "day": "Sunday",
        "shows": [
            { "name": "Sydney Opera House Performance", "type": "opera", "time": "19:30", "price": 90 },
            { "name": "Harbour Night Cruise", "type": "tour", "time": "20:00", "price": 45 },
            { "name": "Stand-up Comedy", "type": "comedy", "time": "21:00", "price": 30 },
            { "name": "Live Rock Concert", "type": "concert", "time": "19:00", "price": 50 },
            { "name": "Rugby League Match", "type": "sports", "time": "18:00", "price": 40 }
        ]
    },
    "dubai": {
        "day": "Thursday",
        "shows": [
            { "name": "Desert Safari Show", "type": "experience", "time": "18:00", "price": 60 },
            { "name": "Burj Khalifa Sky Lounge", "type": "experience", "time": "20:00", "price": 80 },
            { "name": "Dubai Opera Concert", "type": "concert", "time": "19:30", "price": 70 },
            { "name": "Luxury Yacht Party", "type": "party", "time": "21:00", "price": 100 },
            { "name": "IMAX Movie Night", "type": "movie", "time": "22:00", "price": 20 }
        ]
    },
    "mumbai": {
        "day": "Tuesday",
        "shows": [
            { "name": "Bollywood Movie Premiere", "type": "movie", "time": "21:00", "price": 15 },
            { "name": "Stand-up Comedy India", "type": "comedy", "time": "20:00", "price": 12 },
            { "name": "Live Classical Music", "type": "concert", "time": "19:00", "price": 10 },
            { "name": "IPL Match", "type": "sports", "time": "19:30", "price": 25 },
            { "name": "Prithvi Theatre Play", "type": "theatre", "time": "18:30", "price": 8 }
        ]
    },
    "toronto": {
        "day": "Monday",
        "shows": [
            { "name": "Toronto Symphony Orchestra", "type": "concert", "time": "19:30", "price": 60 },
            { "name": "NBA: Raptors Game", "type": "sports", "time": "19:00", "price": 55 },
            { "name": "Indie Film Screening", "type": "movie", "time": "20:00", "price": 14 },
            { "name": "Comedy Club Night", "type": "comedy", "time": "21:30", "price": 25 },
            { "name": "Art Gallery Opening", "type": "exhibition", "time": "18:00", "price": 20 }
        ]
    }
}

@router.get("/shows/{city}")
def get_shows(city: str):
    """
    Get current events and shows for a given city from the local database.
    
    Args:
        city: The name of the city.
        
    Returns:
        dict: List of shows with types, times, and prices.
        
    Raises:
        HTTPException: If the city is not found in the database.
    """
    city_lower = city.lower()
    if city_lower in SHOWS:
        return SHOWS[city_lower]
    else:
        raise HTTPException(status_code=404, detail="City not found in shows database")
