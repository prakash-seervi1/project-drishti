import os
from google.cloud import firestore
from google.oauth2 import service_account
from dotenv import load_dotenv

load_dotenv()

PROJECT_ID = os.getenv("FIRESTORE_PROJECT_ID")
CREDENTIALS_PATH = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

def get_firestore_client():
    if CREDENTIALS_PATH:
        credentials = service_account.Credentials.from_service_account_file(CREDENTIALS_PATH)
        return firestore.Client(project=PROJECT_ID, credentials=credentials)
    else:
        # Use default credentials (for local dev with gcloud auth)
        return firestore.Client(project=PROJECT_ID) 