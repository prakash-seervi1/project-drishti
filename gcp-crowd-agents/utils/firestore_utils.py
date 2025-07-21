from google.cloud import firestore
from config import GCP_PROJECT

def get_firestore_client():
    return firestore.Client(project=GCP_PROJECT) if GCP_PROJECT else firestore.Client()

def get_collection(name):
    db = get_firestore_client()
    return db.collection(name)

def get_document(collection, doc_id):
    return get_collection(collection).document(doc_id).get()

def add_document(collection, data):
    return get_collection(collection).add(data)

def update_document(collection, doc_id, data):
    return get_collection(collection).document(doc_id).update(data)

def query_collection(collection, **filters):
    col = get_collection(collection)
    for field, value in filters.items():
        col = col.where(field, "==", value)
    return [doc.to_dict() | {"id": doc.id} for doc in col.stream()]

def fetch_all(collection):
    return [doc.to_dict() | {"id": doc.id} for doc in get_collection(collection).stream()] 