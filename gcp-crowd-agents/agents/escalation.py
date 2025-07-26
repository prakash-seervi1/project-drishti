from agents.base import BaseAgent
from memory.firestore_memory import FirestoreMemory
from tools.gcp_llm import query_gemini
from tools import db_tools
from comms.pubsub import PubSubComms
import datetime
import json

class EmergencyEscalationAgent(BaseAgent):
    def __init__(self):
        memory = FirestoreMemory("escalation")
        tools = {
            "llm": query_gemini,
            "fetch_incidents": db_tools.fetch_incidents,
            "fetch_zones": db_tools.fetch_zones,
            "fetch_responders": db_tools.fetch_responders,
            "fetch_alerts": db_tools.fetch_alerts,
        }
        comms = PubSubComms("escalation")
        super().__init__("escalation", memory, tools, comms)

    def get_structured_context(self, session_id):
        context = self.memory.get_context(session_id) if hasattr(self.memory, "get_context") else None
        if context:
            try:
                context_dict = json.loads(context)
                for e in reversed(context_dict):
                    if e.get("type") == "structured_context":
                        return e.get("data", {})
            except Exception:
                pass
        return {}

    def update_structured_context(self, session_id, event, escalation, prev_context):
        new_context = prev_context.copy() if prev_context else {}
        event_content = str(event)
        if "zone" in event_content.lower():
            import re
            match = re.search(r"zone\s*([a-zA-Z0-9]+)", event_content, re.IGNORECASE)
            if match:
                new_context["last_zone"] = match.group(1)
                new_context["last_intent"] = "zone_escalation"
        if "incident" in event_content.lower():
            new_context["last_intent"] = "incident_escalation"
        structured_event = {
            "type": "structured_context",
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "data": new_context
        }
        self.memory.save_context(session_id, structured_event)
        return new_context

    def handle_event(self, event, session_id="default"):
        event["timestamp"] = datetime.datetime.utcnow().isoformat()
        self.memory.save_event(event)
        event_entry = {
            "type": "event",
            "timestamp": event["timestamp"],
            "content": str(event)
        }
        self.memory.save_context(session_id, event_entry)
        long_term_context = self.memory.get_recent_events(limit=5)
        context = {
            "incidents": self.tools["fetch_incidents"](),
            "zones": self.tools["fetch_zones"](),
            "responders": self.tools["fetch_responders"](),
            "alerts": self.tools["fetch_alerts"]()
        }
        structured_context = self.get_structured_context(session_id)
        structured_context_str = f"\nStructured context: {json.dumps(structured_context)}" if structured_context else ""
        prompt = (
            f"Recent escalation events (long-term):\n{long_term_context}\n"
            f"Data snapshot:\n{context}\n"
            f"{structured_context_str}\n"
            f"Given these critical unresolved alerts, generate an escalation summary and instructions for police/fire/EMS.\nAssistant:"
        )
        escalation = self.tools["llm"](prompt)
        self.comms.publish({"type": "escalation", "escalation": escalation, "context": context})
        escalation_entry = {
            "type": "escalation",
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "content": escalation
        }
        self.memory.save_context(session_id, escalation_entry)
        self.update_structured_context(session_id, event, escalation, structured_context)
        return escalation

    def start(self):
        self.comms.subscribe(self.handle_event) 