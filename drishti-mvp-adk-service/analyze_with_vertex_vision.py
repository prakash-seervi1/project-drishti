import os
from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from google.cloud import aiplatform, firestore, storage, vision
from datetime import datetime
import base64
import json
import requests
import vertexai
from vertexai.generative_models import GenerativeModel, Part

router = APIRouter()

PROJECT = os.getenv("GCP_PROJECT")
LOCATION = os.getenv("GCP_REGION", "us-central1")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-pro")

firestore_db = firestore.Client()
storage_client = storage.Client()
vision_client = vision.ImageAnnotatorClient()

def download_image_as_base64(bucket_name, object_path):
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(object_path)
    image_bytes = blob.download_as_bytes()
    return base64.b64encode(image_bytes).decode("utf-8"), image_bytes

@router.post("/analyze/vertex-vision")
def analyze_with_vertex_vision(request: Dict):
    # Accept either image (base64), gcs_path, or image_url
    image_b64 = request.get("image")
    gcs_path = request.get("gcs_path")
    image_url = request.get("image_url")
    media_id = request.get("media_id")
    prompt_text = request.get("text")

    # 1. If GCS path is provided, download and base64 encode
    if gcs_path:
        if gcs_path.startswith("gs://"):
            gcs_path = gcs_path[5:]
        bucket_name, object_path = gcs_path.split("/", 1)
        image_b64, image_bytes = download_image_as_base64(bucket_name, object_path)
    elif image_url:
        resp = requests.get(image_url)
        if resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to download image from URL.")
        image_bytes = resp.content
        image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    elif image_b64:
        image_bytes = base64.b64decode(image_b64)
    else:
        raise HTTPException(status_code=400, detail="Provide at least image, gcs_path, or image_url.")

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
        media_query = firestore_db.collection("media").where("objectPath", "==", object_path).limit(1).stream()
        for doc in media_query:
            media_doc = doc
            media_data = doc.to_dict()
            zone_id = media_data.get("zone")
            if zone_id:
                zone_ref = firestore_db.collection("zones").document(zone_id)
                zone_doc = zone_ref.get()
            break

    # 3. Call Vertex Vision for object localization (person count)
    person_count = 0
    try:
        vision_response = vision_client.object_localization({"image": {"content": image_bytes}})
        objects = vision_response.localized_object_annotations
        person_count = sum(1 for obj in objects if obj.name.lower() == "person")
    except Exception as e:
        print("Vertex Vision error:", e)

    # 4. Build structured prompt for Gemini
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
The person count detected by Vertex AI Vision is {person_count}.
{schema}
"""

    # 5. Call Gemini
    vertexai.init(project=PROJECT, location=LOCATION)
    model = GenerativeModel(GEMINI_MODEL)
    contents = [
        Part.from_text(prompt),
        Part.from_image(image_bytes) if image_bytes else Part.from_text("")
    ]
    response = model.generate_content(contents)
    # 6. Parse JSON from Gemini response
    try:
        text = response.text
        text = text.replace("```json", "").replace("```", "").strip()
        result_json = json.loads(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini response parse error: {e}, raw: {text}")

    # 7. Store result in Firestore (optional, if media_id or gcs_path)
    if media_doc:
        media_ref = firestore_db.collection("media").document(media_doc.id)
        media_ref.update({"vertexVisionAnalysis": result_json, "visionPersonCount": person_count, "analyzedAt": datetime.utcnow()})

    return {"result": result_json, "personCount": person_count, "raw": text} 