from fastapi import APIRouter, HTTPException
from utils.firestore_utils import get_collection, get_document

router = APIRouter()

@router.get("/zones")
def get_zones():
    print("[API] GET /zones")
    docs = get_collection("zones").stream()
    zones = [doc.to_dict() | {"id": doc.id} for doc in docs]
    return {"zones": zones}

@router.get("/zones/{zone_id}")
def get_zone_by_id(zone_id: str):
    print(f"[API] GET /zones/{zone_id}")
    doc = get_document("zones", zone_id)
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Zone not found")
    return doc.to_dict() | {"id": doc.id}

@router.get("/zones/status/{status}")
def get_zones_by_status(status: str):
    print(f"[API] GET /zones/status/{status}")
    docs = get_collection("zones").where("status", "==", status).stream()
    zones = [doc.to_dict() | {"id": doc.id} for doc in docs]
    return {"zones": zones}

@router.get("/zones/risk/{risk_score}")
def get_zones_by_risk(risk_score: int):
    print(f"[API] GET /zones/risk/{risk_score}")
    docs = get_collection("zones").where("riskScore", "==", risk_score).stream()
    zones = [doc.to_dict() | {"id": doc.id} for doc in docs]
    return {"zones": zones} 