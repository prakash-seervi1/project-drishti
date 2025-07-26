from fastapi import APIRouter, Query
from tools import db_tools

router = APIRouter()

@router.get("/incidents")
def get_incidents():
    return db_tools.fetch_incidents()

@router.get("/incidents/active")
def get_active_incidents():
    return db_tools.get_active_incidents()

@router.get("/zones")
def get_zones():
    return db_tools.fetch_zones()

@router.get("/responders")
def get_responders():
    return db_tools.fetch_responders()

@router.get("/responders/available")
def get_available_responders():
    return db_tools.get_available_responders()

@router.get("/alerts")
def get_alerts():
    return db_tools.fetch_alerts()

@router.get("/responder_assignments")
def analyze_responder_assignments():
    return db_tools.analyze_responder_assignments()

@router.post("/assign_responder_to_incident")
def assign_responder_to_incident(incident_id: str = Query(...)):
    return db_tools.assign_responder_to_incident(incident_id)

@router.post("/assign_any_responder_to_incident")
def assign_any_responder_to_incident(incident_id: str = Query(...)):
    return db_tools.assign_any_responder_to_incident(incident_id)

@router.post("/assign_responder_to_zone")
def assign_responder_to_zone(responder_id: str = Query(...), zone_id: str = Query(...)):
    return db_tools.assign_responder_to_zone(responder_id, zone_id)

@router.post("/assign_any_responder_to_zone")
def assign_any_responder_to_zone(zone_id: str = Query(...)):
    return db_tools.assign_any_responder_to_zone(zone_id)

@router.post("/notify_unavailable")
def notify_unavailable(zone_id: str = Query(...)):
    return db_tools.notify_unavailable(zone_id)

@router.get("/suggest_zones_needing_responders")
def suggest_zones_needing_responders():
    return db_tools.suggest_zones_needing_responders()

@router.get("/incidents/{incident_id}")
def get_incident_by_id(incident_id: str):
    return db_tools.get_incident_by_id(incident_id)

@router.get("/incidents/status/{status}")
def get_incidents_by_status(status: str):
    return db_tools.get_incidents_by_status(status)

@router.get("/incidents/zone/{zone_id}")
def get_incidents_by_zone(zone_id: str):
    return db_tools.get_incidents_by_zone(zone_id)

@router.get("/responders/assigned_to_incident/{incident_id}")
def get_responders_assigned_to_incident(incident_id: str):
    return db_tools.get_responders_assigned_to_incident(incident_id)

@router.get("/incident_reports")
def get_all_incident_reports():
    return db_tools.get_all_incident_reports()

@router.get("/incident_reports/{venue_id}")
def get_incident_reports_by_venue(venue_id: str):
    return db_tools.get_incident_reports_by_venue(venue_id)

@router.get("/incident_statistics")
def get_incident_statistics():
    return db_tools.get_incident_statistics() 
@router.get("/incidents_for_responder/{responder_id}")
def get_incidents_for_responder(responder_id: str):
    return db_tools.get_incidents_for_responder(responder_id)

@router.get("/incidents_details_for_responder/{responder_id}")
def get_incidents_details_for_responder(responder_id: str):
    return db_tools.get_incidents_details_for_responder(responder_id) 
