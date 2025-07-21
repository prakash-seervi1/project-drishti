from agents.base import BaseAgent
from memory.firestore_memory import FirestoreMemory
from memory.short_term import ShortTermMemory
from tools.gcp_llm import query_gemini
from tools import api_tools
from comms.pubsub import PubSubComms
import datetime

class CrowdNotificationAgent(BaseAgent):
    def __init__(self):
        memory = FirestoreMemory("notification")
        tools = {
            "llm": query_gemini,
            "fetch_incidents": api_tools.fetch_incidents,
            "fetch_zones": api_tools.fetch_zones,
            "fetch_responders": api_tools.fetch_responders,
            "fetch_alerts": api_tools.fetch_alerts,
            "build_prompt": api_tools.build_prompt
        }
        comms = PubSubComms("notification")
        short_term = ShortTermMemory(prefix="notification")
        super().__init__("notification", memory, tools, comms, short_term)

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
            f"Recent notification events (short-term):\n{short_term_context}\n"
            f"Recent notification events (long-term):\n{long_term_context}\n"
            f"Data snapshot:\n{context}\n"
            f"Given these zone risk scores and attendee locations, generate attendee alerts and notification messages.\nAssistant:"
        )
        notification = self.tools["llm"](prompt)
        self.comms.publish({"type": "notification", "notification": notification, "context": context})
        self.append_short_term(session_id, f"Notification: {notification}")
        return notification

    def start(self):
        self.comms.subscribe(self.handle_event) 