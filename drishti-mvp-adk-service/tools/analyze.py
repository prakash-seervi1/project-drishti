
# AI/Analysis tool functions
import os
from google.cloud import aiplatform, firestore, storage
from google.cloud import vision
from datetime import datetime
import base64
import json
import requests
from typing import Dict, Any

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

def analyze_with_gemini_tool(request: Dict[str, Any]) -> Dict[str, Any]:
    image_b64 = request.get("image")
    gcs_path = request.get("gcs_path")
    image_url = request.get("image_url")
    media_id = request.get("media_id")
    prompt_text = request.get("text")
    if gcs_path:
        if gcs_path.startswith("gs://"): gcs_path = gcs_path[5:]
        bucket_name, object_path = gcs_path.split("/", 1)
        image_b64, _ = download_image_as_base64(bucket_name, object_path)
    elif image_url:
        resp = requests.get(image_url)
        if resp.status_code != 200:
            raise ValueError("Failed to download image from URL.")
        image_b64 = base64.b64encode(resp.content).decode("utf-8")
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
    aiplatform.init(project=PROJECT, location=LOCATION)
    model = aiplatform.TextGenerationModel.from_pretrained(GEMINI_MODEL)
    contents = [
        {"role": "user", "parts": [
            {"text": prompt},
            {"inlineData": {"mimeType": "image/jpeg", "data": image_b64}}
        ]}
    ]
    response = model.predict(contents)
    try:
        text = response.text
        text = text.replace("```json", "").replace("```", "").strip()
        result_json = json.loads(text)
    except Exception as e:
        raise ValueError(f"Gemini response parse error: {e}, raw: {text}")
    if media_doc:
        media_ref = firestore_db.collection("media").document(media_doc.id)
        media_ref.update({"geminiAnalysis": result_json, "analyzedAt": datetime.utcnow()})
    return {"result": result_json, "raw": text}

def analyze_with_vertex_vision_tool(request: Dict[str, Any]) -> Dict[str, Any]:
    image_b64 = request.get("image")
    gcs_path = request.get("gcs_path")
    image_url = request.get("image_url")
    media_id = request.get("media_id")
    prompt_text = request.get("text")
    if gcs_path:
        if gcs_path.startswith("gs://"): gcs_path = gcs_path[5:]
        bucket_name, object_path = gcs_path.split("/", 1)
        image_b64, image_bytes = download_image_as_base64(bucket_name, object_path)
    elif image_url:
        resp = requests.get(image_url)
        if resp.status_code != 200:
            raise ValueError("Failed to download image from URL.")
        image_bytes = resp.content
        image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    elif image_b64:
        image_bytes = base64.b64decode(image_b64)
    else:
        raise ValueError("Provide at least image, gcs_path, or image_url.")
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
    person_count = 0
    try:
        vision_response = vision_client.object_localization({"image": {"content": image_bytes}})
        objects = vision_response.localized_object_annotations
        person_count = sum(1 for obj in objects if obj.name.lower() == "person")
    except Exception as e:
        print("Vertex Vision error:", e)
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
    aiplatform.init(project=PROJECT, location=LOCATION)
    model = aiplatform.TextGenerationModel.from_pretrained(GEMINI_MODEL)
    contents = [
        {"role": "user", "parts": [
            {"text": prompt},
            {"inlineData": {"mimeType": "image/jpeg", "data": image_b64}}
        ]}
    ]
    response = model.predict(contents)
    try:
        text = response.text
        text = text.replace("```json", "").replace("```", "").strip()
        result_json = json.loads(text)
    except Exception as e:
        raise ValueError(f"Gemini response parse error: {e}, raw: {text}")
    if media_doc:
        media_ref = firestore_db.collection("media").document(media_doc.id)
        media_ref.update({"vertexVisionAnalysis": result_json, "visionPersonCount": person_count, "analyzedAt": datetime.utcnow()})
    return {"result": result_json, "personCount": person_count, "raw": text} 