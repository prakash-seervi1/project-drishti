# drishti-mvp-adk-service

This is a Python microservice for Google Agent Development Kit (ADK) orchestration, designed to work alongside your Node.js backend.

## Features
- Exposes a REST API for agent orchestration using FastAPI
- Placeholder for Google ADK agent logic (tool use, multi-step reasoning, etc.)
- Intended to be called from your Node.js backend

## Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the service:**
   ```bash
   uvicorn main:app --reload --port 8001
   ```
   (You can change the port if needed)

3. **API Endpoint:**
   - `POST /agent` with JSON body: `{ "input": "your query here" }`
   - Returns: `{ "response": "..." }`

## Next Steps
- Integrate Google ADK agent logic in `main.py` (see `run_agent` function)
- Update your Node.js backend to call this service for orchestration tasks

## References
- [Google Vertex AI Agents Overview](https://cloud.google.com/vertex-ai/docs/agents/overview)
- [FastAPI Documentation](https://fastapi.tiangolo.com/) 