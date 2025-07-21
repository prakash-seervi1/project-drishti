from google.cloud import firestore
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from datetime import datetime

router = APIRouter()
db = firestore.Client()

# --- Validation ---
VALID_PRIORITIES = ["low", "medium", "high", "critical"]
VALID_STATUSES = ["reported", "investigating", "active", "resolved", "closed", "ongoing"]

def validate_incident(data: Dict[str, Any]) -> List[str]:
    errors = []
    if not data.get("type"): errors.append("Incident type is required")
    if not data.get("zoneId"): errors.append("zoneId is required")
    if not data.get("description"): errors.append("Description is required")
    if not data.get("priority"): errors.append("Priority is required")
    if not data.get("status"): errors.append("Status is required")
    if data.get("priority") and data["priority"] not in VALID_PRIORITIES:
        errors.append(f"Priority must be one of: {', '.join(VALID_PRIORITIES)}")
    if data.get("status") and data["status"] not in VALID_STATUSES:
        errors.append(f"Status must be one of: {', '.join(VALID_STATUSES)}")
    return errors

# --- CRUD Endpoints ---
@router.post("/incidents")
def create_incident(incident: Dict[str, Any]):
    errors = validate_incident(incident)
    if errors:
        raise HTTPException(status_code=400, detail=errors)
    incident_data = incident.copy()
    incident_data["timestamp"] = datetime.utcnow()
    incident_data["lastUpdated"] = datetime.utcnow()
    doc_ref = db.collection("incidents").document()
    doc_ref.set(incident_data)
    return {"id": doc_ref.id, **incident_data}

@router.get("/incidents")
def get_incidents():
    docs = db.collection("incidents").stream()
    incidents = [{"id": doc.id, **doc.to_dict()} for doc in docs]
    return {"incidents": incidents}

@router.get("/incidents/{incident_id}")
def get_incident_by_id(incident_id: str):
    doc = db.collection("incidents").document(incident_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Incident not found")
    return {"id": doc.id, **doc.to_dict()}

@router.put("/incidents/{incident_id}")
def update_incident(incident_id: str, updates: Dict[str, Any]):
    doc_ref = db.collection("incidents").document(incident_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Incident not found")
    updates["lastUpdated"] = datetime.utcnow()
    doc_ref.update(updates)
    return {"id": incident_id, **updates}

@router.delete("/incidents/{incident_id}")
def delete_incident(incident_id: str):
    doc_ref = db.collection("incidents").document(incident_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Incident not found")
    doc_ref.delete()
    return {"success": True, "id": incident_id}

# --- Analytics Endpoint (basic) ---
@router.get("/incidents/analytics")
def get_incident_analytics():
    docs = db.collection("incidents").stream()
    incidents = [doc.to_dict() for doc in docs]
    total = len(incidents)
    by_status = {}
    by_priority = {}
    for inc in incidents:
        by_status[inc.get("status")] = by_status.get(inc.get("status"), 0) + 1
        by_priority[inc.get("priority")] = by_priority.get(inc.get("priority"), 0) + 1
    return {"total": total, "byStatus": by_status, "byPriority": by_priority} 