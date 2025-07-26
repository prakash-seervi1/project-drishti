from fastapi import APIRouter, HTTPException, Body
from google.cloud import aiplatform
import logging
import os

router = APIRouter()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

PROJECT = os.getenv("VERTEX_PROJECT", "project-drishti-mvp-31f1b")
LOCATION = os.getenv("VERTEX_LOCATION", "us-central1")
ENDPOINT_ID = os.getenv("VERTEX_ENDPOINT_ID", "4518162658880389120")

def predict_endpoint(project, location, endpoint_id, instance):
    try:
        aiplatform.init(project=project, location=location)
        endpoint = aiplatform.Endpoint(f"projects/{project}/locations/{location}/endpoints/{endpoint_id}")
        prediction = endpoint.predict(instances=[instance])
        return prediction.predictions
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise

@router.post("/predict")
def predict(payload: dict = Body(...)):
    try:
        # Ensure hour_of_day is a string, as required by the Vertex AI model
        hour_of_day = payload.get("hour_of_day")
        if hour_of_day is not None:
            hour_of_day = str(hour_of_day)
        instance = {
            "timestamp": payload.get("timestamp"),
            "zoneId": payload.get("zoneId"),
            "day_of_week": payload.get("day_of_week"),
            "hour_of_day": hour_of_day,  # must be string
            "lag_peopleCount_1": payload.get("lag_peopleCount_1"),
            "rolling_avg_5min": float(payload.get("rolling_avg_5min")),
            "crowdDensity": payload.get("crowdDensity")
        }
        predictions = predict_endpoint(PROJECT, LOCATION, ENDPOINT_ID, instance)
        return {"prediction": predictions[0]}
    except Exception as e:
        logger.error(f"/predict error: {e}")
        raise HTTPException(status_code=500, detail=str(e)) 