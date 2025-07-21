# Venue tool functions
from google.cloud import firestore
from datetime import datetime
from typing import Dict, Any, List

db = firestore.Client()

def validate_venue(data: Dict[str, Any]) -> List[str]:
    errors = []
    if not data.get("eventName"): errors.append("Venue eventName is required")
    if not data.get("venueType"): errors.append("Venue type is required")
    if not data.get("venueArea"): errors.append("Venue area is required")
    return errors

def create_venue_tool(venue: Dict[str, Any]):
    errors = validate_venue(venue)
    if errors:
        raise ValueError(errors)
    venue_data = venue.copy()
    venue_data["createdAt"] = datetime.utcnow()
    doc_ref = db.collection("venues").document()
    doc_ref.set(venue_data)
    return {"id": doc_ref.id, **venue_data}

def get_venues_tool():
    docs = db.collection("venues").stream()
    venues = [{"id": doc.id, **doc.to_dict()} for doc in docs]
    return {"venues": venues}

def get_venue_by_id_tool(venue_id: str):
    doc = db.collection("venues").document(venue_id).get()
    if not doc.exists:
        raise ValueError("Venue not found")
    return {"id": doc.id, **doc.to_dict()}

def update_venue_tool(venue_id: str, updates: Dict[str, Any]):
    doc_ref = db.collection("venues").document(venue_id)
    if not doc_ref.get().exists:
        raise ValueError("Venue not found")
    doc_ref.update(updates)
    return {"id": venue_id, **updates}

def delete_venue_tool(venue_id: str):
    doc_ref = db.collection("venues").document(venue_id)
    if not doc_ref.get().exists:
        raise ValueError("Venue not found")
    doc_ref.delete()
    return {"success": True, "id": venue_id} 