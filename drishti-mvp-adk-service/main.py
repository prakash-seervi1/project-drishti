from fastapi import FastAPI
from pydantic import BaseModel
from typing import Any, Dict
import requests
from fastapi.middleware.cors import CORSMiddleware
from incidents import router as incidents_router
from responders import router as responders_router
from zones import router as zones_router
from venues import router as venues_router
from emergency_contacts import router as emergency_contacts_router
from chat_agent import router as chat_agent_router
from analyze_with_gemini import router as gemini_router
from analyze_with_vertex_vision import router as vertex_vision_router
from get_signed_upload_url import router as upload_url_router
from dotenv import load_dotenv
from agent_orchestrator import router as agent_orchestrator_router
load_dotenv()

NODE_BACKEND_URL = "http://localhost:5001"  # Update this to your Node.js backend URL

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify your frontend URL for more security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(incidents_router)
app.include_router(responders_router)
app.include_router(zones_router)
app.include_router(venues_router)
app.include_router(emergency_contacts_router)
app.include_router(chat_agent_router)
app.include_router(gemini_router)
app.include_router(vertex_vision_router)
app.include_router(upload_url_router)
app.include_router(agent_orchestrator_router)

# --- TOOL: Create Incident ---
def create_incident_tool(incident_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calls the Node.js backend to create an incident.
    """
    url = f"{NODE_BACKEND_URL}/incidents"  # Update with actual endpoint
    try:
        response = requests.post(url, json=incident_data)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {"error": str(e)}

# Placeholder for ADK agent setup
def run_agent(user_input: str) -> Dict[str, Any]:
    # TODO: Integrate Google ADK agent logic here
    # For now, just echo the input
    return {"response": f"Agent received: {user_input}"}

class AgentRequest(BaseModel):
    input: str
    # Optionally, allow passing incident data for testing
    incident_data: Dict[str, Any] = None

@app.post("/agent")
async def agent_endpoint(request: AgentRequest):
    # Example: If incident_data is provided, call the tool
    if request.incident_data:
        result = create_incident_tool(request.incident_data)
        return result
    # Otherwise, just run the agent placeholder
    result = run_agent(request.input)
    return result 