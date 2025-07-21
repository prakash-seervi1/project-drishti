# ADK Backend Service

This is the FastAPI backend for Project Drishti, powered by Google Agent Development Kit (ADK).

## Features
- REST API for incidents, responders, zones, emergency contacts, crowd analytics, and AI assistant
- Firestore integration
- Google ADK agent endpoints (Gemini/Vertex AI powered)

## API Endpoints
- `GET /incidents` — List all incidents
- `GET /responders` — List all responders
- `GET /zones` — List all zones
- `GET /emergency-contacts` — List all emergency contacts
- `POST /agent/chat` — Chat with the AI assistant (uses Gemini/Vertex AI and live Firestore data)

## Gemini/Vertex AI Integration
- Requires a Google Cloud project with Vertex AI and Gemini access
- Set `FIRESTORE_PROJECT_ID`, `GOOGLE_APPLICATION_CREDENTIALS`, `VERTEX_LOCATION`, and `VERTEX_MODEL` in your `.env`
- Install `google-cloud-aiplatform` and authenticate with a service account that has Vertex AI and Firestore permissions

## Setup
1. Create a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Copy `.env.example` to `.env` and fill in your Firestore and Vertex AI credentials.

## Run the server
```bash
uvicorn main:app --reload
```

## Next Steps
- Implement more advanced agent skills and RAG
- Add authentication and security as needed 