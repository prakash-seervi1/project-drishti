from google.adk.tools import FunctionTool
from .db_tools import (
    fetch_incidents, get_active_incidents, fetch_zones, fetch_responders, get_available_responders,
    fetch_alerts, analyze_responder_assignments, assign_responder_to_incident, assign_any_responder_to_incident,
    assign_responder_to_zone, assign_any_responder_to_zone, notify_unavailable, suggest_zones_needing_responders,
    get_incidents_for_responder, get_incidents_details_for_responder
)
import logging
from typing import Dict, Any, List

# Configure logging
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s %(levelname)s %(name)s: %(message)s', '%Y-%m-%d %H:%M:%S')
handler.setFormatter(formatter)
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
if not logger.hasHandlers():
    logger.addHandler(handler)

class FetchIncidentsTool(FunctionTool):
    def __init__(self):
        super().__init__(func=fetch_incidents)

class GetActiveIncidentsTool(FunctionTool):
    def __init__(self):
        super().__init__(func=get_active_incidents)

class FetchZonesTool(FunctionTool):
    def __init__(self):
        super().__init__(func=fetch_zones)

class FetchRespondersTool(FunctionTool):
    def __init__(self):
        super().__init__(func=fetch_responders)

class GetAvailableRespondersTool(FunctionTool):
    def __init__(self):
        super().__init__(func=get_available_responders)

class FetchAlertsTool(FunctionTool):
    def __init__(self):
        super().__init__(func=fetch_alerts)

class AnalyzeResponderAssignmentsTool(FunctionTool):
    def __init__(self):
        super().__init__(func=analyze_responder_assignments)

class AssignResponderToIncidentTool(FunctionTool):
    def __init__(self):
        super().__init__(func=assign_responder_to_incident)

class AssignAnyResponderToIncidentTool(FunctionTool):
    def __init__(self):
        super().__init__(func=assign_any_responder_to_incident)

class AssignResponderToZoneTool(FunctionTool):
    def __init__(self):
        super().__init__(func=assign_responder_to_zone)

class AssignAnyResponderToZoneTool(FunctionTool):
    def __init__(self):
        super().__init__(func=assign_any_responder_to_zone)

class NotifyUnavailableTool(FunctionTool):
    def __init__(self):
        super().__init__(func=notify_unavailable)

class SuggestZonesNeedingRespondersTool(FunctionTool):
    def __init__(self):
        super().__init__(func=suggest_zones_needing_responders)

class GetIncidentsForResponderTool(FunctionTool):
    def __init__(self):
        super().__init__(func=get_incidents_for_responder)

class GetIncidentsDetailsForResponderTool(FunctionTool):
    def __init__(self):
        super().__init__(func=get_incidents_details_for_responder)