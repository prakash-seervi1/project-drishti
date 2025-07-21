import os
from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import vertexai
from vertexai.generative_models import GenerativeModel, FunctionDeclaration, Tool, Part
from google.cloud import firestore
import json
import requests
from tools.incidents import get_incidents_tool
from tools.zones import get_zones_tool
from tools.responders import get_responders_tool
from tools.emergency_contacts import get_contacts_tool

router = APIRouter()

PROJECT = os.getenv("GCP_PROJECT")
LOCATION = os.getenv("GCP_REGION", "us-central1")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-pro")

firestore_db = firestore.Client()

# --- Helper: Analyze Query with Gemini ---
def analyze_query_with_gemini(query: str) -> dict:
    vertexai.init(project=PROJECT, location=LOCATION)
    model = GenerativeModel(GEMINI_MODEL)
    prompt = f"""
You are an AI assistant analyzing user queries for a safety monitoring system. 

Available data collections:
- incidents: emergency incidents with type, status, priority, zone, timestamp
- zones: areas with name, status, capacity (currentOccupancy/maxOccupancy)
- responders: emergency personnel with type, status, assignedIncident
- emergency_contacts: contact information
- analytics: system statistics

User Query: \"{query}\"

Analyze this query and return a JSON object with the following structure:
{{
  "contextType": "incidents|zones|responders|contacts|analytics|general",
  "needsIncidents": boolean,
  "needsZones": boolean, 
  "needsResponders": boolean,
  "needsContacts": boolean,
  "needsAnalytics": boolean,
  "specificFilters": {{
    "status": "active|resolved|investigating",
    "priority": "critical|high|medium|low", 
    "zone": "Zone A|Zone B|Zone C",
    "type": "fire|medical|security|panic"
  }},
  "intent": "incident_analysis|zone_analysis|responder_analysis|analytics|safety_recommendations|general",
  "suggestedSearches": [
    "additional search terms or filters that might be relevant"
  ]
}}

Only include fields that are relevant based on the query. Be intelligent about what data would be most helpful.
Return ONLY the JSON object, no other text.
"""
    response = model.generate_content([Part.from_text(prompt)])
    text = response.text.replace("```json", "").replace("```", "").strip()
    try:
        analysis = json.loads(text)
        return analysis
    except Exception as e:
        print("Gemini query analysis failed, falling back. Raw:", text)
        return None

# --- Fallback Manual Query Analysis ---
def analyze_query(query: str) -> dict:
    lower_query = query.lower()
    analysis = {
        "contextType": "general",
        "needsIncidents": False,
        "needsZones": False,
        "needsResponders": False,
        "needsContacts": False,
        "needsAnalytics": False,
        "specificFilters": {},
        "intent": "general"
    }
    if any(word in lower_query for word in ["incident", "emergency", "fire", "medical", "security", "panic"]):
        analysis["contextType"] = "incidents"
        analysis["needsIncidents"] = True
        analysis["intent"] = "incident_analysis"
        if "active" in lower_query: analysis["specificFilters"]["status"] = "active"
        if "critical" in lower_query: analysis["specificFilters"]["priority"] = "critical"
        if "zone a" in lower_query: analysis["specificFilters"]["zone"] = "Zone A"
        if "zone b" in lower_query: analysis["specificFilters"]["zone"] = "Zone B"
        if "zone c" in lower_query: analysis["specificFilters"]["zone"] = "Zone C"
    if any(word in lower_query for word in ["zone", "occupancy", "crowd", "capacity", "sensor"]):
        analysis["contextType"] = "zones"
        analysis["needsZones"] = True
        analysis["intent"] = "zone_analysis"
    if any(word in lower_query for word in ["responder", "personnel", "help", "team"]):
        analysis["contextType"] = "responders"
        analysis["needsResponders"] = True
        analysis["intent"] = "responder_analysis"
    if any(word in lower_query for word in ["contact", "emergency contact", "phone", "number"]):
        analysis["contextType"] = "contacts"
        analysis["needsContacts"] = True
        analysis["intent"] = "contacts"
    if any(word in lower_query for word in ["statistic", "overview", "analytics", "summary"]):
        analysis["contextType"] = "analytics"
        analysis["needsAnalytics"] = True
        analysis["intent"] = "analytics"
    return analysis

# --- Fetch Context Data ---
def fetch_context_data(analysis: dict) -> dict:
    data = {}
    if analysis.get("needsIncidents"):
        incidents = [ {"id": doc.id, **doc.to_dict()} for doc in firestore_db.collection("incidents").stream() ]
        data["incidents"] = incidents
    if analysis.get("needsZones"):
        zones = [ {"id": doc.id, **doc.to_dict()} for doc in firestore_db.collection("zones").stream() ]
        data["zones"] = zones
    if analysis.get("needsResponders"):
        responders = [ {"id": doc.id, **doc.to_dict()} for doc in firestore_db.collection("responders").stream() ]
        data["responders"] = responders
    if analysis.get("needsContacts"):
        contacts = [ {"id": doc.id, **doc.to_dict()} for doc in firestore_db.collection("emergency_contacts").stream() ]
        data["contacts"] = contacts
    # Analytics can be computed here if needed
    return data

# --- Generate Final Response with Gemini ---
def generate_intelligent_response_with_gemini(query: str, context_data: dict, analysis: dict) -> str:
    vertexai.init(project=PROJECT, location=LOCATION)
    model = GenerativeModel(GEMINI_MODEL)
    context_text = json.dumps(context_data, indent=2)
    prompt = f"""{query}\n\nContext:\n{context_text}"""
    response = model.generate_content([Part.from_text(prompt)])
    return response.text.strip()

