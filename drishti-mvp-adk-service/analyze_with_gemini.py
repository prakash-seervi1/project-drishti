import os
from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from google.cloud import aiplatform, firestore, storage
from datetime import datetime
import base64
import json
import requests
import vertexai
from vertexai.generative_models import GenerativeModel, Part

router = APIRouter()

PROJECT = os.getenv("GCP_PROJECT")
LOCATION = os.getenv("GCP_REGION", "us-central1")
MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-pro")

firestore_db = firestore.Client()
storage_client = storage.Client()

def download_image_as_base64(bucket_name, object_path):
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(object_path)
    image_bytes = blob.download_as_bytes()
    return base64.b64encode(image_bytes).decode("utf-8")

@router.post("/analyze/gemini")
def analyze_with_gemini(request: Dict):
    # Accept either image (base64), gcs_path, or image_url
    image_b64 = request.get("image")
    gcs_path = request.get("gcs_path")
    image_url = request.get("image_url")
    media_id = request.get("media_id")
    prompt_text = request.get("text")

    # 1. If GCS path is provided, download and base64 encode
    if gcs_path:
        # gcs_path format: bucket/object_path
        if gcs_path.startswith("gs://"):
            gcs_path = gcs_path[5:]
        bucket_name, object_path = gcs_path.split("/", 1)
        image_b64 = download_image_as_base64(bucket_name, object_path)
        image_bytes = base64.b64decode(image_b64)
    elif image_url:
        # Download image from URL and base64 encode
        resp = requests.get(image_url)
        if resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to download image from URL.")
        image_bytes = resp.content
        image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    elif image_b64:
        image_bytes = base64.b64decode(image_b64)
    else:
        image_bytes = None

    # 2. Fetch Firestore metadata if media_id or gcs_path is provided
    media_doc = None
    zone_doc = None
    if media_id:
        media_ref = firestore_db.collection("media").document(media_id)
        media_doc = media_ref.get()
        if media_doc.exists:
            media_data = media_doc.to_dict()
            zone_id = media_data.get("zone")
            if zone_id:
                zone_ref = firestore_db.collection("zones").document(zone_id)
                zone_doc = zone_ref.get()
    elif gcs_path:
        # Try to find media doc by objectPath
        media_query = firestore_db.collection("media").where("objectPath", "==", object_path).limit(1).stream()
        for doc in media_query:
            media_doc = doc
            media_data = doc.to_dict()
            zone_id = media_data.get("zone")
            if zone_id:
                zone_ref = firestore_db.collection("zones").document(zone_id)
                zone_doc = zone_ref.get()
            break

    # 3. Build structured prompt
    zone_context = ""
    if zone_doc and zone_doc.exists:
        zone_data = zone_doc.to_dict()
        zone_context = f"Zone: {json.dumps(zone_data)}"
    else:
        zone_context = "Zone: Unknown"

    schema = '''Analyze the image for the following and return ONLY this JSON:\n{\n  "peopleCount": <number>,\n  "crowdDensity": "low|moderate|high",\n  "smokeDetected": <true|false>,\n  "fireDetected": <true|false>,\n  "medicalEmergency": <true|false>,\n  "potentialRisk": <true|false>,\n  "incidentRecommended": <true|false>,\n  "incidentType": "<string>",\n  "suggestedAction": "<string>"\n}\n'''

    prompt = f"""
{prompt_text or ''}
{zone_context}
{schema}
"""

    # 4. Call Gemini
    vertexai.init(project=PROJECT, location=LOCATION)
    model = GenerativeModel(MODEL)
    contents = [
        Part.from_text(prompt),
        Part.from_image(image_bytes) if image_bytes else Part.from_text("")
    ]
    response = model.generate_content(contents)
    # 5. Parse JSON from Gemini response
    try:
        text = response.text
        text = text.replace("```json", "").replace("```", "").strip()
        result_json = json.loads(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini response parse error: {e}, raw: {text}")

    # 6. Store result in Firestore (optional, if media_id or gcs_path)
    if media_doc:
        media_ref = firestore_db.collection("media").document(media_doc.id)
        media_ref.update({"geminiAnalysis": result_json, "analyzedAt": datetime.utcnow()})

    return {"result": result_json, "raw": text} 