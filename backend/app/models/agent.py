from pydantic import BaseModel
from typing import Optional

class AgentRequest(BaseModel):
    """
    Pydantic model for agent requests.
    
    Attributes:
        prompt: The user's travel query.
        session_id: Unique identifier for the conversation session.
        is_planning_only: Flag to indicate if only planning is required.
    """
    prompt: str
    session_id: Optional[str] = None
    is_planning_only: bool = False
