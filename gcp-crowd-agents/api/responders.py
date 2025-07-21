from fastapi import APIRouter, HTTPException
from utils.firestore_utils import get_collection
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter()

@router.get("/responders")
def get_responders():
    print("[API] GET /responders")
    docs = get_collection("responders").stream()
    responders = [doc.to_dict() | {"id": doc.id} for doc in docs]
    return {"responders": responders}

@router.get("/responders/{responder_id}")
def get_responder_by_id(responder_id: str):
    print(f"[API] GET /responders/{responder_id}")
    doc = get_collection("responders").document(responder_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Responder not found")
    return doc.to_dict() | {"id": doc.id}

@router.get("/responders/status/{status}")
def get_responders_by_status(status: str):
    print(f"[API] GET /responders/status/{status}")
    docs = get_collection("responders").where("status", "==", status).stream()
    responders = [doc.to_dict() | {"id": doc.id} for doc in docs]
    return {"responders": responders}

@router.get("/responders/type/{responder_type}")
def get_responders_by_type(responder_type: str):
    print(f"[API] GET /responders/type/{responder_type}")
    docs = get_collection("responders").where("type", "==", responder_type).stream()
    responders = [doc.to_dict() | {"id": doc.id} for doc in docs]
    return {"responders": responders}

class DispatchRequest(BaseModel):
    responderId: str
    notes: Optional[str] = None
    incidentId: Optional[str] = None

@router.post("/dispatch_responder")
async def dispatch_responder(req: DispatchRequest):
    try:
        # 1. Fetch the responder
        responder_ref = get_collection("responders").document(req.responderId)
        responder_doc = responder_ref.get()
        if not responder_doc.exists:
            raise HTTPException(status_code=404, detail="Responder not found")

        responder = responder_doc.to_dict()
        if responder.get("status") not in ["available", "ready"]:
            return {"success": False, "error": "Responder is not available for dispatch."}

        # 2. Update responder status and assignment
        update_data = {
            "status": "en_route",
            "lastUpdate": firestore.SERVER_TIMESTAMP,
            "notes": req.notes or "",
        }
        if req.incidentId:
            update_data["assignedIncident"] = req.incidentId
        responder_ref.update(update_data)

        # 3. Log the status update in 'responder_status_updates' collection
        db.collection("responder_status_updates").add({
            "responderId": req.responderId,
            "status": "en_route",
            "timestamp": firestore.SERVER_TIMESTAMP,
            "incidentId": req.incidentId or None,
            "notes": req.notes or "",
        })

        # 4. Optionally update the incident with assigned responder
        if req.incidentId:
            incident_ref = db.collection("incidents").document(req.incidentId)
            if incident_ref.get().exists:
                incident_ref.update({
                    "assignedResponderId": req.responderId,
                    "assignmentTransactionId": f"dispatch_{req.responderId}_{int(datetime.utcnow().timestamp())}",
                    "lastUpdated": firestore.SERVER_TIMESTAMP,
                })

        return {"success": True, "message": "Responder dispatched successfully"}
    except Exception as e:
        return {"success": False, "error": str(e)} 