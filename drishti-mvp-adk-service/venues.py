from google.cloud import firestore
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from datetime import datetime

router = APIRouter()
db = firestore.Client()

def validate_venue(data: Dict[str, Any]) -> List[str]:
    errors = []
    if not data.get("eventName"): errors.append("Venue eventName is required")
    if not data.get("venueType"): errors.append("Venue type is required")
    if not data.get("venueArea"): errors.append("Venue area is required")
    return errors

@router.post("/venues")
def create_venue(venue: Dict[str, Any]):
    errors = validate_venue(venue)
    if errors:
        raise HTTPException(status_code=400, detail=errors)
    venue_data = venue.copy()
    venue_data["createdAt"] = datetime.utcnow()
    doc_ref = db.collection("venues").document()
    doc_ref.set(venue_data)
    return {"id": doc_ref.id, **venue_data}

@router.get("/venues")
def get_venues():
    docs = db.collection("venues").stream()
    venues = [{"id": doc.id, **doc.to_dict()} for doc in docs]
    return {"venues": venues}

@router.get("/venues/{venue_id}")
def get_venue_by_id(venue_id: str):
    doc = db.collection("venues").document(venue_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Venue not found")
    return {"id": doc.id, **doc.to_dict()}

@router.put("/venues/{venue_id}")
def update_venue(venue_id: str, updates: Dict[str, Any]):
    doc_ref = db.collection("venues").document(venue_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Venue not found")
    doc_ref.update(updates)
    return {"id": venue_id, **updates}

@router.delete("/venues/{venue_id}")
def delete_venue(venue_id: str):
    doc_ref = db.collection("venues").document(venue_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Venue not found")
    doc_ref.delete()
    return {"success": True, "id": venue_id}