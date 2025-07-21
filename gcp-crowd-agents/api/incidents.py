from fastapi import APIRouter, HTTPException, Query
from utils.firestore_utils import get_collection

router = APIRouter()

@router.get("/incidents")
def get_incidents():
    print("[API] GET /incidents")
    docs = get_collection("incidents").stream()
    incidents = [doc.to_dict() | {"id": doc.id} for doc in docs]
    return {"incidents": incidents}

@router.get("/incidents/{incident_id}")
def get_incident_by_id(incident_id: str):
    print(f"[API] GET /incidents/{incident_id}")
    doc = get_collection("incidents").document(incident_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Incident not found")
    return doc.to_dict() | {"id": doc.id}

@router.get("/incidents/status/{status}")
def get_incidents_by_status(status: str):
    print(f"[API] GET /incidents/status/{status}")
    docs = get_collection("incidents").where("status", "==", status).stream()
    incidents = [doc.to_dict() | {"id": doc.id} for doc in docs]
    return {"incidents": incidents}

@router.get("/incidents/zone/{zone_id}")
def get_incidents_by_zone(zone_id: str):
    print(f"[API] GET /incidents/zone/{zone_id}")
    docs = get_collection("incidents").where("zoneId", "==", zone_id).stream()
    incidents = [doc.to_dict() | {"id": doc.id} for doc in docs]
    return {"incidents": incidents} 