import os
from google.cloud import firestore
from comms.pubsub import PubSubComms
from tools.gcp_llm import query_gemini
import json
import re

class IncidentAgent:
    def __init__(self, topic="media-uploads"):
        self.db = firestore.Client()
        self.comms = PubSubComms(topic)

    def extract_json_from_markdown(self, text):
        text = re.sub(r'^```json\s*', '', text.strip(), flags=re.IGNORECASE|re.MULTILINE)
        text = re.sub(r'^```\s*', '', text, flags=re.MULTILINE)
        text = re.sub(r'```$', '', text, flags=re.MULTILINE)
        return text.strip()

    def handle_media_event(self, event):
        print(f"[IncidentAgent] Received media event: {event}")
        zone_id = event.get("zone")
        analysis = event  # The analysis JSON from vision agent
        if not zone_id:
            print("[IncidentAgent] No zone in event, skipping.")
            return

        # Fetch zone context
        zone_doc = self.db.collection("zones").document(zone_id).get()
        zone = zone_doc.to_dict() if zone_doc.exists else {}

        # Fetch current incidents
        incidents_query = (
            self.db.collection("incidents")
            .where("zoneId", "==", zone_id)
            .where("status", "==", "active")
        )
        incidents = [
            doc.to_dict() | {"id": doc.id}
            for doc in incidents_query.stream()
        ]

        # Fetch available responders
        responders_query = (
            self.db.collection("responders")
            .where("status", "==", "available")
        )
        responders = [
            doc.to_dict() | {"id": doc.id}
            for doc in responders_query.stream()
        ]

        # Fetch recent alerts (last 10)
        alerts_query = self.db.collection("alerts").order_by("timestamp", direction=firestore.Query.DESCENDING).limit(10)
        alerts = [doc.to_dict() | {"id": doc.id} for doc in alerts_query.stream()]

        # Build smart prompt for Gemini
        prompt = f'''
You are an incident management AI for a live event. Given the latest analysis, current incidents, responders, zone context, and recent alerts, return ONLY this JSON:
{{
  "actions": [
    {{
      "type": "create|update|close|escalate|assign_responder|send_alert|none",
      "incidentTypes": [<list of incident types, e.g., "fire", "medical", "crowd">],
      "incidentIds": [<list of incident ids, or empty if creating new>],
      "priority": "<string>",
      "responderIds": [<list of responder ids>],
      "alertType": "<string or null>",
      "notes": "<string>",
      "reason": "<string explaining why this action is needed>"
    }}
  ]
}}

Latest analysis: {analysis}
Current incidents: {incidents}
Current responders: {responders}
Zone context: {zone}
Recent alerts: {alerts}

Instructions:
- If an incident should be closed, include a 'close' action with the incidentId and reason.
- If a new incident is needed (e.g., fire detected but no fire incident exists), include a 'create' action with the type and reason.
- If an incident needs escalation or priority change, include an 'escalate' or 'update' action.
- If responders should be assigned or reassigned, include 'assign_responder' actions.
- If an alert should be sent and a similar alert is not already present, include a 'send_alert' action.
- If no action is needed, return an empty actions list.
- Always explain the reason for each action.
'''
        print(f"[IncidentAgent] Prompting Gemini with context...")
        response_text = query_gemini(prompt)
        try:
            clean_response = self.extract_json_from_markdown(response_text)
            actions = json.loads(clean_response)
        except Exception as e:
            print(f"[IncidentAgent] Failed to parse Gemini response as JSON: {e}, raw: {response_text}")
            actions = {"actions": [], "error": "Failed to parse Gemini response"}
        print(f"[IncidentAgent] Gemini recommended actions: {actions}")

        # Log Gemini prompt, response, and parsed actions to Firestore
        self.db.collection("gemini_logs").add({
            "timestamp": firestore.SERVER_TIMESTAMP,
            "prompt": prompt,
            "response": response_text,
            "parsed": actions,
            "source": "incident_agent"
        })

        # === ACTUAL ACTION HANDLING ===
        for action in actions.get("actions", []):
            action_type = action.get("type")
            reason = action.get("reason", "")
            print(f"[IncidentAgent] Processing action: {action_type} | Reason: {reason}")

            if action_type == "create":
                for inc_type in action.get("incidentTypes", ["unknown"]):
                    incident_data = {
                        "type": inc_type,
                        "zoneId": zone_id,
                        "priority": action.get("priority", "medium"),
                        "status": "active",
                        "timestamp": firestore.SERVER_TIMESTAMP,
                        "notes": action.get("notes", ""),
                        "source": "incident_agent"
                    }
                    doc_ref = self.db.collection("incidents").add(incident_data)
                    print(f"[IncidentAgent] Created new incident: {doc_ref[1].id}")

            elif action_type == "update":
                for inc_id in action.get("incidentIds", []):
                    update_data = {
                        "priority": action.get("priority"),
                        "notes": action.get("notes", ""),
                        "lastUpdated": firestore.SERVER_TIMESTAMP
                    }
                    self.db.collection("incidents").document(inc_id).update(update_data)
                    print(f"[IncidentAgent] Updated incident: {inc_id}")

            elif action_type == "close":
                for inc_id in action.get("incidentIds", []):
                    self.db.collection("incidents").document(inc_id).update({
                        "status": "closed",
                        "closedAt": firestore.SERVER_TIMESTAMP,
                        "notes": action.get("notes", "")
                    })
                    print(f"[IncidentAgent] Closed incident: {inc_id}")

                    # Release all responders assigned to this incident
                    responders_query = self.db.collection("responders").where("assignedIncident", "==", inc_id)
                    for responder_doc in responders_query.stream():
                        responder_id = responder_doc.id
                        self.db.collection("responders").document(responder_id).update({
                            "status": "available",
                            "assignedIncident": None,
                            "releasedAt": firestore.SERVER_TIMESTAMP
                        })
                        # Log status update
                        self.db.collection("responder_status_updates").add({
                            "responderId": responder_id,
                            "status": "available",
                            "incidentId": inc_id,
                            "timestamp": firestore.SERVER_TIMESTAMP,
                            "notes": "Released after incident closed"
                        })
                        print(f"[IncidentAgent] Released responder: {responder_id} from incident: {inc_id}")

            elif action_type == "escalate":
                for inc_id in action.get("incidentIds", []):
                    self.db.collection("incidents").document(inc_id).update({
                        "priority": "critical",
                        "notes": action.get("notes", ""),
                        "lastUpdated": firestore.SERVER_TIMESTAMP
                    })
                    print(f"[IncidentAgent] Escalated incident: {inc_id}")

            elif action_type == "assign_responder":
                for responder_id in action.get("responderIds", []):
                    assigned_incident = action.get("incidentIds", [None])[0]
                    self.db.collection("responders").document(responder_id).update({
                        "status": "assigned",
                        "assignedIncident": assigned_incident,
                        "assignedAt": firestore.SERVER_TIMESTAMP
                    })
                    # Log status update
                    self.db.collection("responder_status_updates").add({
                        "responderId": responder_id,
                        "status": "assigned",
                        "incidentId": assigned_incident,
                        "timestamp": firestore.SERVER_TIMESTAMP,
                        "notes": action.get("notes", "")
                    })
                    print(f"[IncidentAgent] Assigned responder: {responder_id}")

            elif action_type == "send_alert":
                alert_data = {
                    "alertType": action.get("alertType", "general"),
                    "zoneId": zone_id,
                    "message": action.get("notes", ""),
                    "timestamp": firestore.SERVER_TIMESTAMP,
                    "source": "incident_agent"
                }
                self.db.collection("alerts").add(alert_data)
                print(f"[IncidentAgent] Sent alert: {alert_data}")

            else:
                print(f"[IncidentAgent] No action or unknown action type: {action_type}")

    def start(self):
        print("[IncidentAgent] Subscribing to media-uploads Pub/Sub topic...")
        self.comms.subscribe(self.handle_media_event)
