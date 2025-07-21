# Emergency contact tool functions
from google.cloud import firestore
from typing import Dict, Any, List

db = firestore.Client()

def validate_contact(data: Dict[str, Any]) -> List[str]:
    errors = []
    if not data.get("name"): errors.append("Contact name is required")
    if not data.get("type"): errors.append("Contact type is required")
    if not data.get("contact") or not isinstance(data["contact"], dict):
        errors.append("Contact details are required and must be a dict")
    return errors

def create_contact_tool(contact: Dict[str, Any]):
    errors = validate_contact(contact)
    if errors:
        raise ValueError(errors)
    contact_data = contact.copy()
    doc_ref = db.collection("emergency_contacts").document()
    doc_ref.set(contact_data)
    return {"id": doc_ref.id, **contact_data}

def get_contacts_tool():
    docs = db.collection("emergency_contacts").stream()
    contacts = [{"id": doc.id, **doc.to_dict()} for doc in docs]
    return {"contacts": contacts}

def get_contact_by_id_tool(contact_id: str):
    doc = db.collection("emergency_contacts").document(contact_id).get()
    if not doc.exists:
        raise ValueError("Contact not found")
    return {"id": doc.id, **doc.to_dict()}

def update_contact_tool(contact_id: str, updates: Dict[str, Any]):
    doc_ref = db.collection("emergency_contacts").document(contact_id)
    if not doc_ref.get().exists():
        raise ValueError("Contact not found")
    doc_ref.update(updates)
    return {"id": contact_id, **updates}

def delete_contact_tool(contact_id: str):
    doc_ref = db.collection("emergency_contacts").document(contact_id)
    if not doc_ref.get().exists():
        raise ValueError("Contact not found")
    doc_ref.delete()
    return {"success": True, "id": contact_id} 