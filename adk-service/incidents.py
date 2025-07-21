from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi import Body
from firestore_client import get_firestore_client
from typing import Optional
from uuid import uuid4

router = APIRouter()

@router.get("/incidents")
def list_incidents():
    db = get_firestore_client()
    incidents_ref = db.collection("incidents")
    docs = incidents_ref.stream()
    incidents = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        incidents.append(data)
    return JSONResponse(content={"incidents": incidents})

@router.get("/incidents/{incident_id}")
def get_incident_by_id(incident_id: str):
    db = get_firestore_client()
    doc = db.collection("incidents").document(incident_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Incident not found")
    data = doc.to_dict()
    data["id"] = doc.id
    return data

@router.post("/incidents", status_code=status.HTTP_201_CREATED)
def create_incident(incident: dict = Body(...)):
    db = get_firestore_client()
    incident_id = incident.get("id") or str(uuid4())
    db.collection("incidents").document(incident_id).set(incident)
    return {"id": incident_id, "success": True}

@router.put("/incidents/{incident_id}")
def update_incident(incident_id: str, incident: dict = Body(...)):
    db = get_firestore_client()
    doc_ref = db.collection("incidents").document(incident_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Incident not found")
    doc_ref.update(incident)
    return {"id": incident_id, "success": True}

@router.delete("/incidents/{incident_id}")
def delete_incident(incident_id: str):
    db = get_firestore_client()
    doc_ref = db.collection("incidents").document(incident_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Incident not found")
    doc_ref.delete()
    return {"id": incident_id, "success": True}

@router.get("/incidents/{incident_id}/notes")
def get_incident_notes(incident_id: str):
    db = get_firestore_client()
    notes_ref = db.collection("incidents").document(incident_id).collection("notes")
    docs = notes_ref.stream()
    notes = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        notes.append(data)
    return {"notes": notes}

@router.post("/incidents/{incident_id}/notes", status_code=status.HTTP_201_CREATED)
def add_incident_note(incident_id: str, note: dict = Body(...)):
    db = get_firestore_client()
    notes_ref = db.collection("incidents").document(incident_id).collection("notes")
    note_id = note.get("id") or str(uuid4())
    notes_ref.document(note_id).set(note)
    return {"id": note_id, "success": True}

@router.get("/incidents/analytics")
def get_incident_analytics():
    db = get_firestore_client()
    incidents_ref = db.collection("incidents")
    docs = incidents_ref.stream()
    total = 0
    by_type = {}
    by_status = {}
    for doc in docs:
        total += 1
        data = doc.to_dict()
        t = data.get("type", "unknown")
        s = data.get("status", "unknown")
        by_type[t] = by_type.get(t, 0) + 1
        by_status[s] = by_status.get(s, 0) + 1
    return {"total": total, "by_type": by_type, "by_status": by_status}

@router.get("/incidents/zone/{zone_id}")
def get_incidents_by_zone(zone_id: str):
    db = get_firestore_client()
    incidents_ref = db.collection("incidents")
    query = incidents_ref.where("zoneId", "==", zone_id)
    docs = query.stream()
    incidents = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        incidents.append(data)
    return {"incidents": incidents}

@router.get("/incidents/zone/{zone_id}/active")
def get_active_incidents_by_zone(zone_id: str):
    db = get_firestore_client()
    incidents_ref = db.collection("incidents")
    query = incidents_ref.where("zoneId", "==", zone_id).where("status", "in", ["active", "ongoing", "investigating"])
    docs = query.stream()
    incidents = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        incidents.append(data)
    return {"incidents": incidents} 