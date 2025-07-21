from agents.base import BaseAgent
from memory.firestore_memory import FirestoreMemory
from memory.short_term import ShortTermMemory
from tools.gcp_llm import query_gemini
from tools import api_tools
from comms.pubsub import PubSubComms

class ChatAgent(BaseAgent):
    def __init__(self):
        memory = FirestoreMemory("chat")
        tools = {
            "llm": query_gemini,
            "fetch_incidents": api_tools.fetch_incidents,
            "fetch_zones": api_tools.fetch_zones,
            "fetch_responders": api_tools.fetch_responders,
            "fetch_alerts": api_tools.fetch_alerts,
            "build_prompt": api_tools.build_prompt
        }
        comms = PubSubComms("chat")
        short_term = ShortTermMemory(prefix="chat")  # Use Redis/Memorystore
        super().__init__("chat", memory, tools, comms, short_term)

    def handle_query(self, user_query, session_id="default"):
        print(f"[ChatAgent] handle_query called with session_id={session_id}, user_query={user_query}")
        # Append user query to short-term memory
        self.append_short_term(session_id, f"User: {user_query}")
        print("[ChatAgent] Appended to short-term memory")
        # Fetch context from short-term and long-term memory
        short_term_context = self.get_short_term(session_id)
        print(f"[ChatAgent] short_term_context: {short_term_context}")
        long_term_context = self.memory.get_recent_events(limit=5)
        print(f"[ChatAgent] long_term_context: {long_term_context}")
        # Fetch structured data
        print("[ChatAgent] Fetching structured data from Firestore")
        context = {
            "incidents": self.tools["fetch_incidents"](),
            "zones": self.tools["fetch_zones"](),
            "responders": self.tools["fetch_responders"](),
            "alerts": self.tools["fetch_alerts"]()
        }
        print(f"[ChatAgent] context: {context}")
        # Build prompt with both memories and structured data
        prompt = (
            f"Recent conversation:\n{short_term_context}\n"
            f"Recent events:\n{long_term_context}\n"
            f"Data snapshot:\n{context}\n"
            f"User: {user_query}\nAssistant:"
        )
        print(f"[ChatAgent] prompt: {prompt}")
        print("[ChatAgent] Calling LLM (Gemini)")
        answer = self.tools["llm"](prompt)
        print(f"[ChatAgent] LLM answer: {answer}")
        self.memory.save_event({"query": user_query, "answer": answer})
        print("[ChatAgent] Saved to long-term memory")
        self.append_short_term(session_id, f"Assistant: {answer}")
        print("[ChatAgent] Appended answer to short-term memory")
        print("[ChatAgent] Returning answer")
        return answer 