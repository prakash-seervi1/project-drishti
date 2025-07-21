import os
from dotenv import load_dotenv

load_dotenv()

GCP_PROJECT = os.getenv("GCP_PROJECT")
GOOGLE_APPLICATION_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
FIRESTORE_COLLECTION_PREFIX = os.getenv("FIRESTORE_COLLECTION_PREFIX", "crowd_agents_")
PUBSUB_TOPIC_PREFIX = os.getenv("PUBSUB_TOPIC_PREFIX", "")
VERTEX_LOCATION = os.getenv("VERTEX_LOCATION", "us-central1")
VERTEX_MODEL = os.getenv("VERTEX_MODEL", "gemini-2.5-pro") 