from fastapi import FastAPI
from incidents import router as incidents_router
from responders import router as responders_router
from zones import router as zones_router
from emergency_contacts import router as emergency_contacts_router
from agent import router as agent_router

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "ADK Backend is running"}

app.include_router(incidents_router)
app.include_router(responders_router)
app.include_router(zones_router)
app.include_router(emergency_contacts_router)
app.include_router(agent_router) 