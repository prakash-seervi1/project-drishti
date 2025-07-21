import os
import io
from google.cloud import storage
import vertexai
from vertexai.generative_models import GenerativeModel, Part, Image as VertexImage
from comms.pubsub import PubSubComms
from PIL import Image
from utils.firestore_utils import get_collection, get_document, update_document
from utils.gemini_utils import call_gemini

class VisionAnalysisAgent:
    def __init__(self, media_topic="media-uploads", incident_topic="incident-events"):
        self.storage_client = storage.Client()
        self.comms = PubSubComms(media_topic)
        self.incident_comms = PubSubComms(incident_topic)
        project_id = os.getenv("GCP_PROJECT")
        location = os.getenv("GCP_REGION", "us-central1")
        if not project_id:
            raise ValueError("GCP_PROJECT environment variable must be set for Vertex AI initialization.")
        print(f"[VisionAnalysisAgent] Initializing Vertex AI for project: {project_id}, location: {location}")
        vertexai.init(project=project_id, location=location)
        self.model = GenerativeModel("gemini-2.5-pro")

    def handle_media_event(self, event):
        print(f"[VisionAnalysisAgent] Received media event: {event}")
        file_url = event.get("fileUrl")
        zone = event.get("zone")
        doc_id = event.get("docId")
        if not file_url or not zone:
            print("[VisionAnalysisAgent] Missing fileUrl or zone in event. Skipping processing.")
            return
        try:
            url_parts = file_url.split("/")
            if len(url_parts) < 5 or url_parts[2] != "storage.googleapis.com":
                raise ValueError(f"Invalid GCS URL format: {file_url}")
            bucket_name = url_parts[3]
            object_path = "/".join(url_parts[4:])
            bucket = self.storage_client.bucket(bucket_name)
            blob = bucket.blob(object_path)
            image_bytes = blob.download_as_bytes()
            print(f"[VisionAnalysisAgent] Downloaded image from {file_url} ({len(image_bytes)} bytes)")
        except Exception as e:
            print(f"[VisionAnalysisAgent] Error downloading image: {e}")
            return
        zone_doc = get_document("zones", zone)
        zone_context = zone_doc.to_dict() if zone_doc.exists else {}
        if "currentOccupancy" in zone_context:
            del zone_context["currentOccupancy"]
        try:
            vertex_image = VertexImage.from_bytes(image_bytes)
            prompt = f'''
You are an event safety AI. Analyze the following image and zone context for all possible risks and incidents.
Return ONLY this JSON. For personCount, analyze the image only—do NOT use or copy any value from the zone context such as currentOccupancy. If you cannot detect people, return 0.

{{
  "personCount": <number>,
  "crowdDensity": "low|moderate|high",
  "smokeDetected": <true|false>,
  "fireDetected": <true|false>,
  "stampedeDetected": <true|false>,
  "medicalEmergency": <true|false>,
  "potentialRisk": <true|false>,
  "incidentRecommended": <true|false>,
  "incidentType": "<string>",
  "suggestedAction": "<string>"
}}
Zone context (for location, risk, and other metadata, but NOT for personCount): {zone_context}
'''
            analysis, raw_response = call_gemini(self.model, prompt, vertex_image)
            if not analysis:
                print(f"[VisionAnalysisAgent] Failed to parse Gemini response as JSON, raw: {raw_response}")
                analysis = {"personCount": 0, "error": "Failed to parse Gemini response"}
            print(f"[VisionAnalysisAgent] Gemini (Vertex AI) analysis: {analysis}")
        except Exception as e:
            print(f"[VisionAnalysisAgent] Error analyzing image with Gemini (Vertex AI): {e}")
            return {"success": False, "error": str(e)}
        if doc_id:
            try:
                update_document("media", doc_id, {
                    **analysis,
                    "processed": True,
                    "analysisTimestamp": get_collection("media").document(doc_id).get().to_dict().get("analysisTimestamp")
                })
                print(f"[VisionAnalysisAgent] Updated Firestore document {doc_id} with analysis: {analysis}")
                if "personCount" in analysis:
                    update_document("zones", zone, {"currentOccupancy": analysis["personCount"]})
                    print(f"[VisionAnalysisAgent] Updated zone {zone} currentOccupancy to {analysis['personCount']}")
                from datetime import datetime
                self.comms.publish({
                    "fileUrl": file_url,
                    "zone": zone,
                    "timestamp": datetime.utcnow().isoformat() + "Z",
                    "docId": doc_id,
                    **analysis
                })
                print(f"[VisionAnalysisAgent] Published media upload event to Pub/Sub.")
            except Exception as e:
                print(f"[VisionAnalysisAgent] Error updating Firestore document {doc_id}: {e}")
        else:
            print("[VisionAnalysisAgent] No docId provided in event, skipping Firestore update.")
        return {
            "success": True,
            **analysis,
            "fileUrl": file_url,
            "zone": zone,
            "docId": doc_id
        }

    def extract_count_from_response(self, response_text):
        """
        Extracts an integer count from the Gemini response text.
        """
        try:
            # Filter out non-digit characters and convert to int
            return int(''.join(filter(str.isdigit, response_text)))
        except ValueError: # Handle cases where no digits are found or conversion fails
            print(f"[VisionAnalysisAgent] Could not extract number from Gemini response: '{response_text}'. Returning 0.")
            return 0
        except Exception as e: # Catch any other unexpected errors during extraction
            print(f"[VisionAnalysisAgent] Unexpected error in extract_count_from_response: {e}. Response: '{response_text}'. Returning 0.")
            return 0

    def start(self):
        print("[VisionAnalysisAgent] Subscribing to media Pub/Sub topic...")
        # This assumes your PubSubComms.subscribe method is blocking or handles threading
        # appropriately for a long-running background process.
        self.comms.subscribe(self.handle_media_event)