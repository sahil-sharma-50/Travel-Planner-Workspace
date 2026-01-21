import json
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from backend.app.api.routers import weather, attractions, shows
from backend.app.services.agent import run_agent_stream
from backend.app.models.agent import AgentRequest

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Travel Agent API",
    description="Full-stack AI Travel Planner Backend",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(weather.router)
app.include_router(attractions.router)
app.include_router(shows.router)

# In-memory session storage (In production, use Redis or a database)
sessions = {}

@app.get("/api/v1/knowledge")
def get_knowledge():
    """
    Retrieve user knowledge and preferences from knowledge.json.
    """
    try:
        with open('backend/knowledge.json', 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error reading knowledge.json: {e}")
        return {"user": {"name": "User", "preferences": {"interests": [], "description": ""}}}

@app.post("/api/v1/plan_tour")
def plan_tour(request: AgentRequest):
    """
    Main endpoint for travel planning. Returns a stream of events including status updates,
    plans, the final result, and client-side actions.
    """
    session_id = request.session_id or "default"
    
    # Get or create session history
    if session_id not in sessions:
        sessions[session_id] = []
    
    conversation_history = sessions[session_id]
    
    logger.info(f"Received planning request for session {session_id}")
    
    # Stream response with conversation history
    return StreamingResponse(
        run_agent_stream(
            request.prompt, 
            conversation_history, 
            session_id, 
            sessions, 
            is_planning_only=request.is_planning_only
        ),
        media_type="application/x-ndjson"
    )

@app.get("/health")
def health_check():
    """Simple health check endpoint."""
    return {"status": "healthy", "service": "Travel Agent Backend"}

@app.get("/")
def read_root():
    """Welcome message."""
    return {"message": "Travel Agent Backend is running. Visit /docs for API documentation."}
