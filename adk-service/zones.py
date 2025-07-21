from fastapi import APIRouter, HTTPException, status, Body
from fastapi.responses import JSONResponse
from firestore_client import get_firestore_client
from uuid import uuid4

router = APIRouter()

@router.get("/zones")
def list_zones():
    db = get_firestore_client()
    zones_ref = db.collection("zones")
    docs = zones_ref.stream()
    zones = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        zones.append(data)
    return JSONResponse(content={"zones": zones})

@router.get("/zones/{zone_id}")
def get_zone_by_id(zone_id: str):
    db = get_firestore_client()
    doc = db.collection("zones").document(zone_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Zone not found")
    data = doc.to_dict()
    data["id"] = doc.id
    return data

@router.post("/zones", status_code=status.HTTP_201_CREATED)
def create_zone(zone: dict = Body(...)):
    db = get_firestore_client()
    zone_id = zone.get("id") or str(uuid4())
    db.collection("zones").document(zone_id).set(zone)
    return {"id": zone_id, "success": True}

@router.put("/zones/{zone_id}")
def update_zone(zone_id: str, zone: dict = Body(...)):
    db = get_firestore_client()
    doc_ref = db.collection("zones").document(zone_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Zone not found")
    doc_ref.update(zone)
    return {"id": zone_id, "success": True}

@router.get("/zones/{zone_id}/sensors")
def get_zone_sensors(zone_id: str):
    db = get_firestore_client()
    sensors_ref = db.collection("zones").document(zone_id).collection("sensors")
    docs = sensors_ref.stream()
    sensors = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        sensors.append(data)
    return {"sensors": sensors}

@router.post("/zones/{zone_id}/sensors", status_code=status.HTTP_201_CREATED)
def add_sensor_reading(zone_id: str, reading: dict = Body(...)):
    db = get_firestore_client()
    sensors_ref = db.collection("zones").document(zone_id).collection("sensors")
    reading_id = reading.get("id") or str(uuid4())
    sensors_ref.document(reading_id).set(reading)
    return {"id": reading_id, "success": True}

@router.get("/zones/analytics")
def get_zone_analytics():
    db = get_firestore_client()
    zones_ref = db.collection("zones")
    docs = zones_ref.stream()
    total = 0
    by_type = {}
    for doc in docs:
        total += 1
        data = doc.to_dict()
        t = data.get("type", "unknown")
        by_type[t] = by_type.get(t, 0) + 1
    return {"total": total, "by_type": by_type} 