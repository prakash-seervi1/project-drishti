from memory.firestore_memory import FirestoreMemory
from comms.pubsub import PubSubComms
from utils.agent_service import AgentService
import json
import time
from google.adk.events import Event, EventActions
from google.genai.types import Content, Part
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ChatAgent:
    def __init__(self):
        memory = FirestoreMemory("chat")
        comms = PubSubComms("chat")
        self.agent_service = AgentService()
        self.memory = memory
        self.comms = comms

    def make_json_serializable(self, obj):
        if isinstance(obj, dict):
            return {k: self.make_json_serializable(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [self.make_json_serializable(i) for i in obj]
        elif hasattr(obj, 'isoformat'):
            return obj.isoformat()
        else:
            return obj

    async def handle_query(self, user_query, session_id="default", use_llm_prompt=False):
        logger.info(f"[ChatAgent] handle_query called with session_id={session_id}, user_query={user_query.replace(chr(10), ' | ')}")
        user_event = {
            "type": "user_query",
            "timestamp": int(time.time() * 1000),
            "content": user_query,
            "author": "user",
            "invocation_id": "user_event",
            "actions": EventActions()
        }
        await self.agent_service.append_event(session_id, user_event)
        logger.info("[ChatAgent] Appended user query to short-term memory")
        short_term_context = await self.agent_service.get_short_term_context(session_id)
        logger.info(f"[ChatAgent] short_term_context: {short_term_context.replace(chr(10), ' | ')}")
        long_term_context = self.memory.get_recent_events(limit=5)
        logger.info(f"[ChatAgent] long_term_context: {json.dumps(long_term_context, separators=(',', ':'))}")
        logger.info("[ChatAgent] Fetching structured data from Firestore")
        # Build prompt without up-front data fetching
        prompt = (
            f"Instructions: Use the available tools to fetch incidents, zones, and responders as needed. "
            f"When presenting information, always use human-readable names (not IDs) and format dates in a user-friendly way.\n"
            f"Recent conversation:\n{short_term_context}\n"
            f"Recent events:\n{long_term_context}\n"
            f"User: {user_query}\nAssistant:"
        )
        if use_llm_prompt:
            meta_prompt = (
                f"You are a prompt engineer. Given the following context, generate a clear, effective prompt for a chat agent.\n"
                f"Context variables: {{'short_term_context': short_term_context, 'long_term_context': long_term_context, 'user_query': user_query}}\n"
                "Return ONLY the prompt."
            )
            prompt = await self.agent_service.run_llm(meta_prompt, session_id)
        logger.info(f"[ChatAgent] prompt: {prompt.replace(chr(10), ' | ')}")
        logger.info("[ChatAgent] Calling LLM via AgentService")
        answer = await self.agent_service.run_llm(prompt, session_id)
        logger.info(f"[ChatAgent] LLM answer: {str(answer).replace(chr(10), ' | ')}")
        self.memory.save_event({"query": user_query, "answer": answer})
        logger.info("[ChatAgent] Saved to long-term memory")
        assistant_event = {
            "type": "assistant_response",
            "timestamp": int(time.time() * 1000),
            "content": answer,
            "author": "assistant",
            "invocation_id": "assistant_event",
            "actions": EventActions()
        }
        await self.agent_service.append_event(session_id, assistant_event)
        logger.info("[ChatAgent] Appended answer to short-term memory")
        await self.agent_service.update_structured_context(session_id, user_query, answer, {})
        logger.info("[ChatAgent] Updated structured context in short-term memory")
        logger.info("[ChatAgent] Returning answer")
        return answer

    async def get_session_events(self, session_id: str) -> list:
        """Returns session events for the given session ID."""
        session = await self.agent_service.ensure_session(session_id)
        events_list = []
        for e in session.events:
            content_text = ""
            if isinstance(e.content, Content):
                for part in e.content.parts:
                    if hasattr(part, 'text') and part.text is not None:
                        content_text += part.text
            elif isinstance(e.content, str):
                content_text = e.content
            events_list.append({
                "author": e.author,
                "content": content_text,
                "invocation_id": e.invocation_id,
                "timestamp": e.timestamp
            })
        return events_list