from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from tools import db_tools

router = APIRouter()

class DispatchRequest(BaseModel):
    responderId: Optional[str] = None
    incidentId: str

@router.post("/dispatch_responder")
async def dispatch_responder(req: DispatchRequest):
    try:
        result = db_tools.assign_responder_to_incident(req.incidentId, req.responderId)
        if result.get("status") == "error":
            raise HTTPException(status_code=400, detail=result.get("message", "Assignment failed"))
        return {"success": True, "result": result}
    except Exception as e:
        return {"success": False, "error": str(e)} 