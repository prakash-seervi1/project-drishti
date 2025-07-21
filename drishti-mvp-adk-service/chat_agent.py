# chat_agent.py
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Dict
import vertexai
from vertexai.generative_models import (
    GenerativeModel,
    GenerationConfig,
    FunctionDeclaration,
    Tool,
    HarmBlockThreshold,
    HarmCategory,
    SafetySetting,
)
from tools import (
    create_incident_tool,
    get_incidents_tool as get_incident_data,
    get_zones_tool as get_zone_data,
    get_responders_tool as get_responder_data,
    get_contacts_tool as get_emergency_contacts_data,
    get_incident_analytics_tool as get_analytics_summary,
)

# Initialize Vertex AI
vertexai.init(project=os.getenv("GCP_PROJECT"), location=os.getenv("GCP_REGION", "us-central1"))

# Manually define function declarations for each tool
incident_tool = Tool(function_declarations=[
    FunctionDeclaration(
        name="create_incident_tool",
        description="Create a new incident in the safety monitoring system.",
        parameters={
            "type": "object",
            "properties": {
                "type": {"type": "string"},
                "zoneId": {"type": "string"},
                "description": {"type": "string"},
                "priority": {"type": "string"},
                "status": {"type": "string"},
            },
            "required": ["type", "zoneId", "description", "priority", "status"]
        }
    ),
    FunctionDeclaration(
        name="get_incident_data",
        description="Get incidents with optional filters.",
        parameters={
            "type": "object",
            "properties": {
                "status": {"type": "string"},
                "priority": {"type": "string"},
                "type": {"type": "string"},
                "zoneId": {"type": "string"},
                "limit": {"type": "integer"},
            },
        }
    ),
    FunctionDeclaration(
        name="get_zone_data",
        description="Get zones with optional filters.",
        parameters={
            "type": "object",
            "properties": {
                "zoneId": {"type": "string"},
                "status": {"type": "string"},
                "limit": {"type": "integer"},
            },
        }
    ),
    FunctionDeclaration(
        name="get_responder_data",
        description="Get responders with optional filters.",
        parameters={
            "type": "object",
            "properties": {
                "status": {"type": "string"},
                "responder_type": {"type": "string"},
                "assigned_incident_id": {"type": "string"},
                "limit": {"type": "integer"},
            },
        }
    ),
    FunctionDeclaration(
        name="get_emergency_contacts_data",
        description="Get emergency contacts with optional filters.",
        parameters={
            "type": "object",
            "properties": {
                "contact_type": {"type": "string"},
                "limit": {"type": "integer"},
            },
        }
    ),
    FunctionDeclaration(
        name="get_analytics_summary",
        description="Get analytics summary.",
        parameters={
            "type": "object",
            "properties": {},
        }
    ),
])

# Set up the model with tools and config
model = GenerativeModel(
    os.getenv("GEMINI_MODEL", "gemini-2.5-pro"),
    tools=[incident_tool],
    generation_config=GenerationConfig(temperature=0.0),
)

# Safety settings (optional, recommended)
safety_settings = [
    SafetySetting(category=HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold=HarmBlockThreshold.BLOCK_NONE),
    SafetySetting(category=HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold=HarmBlockThreshold.BLOCK_NONE),
    SafetySetting(category=HarmCategory.HARM_CATEGORY_HARASSMENT, threshold=HarmBlockThreshold.BLOCK_NONE),
    SafetySetting(category=HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold=HarmBlockThreshold.BLOCK_NONE),
]

router = APIRouter()

class ChatRequest(BaseModel):
    user_input: str

@router.post("/chat")
async def chat_with_agent(request: ChatRequest):
    user_input = request.user_input
    if not user_input:
        raise HTTPException(status_code=400, detail="User input is required.")
    try:
        # Start a chat session
        chat = model.start_chat()
        response = chat.send_message(user_input, safety_settings=safety_settings)
        return {"response": response.text}
    except Exception as e:
        return {"response": f"Sorry, I encountered an error: {e}"}

