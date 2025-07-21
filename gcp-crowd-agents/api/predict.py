from fastapi import APIRouter, HTTPException, Body
from google.cloud import aiplatform
from google.oauth2 import service_account
import logging
import os

router = APIRouter()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# You may want to move this to an environment variable or config
SERVICE_ACCOUNT_FILE = os.getenv("VERTEX_SERVICE_ACCOUNT_FILE", "/home/prakash63kumar/gcp-crowd-agents/drishti-api-access.json")
PROJECT = os.getenv("VERTEX_PROJECT", "project-drishti-mvp-31f1b")
LOCATION = os.getenv("VERTEX_LOCATION", "us-central1")
ENDPOINT_ID = os.getenv("VERTEX_ENDPOINT_ID", "4518162658880389120")


def predict_endpoint(project, location, endpoint_id, instance):
    try:
        credentials = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE,
            scopes=["https://www.googleapis.com/auth/cloud-platform"],
        )
        aiplatform.init(project=project, location=location, credentials=credentials)
        endpoint = aiplatform.Endpoint(f"projects/{project}/locations/{location}/endpoints/{endpoint_id}")
        prediction = endpoint.predict(instances=[instance])
        return prediction.predictions
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise

@router.post("/predict")
def predict(payload: dict = Body(...)):
    try:
        instance = {
            "timestamp": payload.get("timestamp"),
            "zoneId": payload.get("zoneId"),
            "day_of_week": payload.get("day_of_week"),
            "hour_of_day": float(payload.get("hour_of_day")),
            "lag_peopleCount_1": float(payload.get("lag_peopleCount_1")),
            "rolling_avg_5min": float(payload.get("rolling_avg_5min")),
            "crowdDensity": payload.get("crowdDensity")
        }
        predictions = predict_endpoint(PROJECT, LOCATION, ENDPOINT_ID, instance)
        return {"prediction": predictions[0]}
    except Exception as e:
        logger.error(f"/predict error: {e}")
        raise HTTPException(status_code=500, detail=str(e)) 