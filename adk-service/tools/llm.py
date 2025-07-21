import os
from google.cloud import aiplatform
from dotenv import load_dotenv

load_dotenv()

PROJECT_ID = os.getenv("FIRESTORE_PROJECT_ID")
LOCATION = os.getenv("VERTEX_LOCATION", "us-central1")
MODEL = os.getenv("VERTEX_MODEL", "gemini-1.0-pro")

# Initialize Vertex AI client
client = None

def get_client():
    global client
    if client is None:
        aiplatform.init(project=PROJECT_ID, location=LOCATION)
        client = aiplatform.gapic.PredictionServiceClient()
    return client

def query_gemini(prompt: str) -> str:
    from google.cloud.aiplatform.gapic.schema import predict
    endpoint = f"projects/{PROJECT_ID}/locations/{LOCATION}/publishers/google/models/{MODEL}"
    client = get_client()
    instance = {"content": prompt}
    instances = [instance]
    parameters = {"temperature": 0.2, "maxOutputTokens": 512}
    response = client.predict(
        endpoint=endpoint,
        instances=instances,
        parameters=parameters
    )
    # Gemini returns a list of predictions
    if hasattr(response, "predictions") and response.predictions:
        return response.predictions[0].get("content", "")
    return "[No response from Gemini]" 