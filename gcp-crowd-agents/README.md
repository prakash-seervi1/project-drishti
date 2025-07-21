# GCP Crowd Agents

This project implements a modular, multi-agent system for crowd safety and event management using only Google Cloud Platform (GCP) services and the Agent Development Kit (ADK).

## Features
- Multiple specialized agents (escalation, notification, summary, dispatcher)
- GCP Firestore for long-term memory
- GCP Pub/Sub for agent-to-agent messaging
- Vertex AI/Gemini for LLM and vision tasks
- ADK-style agent orchestration (memory, tools, communication)
- Extensible, event-driven, and scalable

## Architecture

```
[Agent: Escalation] <--> [Agent: Notification] <--> [Agent: Summary] <--> [Agent: Dispatcher]
        |                     |                      |                      |
     Firestore            Firestore              Firestore             Firestore
        |                     |                      |                      |
     Pub/Sub <-------------------------------------------------------> Pub/Sub
        |                     |                      |                      |
   Vertex AI/Gemini      Vertex AI/Gemini      Vertex AI/Gemini      Vertex AI/Gemini
```

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
3. Set up your `.env` with GCP credentials, project ID, Pub/Sub topics, etc.

## Run the system
- Each agent can be run as a separate process or as part of a FastAPI app.
- Example:
  ```bash
  uvicorn main:app --reload
  ```

## Next Steps
- Implement each agent as a Python class/module
- Add Firestore and Pub/Sub utilities
- Integrate Vertex AI/Gemini for LLM and vision
- Add ADK orchestration if available 