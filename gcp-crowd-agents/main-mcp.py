from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from utils.mcp_server import router as mcp_router
import logging


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


app.include_router(mcp_router,prefix="/mcp")  # Add MCP router


@app.get("/")
def read_root():
    return {"message": "MCP is alive!"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("main-mcp:app", host="0.0.0.0", port=port, reload=False)
