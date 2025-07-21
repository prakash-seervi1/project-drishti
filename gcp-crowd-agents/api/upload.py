from fastapi import APIRouter, Request
from pydantic import BaseModel
from uuid import uuid4
from google.cloud import storage
from datetime import timedelta
from fastapi.responses import JSONResponse
from starlette.status import HTTP_400_BAD_REQUEST, HTTP_500_INTERNAL_SERVER_ERROR
from utils.firestore_utils import add_document

router = APIRouter()

# Google Cloud setup
storage_client = storage.Client()

DEFAULT_BUCKET = "project-drishti-central1-bucket"
VENUE_BUCKET = "project-drishti-central1-bucket-venues"

# Request body model
class UploadRequest(BaseModel):
    filename: str
    mimetype: str
    zone: str
    notes: str = ""
    type: str = None
    bucket: str = None

@router.post("/upload/presigned-url")
async def get_signed_upload_url(req: UploadRequest):
    print("[UPLOAD ENDPOINT] /upload/presigned-url hit")
    print("[UPLOAD ENDPOINT] Incoming request:", req.dict())
    try:
        if not req.filename or not req.mimetype or not req.zone:
            return JSONResponse(
                status_code=HTTP_400_BAD_REQUEST,
                content={"error": "Missing required fields."}
            )

        file_id = str(uuid4())
        object_path = f"uploads/{file_id}_{req.filename}"

        # Determine bucket name
        if req.bucket:
            bucket_name = req.bucket
        elif req.type == "venue":
            bucket_name = VENUE_BUCKET
        else:
            bucket_name = DEFAULT_BUCKET

        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(object_path)

        # Signed URL generation
        url = blob.generate_signed_url(
            version="v4",
            expiration=timedelta(minutes=5),
            method="PUT",
            content_type=req.mimetype,
        )

        # Save metadata in Firestore
        media_doc = {
            "zone": req.zone,
            "notes": req.notes or "",
            "fileUrl": f"https://storage.googleapis.com/{bucket_name}/{object_path}",
            "objectPath": object_path,
            "type": "image" if req.mimetype.startswith("image") else "video",
            "timestamp": __import__('google.cloud.firestore').firestore.SERVER_TIMESTAMP,
        }

        doc_ref = add_document("media", media_doc)
        doc_id = doc_ref[1].id
        return {"url": url, "objectPath": object_path, "docId": doc_id}
    
    except Exception as e:
        return JSONResponse(
            status_code=HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": f"Failed to generate signed URL: {str(e)}"}
        )
