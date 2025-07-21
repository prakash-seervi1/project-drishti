from google.cloud import firestore
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from datetime import datetime

router = APIRouter()
db = firestore.Client()

VALID_RESPONDER_TYPES = [
    "Fire Brigade", "Medical", "Security", "Police", "Ambulance", "Technical"
]
VALID_RESPONDER_STATUSES = [
    "available", "en_route", "on_scene", "unavailable", "off_duty"
]

def validate_responder(data: Dict[str, Any]) -> List[str]:
    errors = []
    if not data.get("name"): errors.append("Responder name is required")
    if not data.get("type") or data["type"] not in VALID_RESPONDER_TYPES:
        errors.append(f"Responder type must be one of: {', '.join(VALID_RESPONDER_TYPES)}")
    if not data.get("status") or data["status"] not in VALID_RESPONDER_STATUSES:
        errors.append(f"Responder status must be one of: {', '.join(VALID_RESPONDER_STATUSES)}")
    return errors

@router.post("/responders")
def create_responder(responder: Dict[str, Any]):
    errors = validate_responder(responder)
    if errors:
        raise HTTPException(status_code=400, detail=errors)
    responder_data = responder.copy()
    responder_data["lastUpdate"] = datetime.utcnow()
    doc_ref = db.collection("responders").document()
    doc_ref.set(responder_data)
    return {"id": doc_ref.id, **responder_data}

@router.get("/responders")
def get_responders():
    docs = db.collection("responders").stream()
    responders = [{"id": doc.id, **doc.to_dict()} for doc in docs]
    return {"responders": responders}

@router.get("/responders/{responder_id}")
def get_responder_by_id(responder_id: str):
    doc = db.collection("responders").document(responder_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Responder not found")
    return {"id": doc.id, **doc.to_dict()}

@router.put("/responders/{responder_id}")
def update_responder(responder_id: str, updates: Dict[str, Any]):
    doc_ref = db.collection("responders").document(responder_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Responder not found")
    updates["lastUpdate"] = datetime.utcnow()
    doc_ref.update(updates)
    return {"id": responder_id, **updates}

@router.delete("/responders/{responder_id}")
def delete_responder(responder_id: str):
    doc_ref = db.collection("responders").document(responder_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Responder not found")
    doc_ref.delete()
    return {"success": True, "id": responder_id} 