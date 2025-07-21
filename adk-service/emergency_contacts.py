from fastapi import APIRouter, HTTPException, status, Body
from fastapi.responses import JSONResponse
from firestore_client import get_firestore_client
from uuid import uuid4

router = APIRouter()

@router.get("/emergency-contacts")
def list_emergency_contacts():
    db = get_firestore_client()
    contacts_ref = db.collection("emergency_contacts")
    docs = contacts_ref.stream()
    contacts = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        contacts.append(data)
    return JSONResponse(content={"emergency_contacts": contacts})

@router.get("/emergency-contacts/{contact_id}")
def get_contact_by_id(contact_id: str):
    db = get_firestore_client()
    doc = db.collection("emergency_contacts").document(contact_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Contact not found")
    data = doc.to_dict()
    data["id"] = doc.id
    return data

@router.post("/emergency-contacts", status_code=status.HTTP_201_CREATED)
def create_contact(contact: dict = Body(...)):
    db = get_firestore_client()
    contact_id = contact.get("id") or str(uuid4())
    db.collection("emergency_contacts").document(contact_id).set(contact)
    return {"id": contact_id, "success": True}

@router.put("/emergency-contacts/{contact_id}")
def update_contact(contact_id: str, contact: dict = Body(...)):
    db = get_firestore_client()
    doc_ref = db.collection("emergency_contacts").document(contact_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Contact not found")
    doc_ref.update(contact)
    return {"id": contact_id, "success": True}

@router.delete("/emergency-contacts/{contact_id}")
def delete_contact(contact_id: str):
    db = get_firestore_client()
    doc_ref = db.collection("emergency_contacts").document(contact_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Contact not found")
    doc_ref.delete()
    return {"id": contact_id, "success": True}

@router.get("/emergency-contacts/analytics")
def get_contact_analytics():
    db = get_firestore_client()
    contacts_ref = db.collection("emergency_contacts")
    docs = contacts_ref.stream()
    total = 0
    by_type = {}
    for doc in docs:
        total += 1
        data = doc.to_dict()
        t = data.get("type", "unknown")
        by_type[t] = by_type.get(t, 0) + 1
    return {"total": total, "by_type": by_type} 