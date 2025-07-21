from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from agents.summary import SituationalSummaryAgent
from agents.escalation import EmergencyEscalationAgent
from agents.notification import CrowdNotificationAgent
from agents.dispatcher import ResponseDispatcherAgent
from agents.chat import ChatAgent
from agents.incident_agent import IncidentAgent
from api.incidents import router as incidents_router
from api.zones import router as zones_router
from api.responders import router as responders_router
from api.emergency_contacts import router as emergency_contacts_router
from api.upload import router as upload_router
from api.vision import router as vision_router
from api.alerts import router as alerts_router
from api.venues import router as venues_router
from api.predict import router as predict_router

app = FastAPI()

# CORS middleware for development (allow all origins)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or ["http://localhost:5173"] for just your dev UI
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

summary_agent = SituationalSummaryAgent()
escalation_agent = EmergencyEscalationAgent()
notification_agent = CrowdNotificationAgent()
dispatcher_agent = ResponseDispatcherAgent()
chat_agent = ChatAgent()
incident_agent = IncidentAgent()
incident_agent.start()

# Mount API routers
app.include_router(incidents_router, prefix="/api")
app.include_router(zones_router, prefix="/api")
app.include_router(responders_router, prefix="/api")
app.include_router(emergency_contacts_router, prefix="/api")
app.include_router(upload_router, prefix="/api")
app.include_router(vision_router, prefix="/api")
app.include_router(alerts_router, prefix="/api")
app.include_router(venues_router, prefix="/api")
app.include_router(predict_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "GCP Crowd Agents system is running"}

@app.post("/summary")
def run_summary(event: dict = Body(...)):
    session_id = event.get("session_id", "default")
    summary = summary_agent.handle_event(event, session_id=session_id)
    context = summary_agent.get_short_term(session_id)
    return {"summary": summary, "context": context}

@app.post("/escalation")
def run_escalation(event: dict = Body(...)):
    session_id = event.get("session_id", "default")
    escalation = escalation_agent.handle_event(event, session_id=session_id)
    context = escalation_agent.get_short_term(session_id)
    return {"escalation": escalation, "context": context}

@app.post("/notification")
def run_notification(event: dict = Body(...)):
    session_id = event.get("session_id", "default")
    notification = notification_agent.handle_event(event, session_id=session_id)
    context = notification_agent.get_short_term(session_id)
    return {"notification": notification, "context": context}

@app.post("/dispatcher")
def run_dispatcher(event: dict = Body(...)):
    session_id = event.get("session_id", "default")
    dispatch = dispatcher_agent.handle_event(event, session_id=session_id)
    context = dispatcher_agent.get_short_term(session_id)
    return {"dispatch": dispatch, "context": context}

@app.post("/chat")
def chat_endpoint(payload: dict = Body(...)):
    user_query = payload.get("query")
    session_id = payload.get("session_id", "default")
    if not user_query:
        return {"error": "Missing query"}
    answer = chat_agent.handle_query(user_query, session_id=session_id)
    context = chat_agent.get_short_term(session_id)
    return {"answer": answer, "context": context} 