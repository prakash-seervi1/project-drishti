from fastapi import APIRouter, HTTPException, Body
from agents.vision_analysis import VisionAnalysisAgent

router = APIRouter()
vision_agent = VisionAnalysisAgent()

@router.post("/analyze-media")
def analyze_media(payload: dict = Body(...)):
    """
    Trigger vision analysis for a given media file.
    Payload should include at least 'fileUrl', 'zone', and 'docId' (Firestore doc ID).
    """
    print("[API] POST /api/analyze-media")
    result = vision_agent.handle_media_event(payload)
    return result 