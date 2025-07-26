from fastapi import APIRouter, HTTPException, Body
from google.cloud import firestore
from datetime import datetime
# If you have Gemini/Vertex AI, import here
# from tools.gcp_llm import query_gemini
from agents.alert import AlertAgent
from google.cloud import texttospeech
import base64
from agents.tts import TTSAgent

router = APIRouter()
db = firestore.Client()
alert_agent = AlertAgent()
tts_agent = TTSAgent()

@router.get("/emergency_contacts")
def get_emergency_contacts():
    print("[API] GET /emergency_contacts")
    docs = db.collection("emergency_contacts").stream()
    contacts = [doc.to_dict() | {"id": doc.id} for doc in docs]
    return {"emergency_contacts": contacts}

@router.get("/emergency_contacts/{contact_id}")
def get_emergency_contact_by_id(contact_id: str):
    print(f"[API] GET /emergency_contacts/{contact_id}")
    doc = db.collection("emergency_contacts").document(contact_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Contact not found")
    return doc.to_dict() | {"id": doc.id}

@router.get("/emergency_contacts/type/{contact_type}")
def get_emergency_contacts_by_type(contact_type: str):
    print(f"[API] GET /emergency_contacts/type/{contact_type}")
    docs = db.collection("emergency_contacts").where("type", "==", contact_type).stream()
    contacts = [doc.to_dict() | {"id": doc.id} for doc in docs]
    return {"emergency_contacts": contacts}

@router.get("/emergency_contacts/status/{is_active}")
def get_emergency_contacts_by_status(is_active: bool):
    print(f"[API] GET /emergency_contacts/status/{is_active}")
    docs = db.collection("emergency_contacts").where("isActive", "==", is_active).stream()
    contacts = [doc.to_dict() | {"id": doc.id} for doc in docs]
    return {"emergency_contacts": contacts}

@router.post("/send_alert")
def send_alert(payload: dict = Body(...)):
    try:
        result = alert_agent.send_alert(
            alertType=payload.get("alertType"),
            target=payload.get("zoneId"),
            language=payload.get("language", "en"),
            message=payload.get("message"),
            severity=payload.get("severity", 0),
        )
        return result
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.post("/generate_alert_message")
def generate_alert_message(payload: dict = Body(...)):
    try:
        result = alert_agent.generate_alert_message(
            alertType=payload.get("alertType", "general"),
            target=payload.get("target", "all"),
            language=payload.get("language", "en"),
        )
        return result
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.post("/text_to_speech")
def text_to_speech(payload: dict = Body(...)):
    text = payload.get("text")
    language = payload.get("language", "en-US")
    voice_name = payload.get("voice", None)
    if not text:
        return {"success": False, "error": "Missing text"}
    try:
        result = tts_agent.synthesize_speech(text, language, voice_name)
        return result
    except Exception as e:
        return {"success": False, "error": str(e)} 