# --- Tool registration for Gemini ---
tool_declarations = [
    FunctionDeclaration(
        name="get_incidents_tool",
        description="Get incidents from Firestore. Optional filters: status, priority, zone, limit.",
        parameters={
            "type": "object",
            "properties": {
                "status": {"type": "string"},
                "priority": {"type": "string"},
                "zone": {"type": "string"},
                "limit": {"type": "integer"}
            },
        },
    ),
    FunctionDeclaration(
        name="get_zones_tool",
        description="Get zones from Firestore. Optional filters: status, limit.",
        parameters={
            "type": "object",
            "properties": {
                "status": {"type": "string"},
                "limit": {"type": "integer"}
            },
        },
    ),
    FunctionDeclaration(
        name="get_responders_tool",
        description="Get responders from Firestore. Optional filters: status, type, limit.",
        parameters={
            "type": "object",
            "properties": {
                "status": {"type": "string"},
                "type": {"type": "string"},
                "limit": {"type": "integer"}
            },
        },
    ),
    FunctionDeclaration(
        name="get_contacts_tool",
        description="Get emergency contacts from Firestore. Optional filter: limit.",
        parameters={
            "type": "object",
            "properties": {
                "limit": {"type": "integer"}
            },
        },
    ),
]

adk_tools = [
    Tool(function_declarations=tool_declarations)
]

tool_functions = {
    "get_incidents_tool": get_incidents_tool,
    "get_zones_tool": get_zones_tool,
    "get_responders_tool": get_responders_tool,
    "get_contacts_tool": get_contacts_tool,
}

# --- Helper to robustly extract text from Gemini response ---
# --- Helper to robustly extract text from Gemini response ---
def extract_text(response):
    full_text_parts = []

    # First, try to get text directly from the top-level response object
    try:
        if response.text: # Check if text attribute exists and is not empty
            return response.text
    except ValueError as e:
        # If it's the "Multiple content parts" error, we'll handle it by iterating parts
        if "Multiple content parts are not supported" not in str(e):
            raise e # Re-raise if it's a different ValueError
    except Exception:
        # Catch any other general exceptions when accessing response.text
        pass

    # If direct response.text failed or indicated multiple parts,
    # iterate through candidates and their content parts.
    if hasattr(response, "candidates"):
        for candidate in response.candidates:
            if hasattr(candidate, "content") and hasattr(candidate.content, "parts"):
                for part in candidate.content.parts:
                    if hasattr(part, "text"):
                        full_text_parts.append(part.text)
                    # If there's other types of parts (e.g., function call, image),
                    # you might want to handle them here if needed,
                    # but for extracting "text", we only care about text parts.

    if full_text_parts:
        return "".join(full_text_parts)

    # Fallback: if no text could be extracted through parts,
    # try converting the whole response or its first candidate to a string.
    # This is less ideal but provides a last resort.
    if hasattr(response, 'candidates') and response.candidates:
        return str(response.candidates[0])
    
    return str(response)

@router.post("/agent")
def agent_orchestrator(request: Dict):
    user_query = request.get("input")
    if not user_query:
        raise HTTPException(status_code=400, detail="Query parameter 'input' is required.")
    # 1. Analyze query with Gemini (with fallback)
    gemini_analysis = analyze_query_with_gemini(user_query)
    analysis = gemini_analysis or analyze_query(user_query)
    # 2. Fetch context data
    context_data = fetch_context_data(analysis)
    # 3. Generate intelligent response with Gemini
    response = generate_intelligent_response_with_gemini(user_query, context_data, analysis)
    return {
        "success": True,
        "response": response,
        "context": analysis.get("contextType"),
        "analysisMethod": "gemini" if gemini_analysis else "fallback"
    } 

@router.post("/agentic")
def agentic_orchestrator(request: Dict):
    user_query = request.get("input")
    if not user_query:
        raise HTTPException(status_code=400, detail="Query parameter 'input' is required.")
    vertexai.init(project=PROJECT, location=LOCATION)
    model = GenerativeModel(GEMINI_MODEL, tools=adk_tools)
    system_prompt = (
        "You are a safety monitoring AI agent. You have access to real-time data via tools. "
        "Always use the tools to get numbers, lists, or facts. Never make up data. "
        "Respond in the format the user requests: chat, summary, recommendations, or structured data. "
        "If the user asks for a summary, provide a readable summary. If they ask for recommendations, provide actionable advice. "
        "If they want a chat, respond conversationally."
    )
    # Remove system_instruction and tool_config from start_chat()
    full_prompt = f"{system_prompt}\n\n{user_query}"
    response = model.generate_content(full_prompt)
    tool_calls = getattr(response, "function_calls", [])
    tool_results = {}
    # If the agent called tools, execute them and send results back to the model
    if tool_calls:
        for call in tool_calls:
            func = tool_functions.get(call.name)
            if func:
                tool_results[call.name] = func(**call.args)
        # Send tool outputs back to the model to get the final response
        # The method may be send_message or send_tool_outputs depending on SDK version
        try:
            response = model.send_message(tool_outputs=tool_results)
        except Exception:
            try:
                response = model.send_tool_outputs(tool_results)
            except Exception as e:
                print("Failed to send tool outputs:", e)
    final_text = extract_text(response)
    return {
        "response": final_text,
        "tool_results": tool_results,
        "raw": response.candidates[0].__dict__ if hasattr(response, 'candidates') else None
    } 