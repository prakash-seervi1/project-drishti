from datetime import datetime
from tools.gcp_llm import query_gemini
from utils.firestore_utils import add_document

class AlertAgent:
    def __init__(self):
        pass

    def send_alert(self, alertType, target, language, message):
        alert_data = {
            "alertType": alertType,
            "target": target,
            "language": language,
            "message": message,
            "timestamp": datetime.utcnow(),
        }
        add_document("alerts", alert_data)
        return {"success": True, "message": "Alert sent and logged."}

    def generate_alert_message(self, alertType, target, language):
        prompt = (
            f"Generate a concise, actionable alert message for a {alertType} alert. "
            f"Target: {target}. Language: {language}. "
            f"The message should be suitable for broadcast to staff or attendees."
        )
        message = query_gemini(prompt)
        return {"success": True, "message": message} 