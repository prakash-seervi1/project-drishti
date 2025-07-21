from fastapi import APIRouter, HTTPException, status, Body
from fastapi.responses import JSONResponse
from firestore_client import get_firestore_client
from uuid import uuid4

router = APIRouter()

@router.get("/responders")
def list_responders():
    db = get_firestore_client()
    responders_ref = db.collection("responders")
    docs = responders_ref.stream()
    responders = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        responders.append(data)
    return JSONResponse(content={"responders": responders})

@router.get("/responders/{responder_id}")
def get_responder_by_id(responder_id: str):
    db = get_firestore_client()
    doc = db.collection("responders").document(responder_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Responder not found")
    data = doc.to_dict()
    data["id"] = doc.id
    return data

@router.post("/responders", status_code=status.HTTP_201_CREATED)
def create_responder(responder: dict = Body(...)):
    db = get_firestore_client()
    responder_id = responder.get("id") or str(uuid4())
    db.collection("responders").document(responder_id).set(responder)
    return {"id": responder_id, "success": True}

@router.put("/responders/{responder_id}")
def update_responder(responder_id: str, responder: dict = Body(...)):
    db = get_firestore_client()
    doc_ref = db.collection("responders").document(responder_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Responder not found")
    doc_ref.update(responder)
    return {"id": responder_id, "success": True}

@router.delete("/responders/{responder_id}")
def delete_responder(responder_id: str):
    db = get_firestore_client()
    doc_ref = db.collection("responders").document(responder_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Responder not found")
    doc_ref.delete()
    return {"id": responder_id, "success": True}

@router.get("/responders/analytics")
def get_responder_analytics():
    db = get_firestore_client()
    responders_ref = db.collection("responders")
    docs = responders_ref.stream()
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