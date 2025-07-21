# Incident tool functions
from google.cloud import firestore
from datetime import datetime
from typing import Dict, Any, List

db = firestore.Client()

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

def create_incident_tool(incident: Dict[str, Any]):
    errors = validate_incident(incident)
    if errors:
        raise ValueError(errors)
    incident_data = incident.copy()
    incident_data["timestamp"] = datetime.utcnow()
    incident_data["lastUpdated"] = datetime.utcnow()
    doc_ref = db.collection("incidents").document()
    doc_ref.set(incident_data)
    return {"id": doc_ref.id, **incident_data}

def get_incidents_tool():
    docs = db.collection("incidents").stream()
    incidents = [{"id": doc.id, **doc.to_dict()} for doc in docs]
    return {"incidents": incidents}

def get_incident_by_id_tool(incident_id: str):
    doc = db.collection("incidents").document(incident_id).get()
    if not doc.exists:
        raise ValueError("Incident not found")
    return {"id": doc.id, **doc.to_dict()}

def update_incident_tool(incident_id: str, updates: Dict[str, Any]):
    doc_ref = db.collection("incidents").document(incident_id)
    if not doc_ref.get().exists:
        raise ValueError("Incident not found")
    updates["lastUpdated"] = datetime.utcnow()
    doc_ref.update(updates)
    return {"id": incident_id, **updates}

def delete_incident_tool(incident_id: str):
    doc_ref = db.collection("incidents").document(incident_id)
    if not doc_ref.get().exists:
        raise ValueError("Incident not found")
    doc_ref.delete()
    return {"success": True, "id": incident_id}

def get_incident_analytics_tool():
    docs = db.collection("incidents").stream()
    incidents = [doc.to_dict() for doc in docs]
    total = len(incidents)
    by_status = {}
    by_priority = {}
    for inc in incidents:
        by_status[inc.get("status")] = by_status.get(inc.get("status"), 0) + 1
        by_priority[inc.get("priority")] = by_priority.get(inc.get("priority"), 0) + 1
    return {"total": total, "byStatus": by_status, "byPriority": by_priority} 