from firestore_client import get_firestore_client

def get_all_documents(collection_name):
    db = get_firestore_client()
    ref = db.collection(collection_name)
    docs = ref.stream()
    results = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        results.append(data)
    return results 