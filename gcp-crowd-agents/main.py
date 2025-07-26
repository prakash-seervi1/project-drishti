from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from agents.summary import SituationalSummaryAgent
from agents.escalation import EmergencyEscalationAgent
from agents.notification import CrowdNotificationAgent
from agents.dispatcher import ResponseDispatcherAgent
from agents.chat import ChatAgent
from agents.incident_agent import IncidentAgent
from api.zones import router as zones_router
from api.responders import router as responders_router
from api.emergency_contacts import router as emergency_contacts_router
from api.upload import router as upload_router
from api.vision import router as vision_router
from api.alerts import router as alerts_router
from api.venues import router as venues_router
from api.predict import router as predict_router
from api.db_tools_api import router as db_tools_router
from utils.mcp_server import router as mcp_router
import logging
from utils.agent_service import AgentService

app = FastAPI()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# CORS middleware for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize agents
summary_agent = SituationalSummaryAgent()
escalation_agent = EmergencyEscalationAgent()
notification_agent = CrowdNotificationAgent()
dispatcher_agent = ResponseDispatcherAgent()
chat_agent = ChatAgent()
agent_service = AgentService()
incident_agent = IncidentAgent()
incident_agent.start()

# Mount API routers
app.include_router(zones_router, prefix="/api")
app.include_router(responders_router, prefix="/api")
app.include_router(emergency_contacts_router, prefix="/api")
app.include_router(upload_router, prefix="/api")
app.include_router(vision_router, prefix="/api")
app.include_router(alerts_router, prefix="/api")
app.include_router(venues_router, prefix="/api")
app.include_router(predict_router, prefix="/api")
app.include_router(db_tools_router, prefix="/api")
app.include_router(mcp_router,prefix="/mcp")  # Add MCP router

# Add ADK UI (optional)
try:
    from google.adk.ui.fastapi import mount_adk_ui
    mount_adk_ui(app)
    logger.info("ADK UI mounted at /ui")
except ImportError as e:
    logger.error(f"ADK UI ImportError: {e}")
except Exception as e:
    logger.error(f"ADK UI mounting failed: {e}")

@app.get("/")
def read_root():
    return {"message": "GCP Crowd Agents system is running"}

@app.post("/summary")
def run_summary(event: dict = Body(...)):
    session_id = event.get("session_id", "default")
    summary = summary_agent.handle_event(event, session_id=session_id)
    return {"summary": summary}

@app.post("/escalation")
def run_escalation(event: dict = Body(...)):
    session_id = event.get("session_id", "default")
    escalation = escalation_agent.handle_event(event, session_id=session_id)
    return {"escalation": escalation}

@app.post("/notification")
def run_notification(event: dict = Body(...)):
    session_id = event.get("session_id", "default")
    notification = notification_agent.handle_event(event, session_id=session_id)
    return {"notification": notification}

@app.post("/dispatcher")
def run_dispatcher(event: dict = Body(...)):
    session_id = event.get("session_id", "default")
    dispatch = dispatcher_agent.handle_event(event, session_id=session_id)
    return {"dispatch": dispatch}

@app.post("/chat")
async def chat_endpoint(payload: dict = Body(...)):
    user_query = payload.get("query")
    session_id = payload.get("session_id", "default")
    if not user_query:
        return {"error": "Missing query"}
    answer = await chat_agent.handle_query(user_query, session_id=session_id)
    return {"answer": answer}

@app.get("/api/chat/session-events/{session_id}")
async def get_chat_session_events(session_id: str):
    events_list = await chat_agent.get_session_events(session_id)
    return {"session_id": session_id, "events": events_list}

# @app.on_event("shutdown")
# async def shutdown():
#     logger.info("[Main] Shutting down...")
#     await chat_agent.close()