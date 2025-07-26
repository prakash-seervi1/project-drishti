from functools import wraps
from google.cloud import firestore
import time

db = firestore.Client()

def log_tool_call(tool_name):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            result = func(*args, **kwargs)
            # Try to extract session_id or incident_id for context
            session_id = kwargs.get('session_id') or kwargs.get('incident_id') or 'unknown'
            db.collection('tool_call_logs').add({
                "tool": tool_name,
                "args": str(args),
                "kwargs": kwargs,
                "result": result,
                "timestamp": firestore.SERVER_TIMESTAMP,
                "session_id": session_id
            })
            print(f"[TOOL LOG] {tool_name} called with args={args}, kwargs={kwargs}, result={result}")
            return result
        return wrapper
    return decorator 