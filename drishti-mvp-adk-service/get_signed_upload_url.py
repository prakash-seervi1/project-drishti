import os
from fastapi import APIRouter, HTTPException
from typing import Dict
from google.cloud import storage, firestore
from datetime import timedelta, datetime
import uuid

router = APIRouter()

default_bucket = os.getenv("GCS_BUCKET_NAME", "project-drishti-central1-bucket")
venue_bucket = os.getenv("GCS_VENUE_BUCKET_NAME", "project-drishti-central1-bucket-venues")
vision_bucket = os.getenv("GCS_VISION_BUCKET_NAME", "project-drishti-central1-bucket-vision")

db = firestore.Client()

@router.post("/media/upload-url")
def get_signed_upload_url(request: Dict):
    filename = request.get("filename")
    content_type = request.get("content_type", "application/octet-stream")
    zone = request.get("zone")
    notes = request.get("notes", "")
    file_type = request.get("type")
    bucket_override = request.get("bucket")

    if not filename or not zone:
        raise HTTPException(status_code=400, detail="Filename and zone are required.")

    # Determine bucket
    if bucket_override:
        bucket_name = bucket_override
    elif file_type == "venue":
        bucket_name = venue_bucket
    elif file_type == "vision":
        bucket_name = vision_bucket
    else:
        bucket_name = default_bucket

    file_id = str(uuid.uuid4())
    object_path = f"uploads/{file_id}_{filename}"

    try:
        storage_client = storage.Client()
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(object_path)
        url = blob.generate_signed_url(
            version="v4",
            expiration=timedelta(minutes=15),
            method="PUT",
            content_type=content_type,
        )
        # Store metadata in Firestore
        file_url = f"https://storage.googleapis.com/{bucket_name}/{object_path}"
        db.collection("media").add({
            "zone": zone,
            "notes": notes,
            "fileUrl": file_url,
            "objectPath": object_path,
            "type": "image" if content_type.startswith("image") else "video",
            "timestamp": datetime.utcnow(),
        })
        return {"uploadUrl": url, "objectPath": object_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 