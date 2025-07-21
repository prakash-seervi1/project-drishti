from google.cloud import firestore
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from datetime import datetime

router = APIRouter()
db = firestore.Client()

def validate_contact(data: Dict[str, Any]) -> List[str]:
    errors = []
    if not data.get("name"): errors.append("Contact name is required")
    if not data.get("type"): errors.append("Contact type is required")
    if not data.get("contact") or not isinstance(data["contact"], dict):
        errors.append("Contact details are required and must be a dict")
    return errors

@router.post("/emergency_contacts")
def create_contact(contact: Dict[str, Any]):
    errors = validate_contact(contact)
    if errors:
        raise HTTPException(status_code=400, detail=errors)
    contact_data = contact.copy()
    doc_ref = db.collection("emergency_contacts").document()
    doc_ref.set(contact_data)
    return {"id": doc_ref.id, **contact_data}

@router.get("/emergency_contacts")
def get_contacts():
    docs = db.collection("emergency_contacts").stream()
    contacts = [{"id": doc.id, **doc.to_dict()} for doc in docs]
    return {"contacts": contacts}

@router.get("/emergency_contacts/{contact_id}")
def get_contact_by_id(contact_id: str):
    doc = db.collection("emergency_contacts").document(contact_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"id": doc.id, **doc.to_dict()}

@router.put("/emergency_contacts/{contact_id}")
def update_contact(contact_id: str, updates: Dict[str, Any]):
    doc_ref = db.collection("emergency_contacts").document(contact_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Contact not found")
    doc_ref.update(updates)
    return {"id": contact_id, **updates}

@router.delete("/emergency_contacts/{contact_id}")
def delete_contact(contact_id: str):
    doc_ref = db.collection("emergency_contacts").document(contact_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Contact not found")
    doc_ref.delete()
    return {"success": True, "id": contact_id} 