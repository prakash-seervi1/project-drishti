from utils.firestore_utils import get_collection

def fetch_incidents():
    return [doc.to_dict() for doc in get_collection('incidents').stream()]

def fetch_zones():
    return [doc.to_dict() for doc in get_collection('zones').stream()]

def fetch_responders():
    return [doc.to_dict() for doc in get_collection('responders').stream()]

def fetch_alerts():
    return [doc.to_dict() for doc in get_collection('alerts').stream()]

def build_prompt(user_query, context):
    prompt = (
        "You are an event safety AI assistant. Use ONLY the following data to answer the user's question.\n"
        f"Incidents: {context['incidents'][:2]}\n"
        f"Zones: {context['zones'][:2]}\n"
        f"Responders: {context['responders'][:2]}\n"
        f"Alerts: {context['alerts'][:2]}\n"
        f"User: {user_query}\nAssistant:"
    )
    return prompt 