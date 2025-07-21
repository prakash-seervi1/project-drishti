# ADK Agent Service

This is a Python microservice that acts as an intelligent agent for Project Drishti. It uses Google Gemini/Vertex AI (and optionally OpenAI) to interpret user questions, calls your existing Node.js APIs as tools, and returns smart, grounded answers to your UI.

## Features
- Conversational AI assistant for analytics, incident queries, recommendations, etc.
- Calls your existing REST APIs (from drishti-mvp-functions) to fetch real data
- Powered by Gemini/Vertex AI (Google Cloud)
- Modular, extensible, and easy to integrate with your React UI

## Architecture

```
React UI <--> ADK Agent Service (Python, FastAPI) <--> Node.js API Service (drishti-mvp-functions) <--> Firestore/DB
                                 | 
                                 +--> Gemini/Vertex AI (LLM)
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
3. Copy `.env.example` to `.env` and fill in your API base URL and Google Cloud credentials.

## Run the server
```bash
uvicorn main:app --reload
```

## Next Steps
- Implement agent logic to call your APIs and use LLMs for reasoning
- Add endpoints for chat, recommendations, analytics, etc.
- Integrate with your React UI 