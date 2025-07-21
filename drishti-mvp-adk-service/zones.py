from google.cloud import firestore
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from datetime import datetime

router = APIRouter()
db = firestore.Client()

VALID_ZONE_STATUSES = ["normal", "alert", "evacuating", "locked_down"]

def validate_zone(data: Dict[str, Any]) -> List[str]:
    errors = []
    if not data.get("name"): errors.append("Zone name is required")
    if not data.get("status") or data["status"] not in VALID_ZONE_STATUSES:
        errors.append(f"Zone status must be one of: {', '.join(VALID_ZONE_STATUSES)}")
    return errors

@router.post("/zones")
def create_zone(zone: Dict[str, Any]):
    errors = validate_zone(zone)
    if errors:
        raise HTTPException(status_code=400, detail=errors)
    zone_data = zone.copy()
    zone_data["lastUpdate"] = datetime.utcnow()
    doc_ref = db.collection("zones").document()
    doc_ref.set(zone_data)
    return {"id": doc_ref.id, **zone_data}

@router.get("/zones")
def get_zones():
    docs = db.collection("zones").stream()
    zones = [{"id": doc.id, **doc.to_dict()} for doc in docs]
    return {"zones": zones}

@router.get("/zones/{zone_id}")
def get_zone_by_id(zone_id: str):
    doc = db.collection("zones").document(zone_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Zone not found")
    return {"id": doc.id, **doc.to_dict()}

@router.put("/zones/{zone_id}")
def update_zone(zone_id: str, updates: Dict[str, Any]):
    doc_ref = db.collection("zones").document(zone_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Zone not found")
    updates["lastUpdate"] = datetime.utcnow()
    doc_ref.update(updates)
    return {"id": zone_id, **updates}

@router.delete("/zones/{zone_id}")
def delete_zone(zone_id: str):
    doc_ref = db.collection("zones").document(zone_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Zone not found")
    doc_ref.delete()
    return {"success": True, "id": zone_id} 