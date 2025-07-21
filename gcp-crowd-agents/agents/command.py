import json
from utils.firestore_utils import get_collection
from tools.gcp_llm import query_gemini
import logging
import re
logger = logging.getLogger("CommandAgent")

def clean_firestore_data(obj):
    if isinstance(obj, dict):
        return {k: clean_firestore_data(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_firestore_data(i) for i in obj]
    elif hasattr(obj, 'isoformat'):
        return obj.isoformat()
    else:
        return obj

# Utility to extract JSON from Markdown code block
def extract_json_from_markdown(text):
    text = re.sub(r'^```json\s*', '', text.strip(), flags=re.IGNORECASE|re.MULTILINE)
    text = re.sub(r'^```\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'```$', '', text, flags=re.MULTILINE)
    return text.strip()

class CommandAgent:
    def __init__(self):
        pass

    def get_summary(self):
        incidents = [clean_firestore_data(doc.to_dict() | {"id": doc.id}) for doc in get_collection("incidents").stream()]
        zones = [clean_firestore_data(doc.to_dict() | {"id": doc.id}) for doc in get_collection("zones").stream()]
        responders = [clean_firestore_data(doc.to_dict() | {"id": doc.id}) for doc in get_collection("responders").stream()]
        alerts = [clean_firestore_data(doc.to_dict() | {"id": doc.id}) for doc in get_collection("alerts").stream()]
        prompt = (
            "You are an event command AI assistant.\n"
            "Summarize the current situation based on the following event data.\n"
            "Focus on critical incidents, crowd risks, medical emergencies, and responder availability.\n"
            "Respond ONLY with a JSON object: {\"summary\": string}.\n"
            f"Incidents: {json.dumps(incidents[:5])}\n"
            f"Zones: {json.dumps(zones[:5])}\n"
            f"Responders: {json.dumps(responders[:5])}\n"
            f"Alerts: {json.dumps(alerts[:5])}\n"
        )
        logger.info("[AICommand] Prompt to Gemini (summary):\n%s", prompt[:1000])
        response = query_gemini(prompt)
        logger.info("[AICommand] Gemini response (summary):\n%s", response[:1000])
        try:
            clean_response = extract_json_from_markdown(response)
            result = json.loads(clean_response)
            return {"success": True, "summary": result.get("summary", "")}
        except Exception as e:
            logger.error("[AICommand] Failed to parse Gemini response (summary): %s", e)
            return {"success": False, "error": f"Failed to parse AI response: {e}", "raw": response}

    def get_resource_recommendations(self):
        incidents = [clean_firestore_data(doc.to_dict() | {"id": doc.id}) for doc in get_collection("incidents").stream()]
        zones = [clean_firestore_data(doc.to_dict() | {"id": doc.id}) for doc in get_collection("zones").stream()]
        responders = [clean_firestore_data(doc.to_dict() | {"id": doc.id}) for doc in get_collection("responders").stream()]
        alerts = [clean_firestore_data(doc.to_dict() | {"id": doc.id}) for doc in get_collection("alerts").stream()]
        prompt = (
            "You are an event command AI assistant.\n"
            "For each zone or incident, assess if the currently available responders are sufficient.\n"
            "If more responders are needed, specify the number and type (e.g., fire, medical, security) in a resourceRecommendations list.\n"
            "Respond ONLY with a JSON object: {\"resourceRecommendations\": list of recommendations, each with zoneId or incidentId, needed (bool), and categories (list of {type, count, reason})}.\n"
            f"Incidents: {json.dumps(incidents[:5])}\n"
            f"Zones: {json.dumps(zones[:5])}\n"
            f"Responders: {json.dumps(responders[:5])}\n"
            f"Alerts: {json.dumps(alerts[:5])}\n"
        )
        logger.info("[AICommand] Prompt to Gemini (resources):\n%s", prompt[:1000])
        response = query_gemini(prompt)
        logger.info("[AICommand] Gemini response (resources):\n%s", response[:1000])
        try:
            clean_response = extract_json_from_markdown(response)
            result = json.loads(clean_response)
            return {"success": True, "resourceRecommendations": result.get("resourceRecommendations", [])}
        except Exception as e:
            logger.error("[AICommand] Failed to parse Gemini response (resources): %s", e)
            return {"success": False, "error": f"Failed to parse AI response: {e}", "raw": response}

    def get_command_actions(self):
        incidents = [clean_firestore_data(doc.to_dict() | {"id": doc.id}) for doc in get_collection("incidents").stream()]
        zones = [clean_firestore_data(doc.to_dict() | {"id": doc.id}) for doc in get_collection("zones").stream()]
        responders = [clean_firestore_data(doc.to_dict() | {"id": doc.id}) for doc in get_collection("responders").stream()]
        alerts = [clean_firestore_data(doc.to_dict() | {"id": doc.id}) for doc in get_collection("alerts").stream()]
        prompt = (
            "You are an event command AI assistant.\n"
            "Analyze ALL zones, incidents, responders, and alerts in the data below.\n"
            "For every zone or incident that requires attention, suggest a concrete action as a JSON object.\n"
            "If a zone or incident does NOT need any action, do NOT suggest anything for it.\n"
            "Prioritize actions by urgency and risk (most critical first).\n"
            "If you suggest a lockdown_zone action, also suggest dispatching available security responders to that zone if not already present.\n"
            "For dispatch_responder actions, always include responderName and responderType (category) in the parameters, in addition to responderId.\n"
            "Each action must have:\n"
            "  - type: one of ['dispatch_responder', 'send_alert', 'lockdown_zone']\n"
            "  - label: a short button label for the UI\n"
            "  - parameters: a dict with all required fields for the action type\n"
            "  - description: a short explanation of the action\n"
            "For each action type, use these parameter schemas:\n"
            "  - dispatch_responder: {responderId: string, responderName: string, responderType: string, zoneId: string, notes: string (optional)}\n"
            "  - send_alert: {target: string, alertType: string, message: string, language: string (optional)}\n"
            "  - lockdown_zone: {zoneId: string, reason: string}\n"
            "Return a JSON object with keys:\n"
            "  actions: prioritized list of actions (one per situation/zone/incident as needed, or empty if no action needed)\n"
            "Respond ONLY with valid JSON, no extra text.\n"
            "Example output:\n"
            "{\n"
            "  \"actions\": [\n"
            "    {\n"
            "      \"type\": \"dispatch_responder\",\n"
            "      \"label\": \"Dispatch Security: John Smith to Zone C\",\n"
            "      \"parameters\": {\"responderId\": \"responder_7\", \"responderName\": \"John Smith\", \"responderType\": \"Security\", \"zoneId\": \"zone_c\", \"notes\": \"Lockdown support\"},\n"
            "      \"description\": \"Send security responder John Smith to enforce lockdown in Zone C.\"\n"
            "    }\n"
            "  ]\n"
            "}\n"
            f"Incidents: {json.dumps(incidents[:5])}\n"
            f"Zones: {json.dumps(zones[:5])}\n"
            f"Responders: {json.dumps(responders[:5])}\n"
            f"Alerts: {json.dumps(alerts[:5])}\n"
        )
        logger.info("[AICommand] Prompt to Gemini (actions):\n%s", prompt[:1000])
        response = query_gemini(prompt)
        logger.info("[AICommand] Gemini response (actions):\n%s", response[:1000])
        try:
            clean_response = extract_json_from_markdown(response)
            result = json.loads(clean_response)
            return {"success": True, "actions": result.get("actions", [])}
        except Exception as e:
            logger.error("[AICommand] Failed to parse Gemini response (actions): %s", e)
            return {"success": False, "error": f"Failed to parse AI response: {e}", "raw": response} 