from agents.base import BaseAgent
from memory.firestore_memory import FirestoreMemory
from memory.short_term import ShortTermMemory
from tools.gcp_llm import query_gemini
from tools import api_tools
from comms.pubsub import PubSubComms
import datetime

class EmergencyEscalationAgent(BaseAgent):
    def __init__(self):
        memory = FirestoreMemory("escalation")
        tools = {
            "llm": query_gemini,
            "fetch_incidents": api_tools.fetch_incidents,
            "fetch_zones": api_tools.fetch_zones,
            "fetch_responders": api_tools.fetch_responders,
            "fetch_alerts": api_tools.fetch_alerts,
            "build_prompt": api_tools.build_prompt
        }
        comms = PubSubComms("escalation")
        short_term = ShortTermMemory(prefix="escalation")
        super().__init__("escalation", memory, tools, comms, short_term)

    def handle_event(self, event, session_id="default"):
        event["timestamp"] = datetime.datetime.utcnow().isoformat()
        self.memory.save_event(event)
        self.append_short_term(session_id, f"Event: {event}")
        short_term_context = self.get_short_term(session_id)
        long_term_context = self.memory.get_recent_events(limit=5)
        context = {
            "incidents": self.tools["fetch_incidents"](),
            "zones": self.tools["fetch_zones"](),
            "responders": self.tools["fetch_responders"](),
            "alerts": self.tools["fetch_alerts"]()
        }
        prompt = (
            f"Recent escalation events (short-term):\n{short_term_context}\n"
            f"Recent escalation events (long-term):\n{long_term_context}\n"
            f"Data snapshot:\n{context}\n"
            f"Given these critical unresolved alerts, generate an escalation summary and instructions for police/fire/EMS.\nAssistant:"
        )
        escalation = self.tools["llm"](prompt)
        self.comms.publish({"type": "escalation", "escalation": escalation, "context": context})
        self.append_short_term(session_id, f"Escalation: {escalation}")
        return escalation

    def start(self):
        self.comms.subscribe(self.handle_event) 