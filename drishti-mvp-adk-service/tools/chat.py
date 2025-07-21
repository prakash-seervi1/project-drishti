# Chat agent tool functions
import os
from google.cloud import aiplatform, firestore
import json
from typing import Dict, Any

PROJECT = os.getenv("GCP_PROJECT")
LOCATION = os.getenv("GCP_REGION", "us-central1")
MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-pro")
db = firestore.Client()

def chat_agent_tool(request: Dict[str, Any]) -> Dict[str, Any]:
    user_input = request.get("input", "")
    if not user_input:
        raise ValueError("Input is required.")
    # Step 1: Analyze query with Gemini
    aiplatform.init(project=PROJECT, location=LOCATION)
    model = aiplatform.TextGenerationModel.from_pretrained(MODEL)
    prompt = f"""
You are an AI assistant analyzing user queries for a safety monitoring system. ... (same as before)
User Query: \"{user_input}\"
... (rest of the prompt)
"""
    response = model.predict(prompt)
    try:
        output = response.text
        output = output.replace("```json", "").replace("```", "").strip()
        analysis = json.loads(output)
    except Exception as e:
        analysis = None
    if not analysis:
        # fallback logic (copy from chat_agent.py)
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
    # Fetch context data, summarize, and generate response (copy from chat_agent.py)
    # ...
    return {"success": True, "response": "...", "context": analysis.get("contextType"), "analysisMethod": "gemini"} 