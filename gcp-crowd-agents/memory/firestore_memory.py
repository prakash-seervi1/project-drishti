from google.cloud import firestore
from config import GCP_PROJECT, FIRESTORE_COLLECTION_PREFIX

class FirestoreMemory:
    def __init__(self, agent_name):
        self.client = firestore.Client(project=GCP_PROJECT)
        self.collection = self.client.collection(f"{FIRESTORE_COLLECTION_PREFIX}{agent_name}")

    def save_event(self, event):
        self.collection.add(event)

    def get_recent_events(self, limit=10):
        docs = self.collection.order_by("timestamp", direction=firestore.Query.DESCENDING).limit(limit).stream()
        return [doc.to_dict() for doc in docs]

    def get_all_events(self):
        docs = self.collection.stream()
        return [doc.to_dict() for doc in docs] 