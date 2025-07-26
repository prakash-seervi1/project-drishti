from google.cloud import firestore, storage
from tools.gcp_llm import query_gemini
import base64
import os
import json

class VenuesAgent:
    def __init__(self):
        self.db = firestore.Client()
        self.storage_client = storage.Client()

    def create_venue(self, venue_data):
        eventName = venue_data.get("eventName")
        venueType = venue_data.get("venueType")
        venueArea = venue_data.get("venueArea")
        entryGates = venue_data.get("entryGates")
        crowdType = venue_data.get("crowdType")
        autoZone = venue_data.get("autoZone", False)
        createdBy = venue_data.get("createdBy")
        zones = venue_data.get("zones")
        imageUrl = venue_data.get("imageUrl")

        if not (eventName and venueType and venueArea and entryGates and crowdType):
            raise ValueError("Missing required fields.")

        venueId = eventName.lower().replace(" ", "_") + "_" + str(firestore.SERVER_TIMESTAMP)
        finalZones = zones

        # If autoZone, use Gemini to suggest zones
        if imageUrl:
            gcs_match = imageUrl.replace("https://storage.googleapis.com/", "").split("/", 1)
            if len(gcs_match) != 2:
                raise ValueError("Invalid imageUrl format for GCS.")
            bucket_name, file_path = gcs_match
            blob = self.storage_client.bucket(bucket_name).blob(file_path)
            image_bytes = blob.download_as_bytes()
            base64_image = base64.b64encode(image_bytes).decode("utf-8")
            prompt = (
                f"Given a venue of type '{venueType}' with area {venueArea} sq.ft, "
                f"{entryGates} entry gates, and crowd type '{crowdType}', analyze the uploaded layout image and suggest an optimal division into safety zones. "
                "For each zone, return a JSON array with: "
                "zoneId (must be unique and prefixed with the venueId, e.g. '<venueId>_zone-1'), "
                "name (human-friendly zone name), "
                "area (sq.ft), "
                "capacity (number), "
                "assignedGates (array of gate indices), "
                "risk (none, cascading, overcrowding, etc). "
                "Example:\n"
                f"[{{\"zoneId\": \"{eventName.lower().replace(' ', '_')}_zone-1\", \"name\": \"Main Hall\", \"area\": 2500, \"capacity\": 500, \"assignedGates\": [0], \"risk\": \"none\"}}, ...]"
                "\nReturn ONLY the JSON array."
            )
            # NOTE: query_gemini currently only supports text. You may need to adapt this to send image if your backend supports it.
            gemini_response = query_gemini(prompt)
            # Strip markdown code fences if present
            if gemini_response.strip().startswith('```'):
                gemini_response = gemini_response.strip()
                if gemini_response.startswith('```json'):
                    gemini_response = gemini_response[len('```json'):]
                elif gemini_response.startswith('```'):
                    gemini_response = gemini_response[len('```'):]
                if gemini_response.endswith('```'):
                    gemini_response = gemini_response[:-3]
                gemini_response = gemini_response.strip()
            try:
                finalZones = json.loads(gemini_response)
            except Exception as e:
                raise ValueError(f"Failed to parse Gemini response: {gemini_response}")

        # Venue data
        venue_data = {
            "eventName": eventName,
            "venueType": venueType,
            "venueArea": venueArea,
            "entryGates": entryGates,
            "crowdType": crowdType,
            "autoZone": autoZone,
            "layoutImageUrl": imageUrl or None,
            "createdAt": firestore.SERVER_TIMESTAMP,
            "createdBy": createdBy or None,
            "zones": finalZones if isinstance(finalZones, list) else [],
        }

        if autoZone:
            self.db.collection("venues").document(venueId).set(venue_data)
      
        # Create each zone as a subcollection doc
        if autoZone and isinstance(finalZones, list) and finalZones:
            zones_col = self.db.collection("venues").document(venueId).collection("zones")
            for idx, zone in enumerate(finalZones):
                # Ensure unique zoneId with venueId prefix
                zone_id = zone.get("zoneId") or f"{venueId}_zone-{idx+1}"
                zones_col.document(zone_id).set(zone)

                # Also insert into top-level 'zones' collection
                zone_doc = {
                    "id": zone_id,
                    "name": zone.get("name") or zone.get("zoneId") or zone_id,
                    "venueId": venueId,
                    "venueName": eventName,
                    "area": zone.get("area"),
                    "capacity": zone.get("capacity"),
                    "assignedGates": zone.get("assignedGates", []),
                    "risk": zone.get("risk", "none"),
                    "status": "normal",  # or infer from risk/occupancy
                    "currentOccupancy": 0,
                    "incidents": 0,
                    "lastUpdate": firestore.SERVER_TIMESTAMP,
                }
                self.db.collection("zones").document(zone_id).set(zone_doc)

        return {"message": "Venue and zones created", "venueId": venueId, "zones": venue_data["zones"]} 



        