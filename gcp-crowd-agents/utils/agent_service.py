import os
import json
import time
import logging
import re
import asyncio
from typing import Dict, Any
from google.adk.agents import LlmAgent
from google.adk.runners import InMemorySessionService, Runner
from google.adk.events import Event, EventActions
from google.genai.types import Content, Part
from tools.tool_classes import (
    FetchIncidentsTool,
    GetActiveIncidentsTool,
    FetchZonesTool,
    FetchRespondersTool,
    GetAvailableRespondersTool,
    FetchAlertsTool,
    AnalyzeResponderAssignmentsTool,
    AssignResponderToIncidentTool,
    AssignAnyResponderToIncidentTool,
    AssignResponderToZoneTool,
    AssignAnyResponderToZoneTool,
    NotifyUnavailableTool,
    SuggestZonesNeedingRespondersTool,
    GetIncidentsForResponderTool,
    GetIncidentsDetailsForResponderTool
)

# Configure logging
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s %(levelname)s %(name)s: %(message)s', '%Y-%m-%d %H:%M:%S')
handler.setFormatter(formatter)
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
if not logger.hasHandlers():
    logger.addHandler(handler)

class AgentService:
    """Singleton class to manage shared LlmAgent, Runner, and InMemorySessionService."""
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AgentService, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        logger.info("Initializing tools for LlmAgent...")
        self.session_service = InMemorySessionService()
        self.app_name = "gcp_crowd_agents"
        self.user_id = "default_user"

        # All tools
        tool_objects = [
            FetchIncidentsTool(),
            GetActiveIncidentsTool(),
            FetchZonesTool(),
            FetchRespondersTool(),
            GetAvailableRespondersTool(),
            FetchAlertsTool(),
            AnalyzeResponderAssignmentsTool(),
            AssignResponderToIncidentTool(),
            AssignAnyResponderToIncidentTool(),
            AssignResponderToZoneTool(),
            AssignAnyResponderToZoneTool(),
            NotifyUnavailableTool(),
            SuggestZonesNeedingRespondersTool(),
            GetIncidentsForResponderTool(),
            GetIncidentsDetailsForResponderTool()
        ]
        logger.info(f"Registered tool objects: {[tool.__class__.__name__ for tool in tool_objects]}")

        model_name = os.getenv("VERTEX_MODEL", "gemini-1.5-pro")
        agent_name = os.getenv("AGENT_NAME", "crowd_agent")
        logger.info(f"Initializing LlmAgent with model: {model_name}, name: {agent_name}")

        try:
            self.llm_agent = LlmAgent(
                model=model_name,
                name=agent_name,
                instruction=(
                    "You are an event safety AI assistant. Use the following tools to handle user queries:\n"
                    "- fetch_incidents: Fetch all incidents from Firestore.\n"
                    "- get_active_incidents: Fetch only active incidents.\n"
                    "- fetch_zones: Fetch all zones from Firestore.\n"
                    "- fetch_responders: Fetch all responders from Firestore.\n"
                    "- get_available_responders: Fetch only available responders.\n"
                    "- fetch_alerts: Fetch all alerts from Firestore.\n"
                    "- analyze_responder_assignments: Analyze available responders and their incident assignments.\n"
                    "- assign_responder_to_incident(incident_id: str): Assign a specific responder to an incident.\n"
                    "- assign_any_responder_to_incident(incident_id: str): Assign any available responder to an incident.\n"
                    "- assign_responder_to_zone(responder_id: str, zone_id: str): Assign a specific responder to a zone.\n"
                    "- assign_any_responder_to_zone(zone_id: str): Assign any available responder to a zone.\n"
                    "- notify_unavailable(zone_id: str): Log an alert for unavailable responders in a zone.\n"
                    "- suggest_zones_needing_responders: Suggest zones or incidents that need more responders.\n"
                    "- get_incidents_for_responder(responder_id: str): Fetch all incidents for a given responder.\n"
                    "- get_incidents_details_for_responder(responder_id: str): Fetch full incident details for a given responder.\n"
                    "Instructions:\n"
                    "- If the user asks to assign a responder but does not specify which one, use the 'assign_any_responder_to_incident' or 'assign_any_responder_to_zone' tool.\n"
                    "- If the user asks where more responders are needed, use 'suggest_zones_needing_responders'.\n"
                    "- If the user asks for only active incidents or available responders, use 'get_active_incidents' or 'get_available_responders'.\n"
                    "- If the user asks for incidents assigned to a specific responder, use 'get_incidents_for_responder'.\n"
                    "- If the user asks for full incident details for a specific responder, use 'get_incidents_details_for_responder'.\n"
                    "- If a tool returns an error, return the 'error_message' as the response.\n"
                    "- If the query is unclear or lacks required arguments, ask the user for clarification.\n"
                    "\n"
                    "Formatting and Presentation:\n"
                    "- Always present information using human-readable names (not raw IDs) and format dates in a user-friendly way.\n"
                    "- When summarizing or presenting data, use clear sections, bullet points, and highlight important information in bold (e.g., **Zone A**, **Critical Incident**).\n"
                    "- Make your responses well-formatted, informative, and visually engaging so users are interested and can quickly understand the key points.\n"
                    "- If a user asks for a summary, provide a concise, readable summary with highlights.\n"
                    "\n"
                    "Important: Do NOT output placeholder or loading messages like 'Fetching...', 'Loading...', or 'Analyzing...'. Always fetch all necessary data using the tools, and only produce your final output after all data is available."
                ),
                tools=tool_objects
            )
        except Exception as e:
            logger.error(f"Failed to initialize LlmAgent: {str(e)}")
            raise

        logger.info(f"Initializing Runner with app_name: {self.app_name}")
        try:
            self.runner = Runner(
                agent=self.llm_agent,
                session_service=self.session_service,
                app_name=self.app_name
            )
        except Exception as e:
            logger.error(f"Failed to initialize Runner: {str(e)}")
            raise

        self.initialized = True
        logger.info("[AgentService] Initialization complete.")

    async def ensure_session(self, session_id):
        session = await self.session_service.get_session(
            app_name=self.app_name,
            user_id=self.user_id,
            session_id=session_id
        )
        if session is None:
            session = await self.session_service.create_session(
                app_name=self.app_name,
                user_id=self.user_id,
                session_id=session_id,
                state={}
            )
        return session

    async def get_structured_context(self, session_id):
        session = await self.ensure_session(session_id)
        state = session.state if hasattr(session, 'state') else {}
        return state.get("structured_context", {})

    async def update_structured_context(self, session_id, user_query, llm_answer, prev_context):
        new_context = prev_context.copy() if prev_context else {}
        if "zone" in user_query.lower():
            match = re.search(r"zone\s*([a-zA-Z0-9]+)", user_query, re.IGNORECASE)
            if match:
                new_context["last_zone"] = match.group(1)
                new_context["last_intent"] = "zone_analysis"
        if "incident" in user_query.lower():
            new_context["last_intent"] = "incident_analysis"
        session = await self.ensure_session(session_id)
        state = session.state if hasattr(session, 'state') else {}
        state["structured_context"] = new_context
        session.state = state
        logger.info(f"Updated structured context: {new_context}")
        return new_context

    async def get_short_term_context(self, session_id):
        session = await self.ensure_session(session_id)
        all_session_events = session.events if hasattr(session, 'events') else []
        filtered_context = []
        for e in reversed(all_session_events):
            content_text = ""
            if isinstance(e.content, Content):
                for part in e.content.parts:
                    if isinstance(part, Part) and hasattr(part, 'text') and part.text is not None:
                        content_text += part.text
            elif isinstance(e.content, str):
                content_text = e.content
            if e.author == "user":
                filtered_context.append(f"User: {content_text}")
            elif e.author == "assistant":
                filtered_context.append(f"Assistant: {content_text}")
            if len(filtered_context) >= 10:
                break
        return "\n".join(reversed(filtered_context))

    def _sanitize_for_log(self, obj):
        # If it's a Content object, flatten its text
        if isinstance(obj, Content):
            return " | ".join([part.text.replace('\n', ' | ') if hasattr(part, 'text') and part.text else '' for part in obj.parts])
        # Handle EventActions
        if isinstance(obj, EventActions):
            return vars(obj)
        if isinstance(obj, dict):
            return {k: self._sanitize_for_log(v) for k, v in obj.items()}
        if isinstance(obj, list):
            return [self._sanitize_for_log(i) for i in obj]
        if isinstance(obj, str):
            return obj.replace('\n', ' | ')
        return obj

    async def append_event(self, session_id, event_data):
        session = await self.ensure_session(session_id)
        event_data = event_data.copy()
        event_data.setdefault("author", "system")
        event_data.setdefault("invocation_id", "default_event")
        event_data.setdefault("timestamp", int(time.time() * 1000))
        if "actions" not in event_data or not isinstance(event_data["actions"], EventActions):
            event_data["actions"] = EventActions()
        if "content" in event_data and isinstance(event_data["content"], str):
            event_data["content"] = Content(parts=[Part(text=event_data["content"])])
        elif "content" not in event_data:
            event_data["content"] = Content(parts=[Part(text="")])
        event_type = event_data.pop("type", None)
        sanitized_event_data = self._sanitize_for_log(event_data)
        logger.info(f"[AgentService] Creating event with: {json.dumps(sanitized_event_data, separators=(',', ':'))}, original type: {event_type}")
        try:
            event = Event(**event_data)
            await self.session_service.append_event(session, event)
            # Log session events after append
            logger.info(f"[AgentService] Session events after append: {[e for e in getattr(session, 'events', [])]}")
        except Exception as e:
            logger.error(f"[AgentService] Validation error details: {str(e)}")
            raise

    async def run_llm(self, prompt, session_id="default"):
        input_content = Content(
            role="user",
            parts=[Part(text=prompt)]
        )
        logger.info(f"[AgentService] Running LLM with prompt: {prompt}")
        answer = ""
        try:
            async for result_event in self.runner.run_async(
                user_id=self.user_id,
                session_id=session_id,
                new_message=input_content
            ):
                logger.info(f"Result event: {result_event}")
                if result_event.actions and hasattr(result_event.actions, "tool_call") and result_event.actions.tool_call:
                    logger.info(f"Tool call: name={result_event.actions.tool_call.name}, args={result_event.actions.tool_call.args}")
                if isinstance(result_event.content, Content):
                    for part in result_event.content.parts:
                        logger.info(f"Processing Part: {vars(part)}")
                        if isinstance(part, Part) and hasattr(part, 'text') and part.text is not None:
                            answer += part.text
                        else:
                            logger.warning(f"Skipping Part with invalid or missing text: {vars(part)}")
                if result_event.error_code:
                    logger.error(f"Error in result event: code={result_event.error_code}, message={result_event.error_message}")
                    logger.info(f"Full result event details: {vars(result_event)}")
        except Exception as e:
            logger.error(f"[AgentService] Error in run_llm: {str(e)}")
            raise
        logger.info(f"[AgentService] LLM answer: {answer}")
        return answer

    async def close(self):
        logger.info("[AgentService] Closing AgentService...")