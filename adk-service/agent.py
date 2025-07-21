from fastapi import APIRouter, HTTPException, status, Body
from tools.llm import query_gemini
from tools.firestore_utils import get_all_documents

router = APIRouter()

@router.post("/agent/chat")
def agent_chat(payload: dict = Body(...)):
    user_message = payload.get("message")
    if not user_message:
        raise HTTPException(status_code=400, detail="Missing message")

    # Fetch relevant data from Firestore
    incidents = get_all_documents("incidents")
    responders = get_all_documents("responders")
    zones = get_all_documents("zones")
    emergency_contacts = get_all_documents("emergency_contacts")

    # Build context string (truncate for prompt size)
    context = f"Incidents: {incidents[:3]}\nResponders: {responders[:3]}\nZones: {zones[:3]}\nEmergency Contacts: {emergency_contacts[:3]}"
    prompt = f"You are an AI safety assistant for an event. Use ONLY the following data to answer.\n{context}\nUser: {user_message}\nAssistant:"

    try:
        response = query_gemini(prompt)
        return {"success": True, "response": response, "context": context}
    except Exception as e:
        return {"success": False, "error": str(e)} 