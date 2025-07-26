from fastapi import FastAPI, Body, HTTPException, Depends, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from typing import Optional, Callable
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
import jwt
import os
from datetime import datetime, timedelta
from google.cloud import firestore
from functools import wraps

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "supersecretkey")
JWT_ALGORITHM = "HS256"
JWT_EXP_DELTA_SECONDS = 3600

security = HTTPBearer()

class JWTMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            request = Request(scope, receive)
            path = request.url.path
            
            # Skip JWT check for login endpoint and root
            if path in ["/api/login", "/", "/docs", "/openapi.json"] or not path.startswith("/api/"):
                await self.app(scope, receive, send)
                return
            
            # Check for Authorization header
            auth_header = request.headers.get("authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                await self.send_error_response(send, 401, "Missing or invalid authorization header")
                return
            
            token = auth_header.split(" ")[1]
            if not token or token.lower() in ["null", "undefined"]:
                await self.send_error_response(send, 401, "Missing or invalid token")
                return
            try:
                # Decode and validate JWT
                payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
                userid = payload.get("userid")
                accesscode = payload.get("accesscode")
                
                if userid is None:
                    await self.send_error_response(send, 401, "Invalid token payload")
                    return
                
                # Add user info to request state for use in route handlers
                scope["user"] = {"userid": userid, "accesscode": accesscode}
                
            except jwt.ExpiredSignatureError:
                await self.send_error_response(send, 401, "Token has expired")
                return
            except jwt.JWTError:
                await self.send_error_response(send, 401, "Invalid token")
                return
        
        await self.app(scope, receive, send)

    async def send_error_response(self, send, status_code: int, message: str):
        import json
        await send({
            "type": "http.response.start",
            "status": status_code,
            "headers": [
                [b"content-type", b"application/json"],
            ],
        })
        await send({
            "type": "http.response.body",
            "body": json.dumps({"detail": message}).encode(),
        })

def inject_user(func: Callable):
    """Decorator to automatically inject user info from JWT payload"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        # Get request from kwargs or first argument
        request = kwargs.get('request')
        if not request and args:
            request = args[0] if isinstance(args[0], Request) else None
        
        if request:
            user = request.scope.get("user")
            if user:
                # Inject user info into kwargs
                kwargs['userid'] = user.get("userid")
                kwargs['accesscode'] = user.get("accesscode")
                kwargs['current_user'] = user
        
        return await func(*args, **kwargs)
    return wrapper

def require_access_code(min_access_code: int = 1):
    """Decorator to require minimum access code"""
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            request = kwargs.get('request')
            if not request and args:
                request = args[0] if isinstance(args[0], Request) else None
            
            if request:
                user = request.scope.get("user")
                if user and user.get("accesscode", 0) < min_access_code:
                    raise HTTPException(
                        status_code=403,
                        detail=f"Access denied. Required access code: {min_access_code}, User access code: {user.get('accesscode')}"
                    )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator

# Helper function to get current user from request state
def get_current_user_from_request(request: Request):
    user = request.scope.get("user")
    if not user:
        raise HTTPException(status_code=401, detail="User not authenticated")
    return user

app = FastAPI()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add JWT middleware
app.add_middleware(JWTMiddleware)

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


@app.post("/api/login")
def login(payload: dict = Body(...)):
    userid = payload.get("userid")
    password = payload.get("password")
    if not userid or not password:
        raise HTTPException(status_code=400, detail="Missing userid or password")
    db = firestore.Client()
    user_details_ref = db.collection("userDetails")
    docs = user_details_ref.where("userId", "==", userid).stream()
    user = None
    for doc in docs:
        user = doc.to_dict()
        user["id"] = doc.id
        break
    if not user or user.get("password") != password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    accesscode = user.get("accessCode", 1)
    payload = {
        "userid": userid,
        "accesscode": accesscode,
        "exp": datetime.utcnow() + timedelta(seconds=JWT_EXP_DELTA_SECONDS)
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return {"token": token, "accesscode": accesscode, "userid": userid}

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

@app.get("/api/protected")
@inject_user
def protected_route(request: Request, userid: str = None, accesscode: int = None, current_user: dict = None):
    return {
        "message": "This is a protected route",
        "userid": userid,
        "accesscode": accesscode,
        "current_user": current_user
    }

@app.get("/api/admin-only")
@inject_user
@require_access_code(127)
def admin_only_route(request: Request, userid: str = None, accesscode: int = None):
    return {
        "message": "This is admin only",
        "userid": userid,
        "accesscode": accesscode
    }

@app.get("/api/read-only")
@inject_user
@require_access_code(1)
def read_only_route(request: Request, userid: str = None, accesscode: int = None):
    return {
        "message": "This is read-only access",
        "userid": userid,
        "accesscode": accesscode
    }

@app.get("/api/user-profile")
@inject_user
def user_profile(request: Request, userid: str = None, accesscode: int = None):
    return {
        "message": "User profile",
        "userid": userid,
        "accesscode": accesscode
    }

# Example of using user info in a POST endpoint
@app.post("/api/create-incident")
@inject_user
@require_access_code(1)
def create_incident(request: Request, payload: dict = Body(...), userid: str = None, accesscode: int = None):
    return {
        "message": "Incident created",
        "created_by": userid,
        "user_access_level": accesscode,
        "incident_data": payload
    }

# Example of admin-only data modification
@app.put("/api/update-system-settings")
@inject_user
@require_access_code(127)
def update_system_settings(request: Request, payload: dict = Body(...), userid: str = None, accesscode: int = None):
    return {
        "message": "System settings updated",
        "updated_by": userid,
        "settings": payload
    }

# @app.on_event("shutdown")
# async def shutdown():
#     logger.info("[Main] Shutting down...")
#     await chat_agent.close()