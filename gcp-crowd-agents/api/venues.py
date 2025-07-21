from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Any
from agents.venues_agent import VenuesAgent

router = APIRouter()
venues_agent = VenuesAgent()

class VenueRequest(BaseModel):
    eventName: str
    venueType: str
    venueArea: float
    entryGates: int
    crowdType: str
    autoZone: bool = False
    createdBy: Optional[str] = None
    zones: Optional[List[Any]] = None
    imageUrl: Optional[str] = None

@router.post("/venues")
async def create_venue(venue: VenueRequest):
    try:
        result = venues_agent.create_venue(venue.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating venue: {e}") 