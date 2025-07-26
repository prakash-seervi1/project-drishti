from google.cloud import firestore
from typing import Dict, List, Any, Optional
from datetime import datetime
from tools.tool_logging import log_tool_call

db = firestore.Client()

@log_tool_call("fetch_incidents")
def fetch_incidents() -> List[Dict]:
    """Fetches all incidents from Firestore."""
    return [dict(id=doc.id, **doc.to_dict()) for doc in db.collection('incidents').stream()]

@log_tool_call("get_active_incidents")
def get_active_incidents() -> Dict[str, Any]:
    """Return all incidents whose status is not 'close'."""
    all_incidents = fetch_incidents()
    active = [i for i in all_incidents if i.get('status') != 'close']
    return {"status": "success", "incidents": active}

@log_tool_call("fetch_zones")
def fetch_zones() -> List[Dict]:
    """Fetches all zones from Firestore."""
    return [{**doc.to_dict(), "id": doc.id} for doc in db.collection('zones').stream()]

@log_tool_call("fetch_responders")
def fetch_responders() -> List[Dict]:
    """Fetches all responders from Firestore, including their latest status from responder_status_updates if available. If not, use responder doc status or default to 'available'."""
    responders = [dict(id=doc.id, **doc.to_dict()) for doc in db.collection('responders').stream()]
    for responder in responders:
        responder_id = responder['id']
        events = list(db.collection('responder_status_updates')
            .where('responderId', '==', responder_id)
            .stream())
        latest_event = events[0].to_dict() if events else None
        if latest_event and latest_event.get('status'):
            responder['status'] = latest_event['status']
        else:
            responder['status'] = responder.get('status', 'available')
        responder['last_status_event'] = latest_event or {}
    return responders

@log_tool_call("get_available_responders")
def get_available_responders() -> Dict[str, Any]:
    """Return only responders whose latest status event is 'available', or if no event, whose responder doc status is 'available' or missing (default to available)."""
    responders = [dict(id=doc.id, **doc.to_dict()) for doc in db.collection('responders').stream()]
    available = []
    for responder in responders:
        responder_id = responder.get('id')
        all_events = list(db.collection('responder_status_updates')
            .where('responderId', '==', responder_id)
            .stream())
        latest_event = all_events[0].to_dict() if all_events else None
        if latest_event and latest_event.get('status') == 'available':
            available.append(responder)
        elif not latest_event:
            # No status event: use responder doc status or default to available
            if responder.get('status', 'available') == 'available':
                responder['status'] = 'available'
                available.append(responder)
    return {"status": "success", "responders": available}

@log_tool_call("fetch_alerts")
def fetch_alerts() -> List[Dict]:
    """Fetches all alerts from Firestore."""
    return [dict(id=doc.id, **doc.to_dict()) for doc in db.collection('alerts').stream()]

@log_tool_call("analyze_responder_assignments")
def analyze_responder_assignments() -> Dict[str, Any]:
    """Analyzes all responders in the system."""
    responders_ref = db.collection('responders')
    available_query = responders_ref.where('status', '==', 'available')
    available_docs = available_query.stream()
    available = [doc.id for doc in available_docs]
    responders = responders_ref.stream()
    assigned = {}
    for doc in responders:
        data = doc.to_dict()
        if data.get('assignedIncident'):
            assigned[data.get('assignedIncident')] = doc.id
    return {"available": available, "assigned": assigned}

@log_tool_call("assign_responder_to_incident")
def assign_responder_to_incident(incident_id: str, responder_id: Optional[str] = None) -> Dict[str, str]:
    """Assigns a responder to the specified incident by writing an event to responder_status_updates.
    If responder_id is not provided, picks the first available responder."""
    if responder_id is None:
        available = get_available_responders().get('responders', [])
        if not available:
            return {"status": "error", "message": "No available responder found"}
        responder_id = available[0]['id']
    # Get incident info for zoneId
    incident_ref = db.collection('incidents').document(incident_id)
    incident_doc = incident_ref.get()
    if not incident_doc.exists:
        return {"status": "error", "message": "Incident not found"}
    incident = incident_doc.to_dict()
    zone_id = incident.get("zoneId")
    status_update = {
        "responderId": responder_id,
        "incidentId": incident_id,
        "zoneId": zone_id,
        "status": "assigned",
        "action": "assigned_to_incident",
        "timestamp": firestore.SERVER_TIMESTAMP
    }
    # Write to event log (history)
    db.collection('responder_status_updates_history').add(status_update)
    # Write to latest status (deduplication)
    db.collection('responder_status_updates').document(responder_id).set(status_update)
    return {"status": "assigned", "responder_id": responder_id, "incident_id": incident_id, "zone_id": zone_id}

@log_tool_call("assign_any_responder_to_incident")
def assign_any_responder_to_incident(incident_id: str) -> Dict[str, Any]:
    available = get_available_responders().get('responders', [])
    if not available:
        return {"status": "error", "error_message": "No responders available"}
    responder_id = available[0]['id']
    return assign_responder_to_incident(incident_id, responder_id)

@log_tool_call("assign_responder_to_zone")
def assign_responder_to_zone(responder_id: str, zone_id: str) -> Dict[str, str]:
    """Assigns a responder to a zone by writing an event to responder_status_updates."""
    responders_ref = db.collection('responders')
    zones_ref = db.collection('zones')
    responder_doc = responders_ref.document(responder_id)
    zone_doc = zones_ref.document(zone_id)
    responder = responder_doc.get()
    zone = zone_doc.get()
    if not responder.exists or not zone.exists:
        return {"status": "error", "message": "Responder or zone not found"}
    responder_data = responder.to_dict()
    # if responder_data.get("status") != "available":
    #     return {"status": "error", "message": f"Responder {responder_id} is not available (current status: {responder_data.get('status')})"}
    status_update = {
        "responderId": responder_id,
        "zoneId": zone_id,
        "status": "assigned",
        "action": "assigned_to_zone",
        "timestamp": firestore.SERVER_TIMESTAMP
    }
    db.collection('responder_status_updates_history').add(status_update)
    db.collection('responder_status_updates').document(responder_id).set(status_update)
    return {"status": "assigned", "responder_id": responder_id, "zone_id": zone_id}

@log_tool_call("assign_any_responder_to_zone")
def assign_any_responder_to_zone(zone_id: str) -> Dict[str, Any]:
    """Assign any available responder to the given zone by writing an event to responder_status_updates."""
    available = get_available_responders().get('responders', [])
    if not available:
        return {"status": "error", "error_message": "No responders available"}
    responder_id = available[0]["id"]
    return assign_responder_to_zone(responder_id, zone_id)

@log_tool_call("notify_unavailable")
def notify_unavailable(zone_id: str) -> Dict[str, str]:
    """Logs an alert in Firestore if no responder is available for a zone (event-driven)."""
    # This function does not have a responder_id, so only .add() is used
    db.collection('responder_status_updates').add({
        "zoneId": zone_id,
        "status": "unavailable",
        "action": "no_responder_available",
        "timestamp": firestore.SERVER_TIMESTAMP
    })
    return {"status": "notified", "zone_id": zone_id, "method": "event_logged"}

@log_tool_call("suggest_zones_needing_responders")
def suggest_zones_needing_responders() -> Dict[str, Any]:
    """Suggest zones that need more responders based on incidents and current assignments. Placeholder logic."""
    incidents = fetch_incidents()
    zones = fetch_zones()
    needs = []
    for inc in incidents:
        if inc.get('status') == 'active':
            needs.append(inc.get('zoneId'))
    return {"status": "success", "zones_needing_responders": list(set(needs))}

@log_tool_call("get_incident_by_id")
def get_incident_by_id(incident_id: str) -> dict:
    doc = db.collection('incidents').document(incident_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Incident not found")
    return dict(id=doc.id, **doc.to_dict())

@log_tool_call("get_incidents_by_status")
def get_incidents_by_status(status: str) -> dict:
    docs = db.collection('incidents').where('status', '==', status).stream()
    incidents = [dict(id=doc.id, **doc.to_dict()) for doc in docs]
    return {"incidents": incidents}

@log_tool_call("get_incidents_by_zone")
def get_incidents_by_zone(zone_id: str) -> dict:
    docs = db.collection('incidents').where('zoneId', '==', zone_id).stream()
    incidents = [dict(id=doc.id, **doc.to_dict()) for doc in docs]
    return {"incidents": incidents}

@log_tool_call("get_responders_assigned_to_incident")
def get_responders_assigned_to_incident(incident_id: str) -> List[Dict]:
    """Fetch all responders assigned to a given incident using responder_status_updates."""
    # Find all status events for this incident with status 'assigned'
    status_events = list(db.collection('responder_status_updates')
        .where('incidentId', '==', incident_id)
        .where('status', '==', 'assigned')
        .stream())
    responder_ids = [e.to_dict().get('responderId') for e in status_events if e.to_dict().get('responderId')]
    if not responder_ids:
        return []
    # Fetch responder details
    responders = [dict(id=doc.id, **doc.to_dict()) for doc in db.collection('responders').where('id', 'in', responder_ids).stream()]
    return responders 

# @log_tool_call("get_all_incident_reports")
def get_all_incident_reports() -> dict:
    docs = db.collection('incident_reports').stream()
    incidents = [dict(id=doc.id, **doc.to_dict()) for doc in docs]
    return {"incidents": incidents}

# @log_tool_call("get_incident_reports_by_venue")
def get_incident_reports_by_venue(venue_id: str) -> dict:
    docs = db.collection('incident_reports').where('venue_id', '==', venue_id).stream()
    incidents = [dict(id=doc.id, **doc.to_dict()) for doc in docs]
    return {"incidents": incidents}

# @log_tool_call("get_incident_statistics")
def get_incident_statistics() -> dict:
    docs = db.collection('incident_reports').stream()
    incidents = [dict(id=doc.id, **doc.to_dict()) for doc in docs]
    if not incidents:
        return {
            "total_incidents": 0,
            "resolved_incidents": 0,
            "resolution_rate": 0.0,
            "avg_severity": 0.0,
            "avg_feedback": 0.0,
            "incident_types": {},
            "severity_distribution": {}
        }
    resolved_incidents = [i for i in incidents if i.get('resolved', False)]
    resolution_rate = len(resolved_incidents) / len(incidents)
    avg_severity = sum([i.get('severity', 0) for i in resolved_incidents]) / max(len(resolved_incidents), 1)
    avg_feedback = sum([i.get('feedback_rating', 4) for i in incidents]) / max(len(incidents), 1)
    incident_types = {}
    for incident in incidents:
        inc_type = incident.get('type', 'unknown')
        incident_types[inc_type] = incident_types.get(inc_type, 0) + 1
    severity_distribution = {}
    for incident in incidents:
        severity = incident.get('severity', 0)
        severity_distribution[severity] = severity_distribution.get(severity, 0) + 1
    return {
        "total_incidents": len(incidents),
        "resolved_incidents": len(resolved_incidents),
        "resolution_rate": resolution_rate,
        "avg_severity": avg_severity,
        "avg_feedback": avg_feedback,
        "incident_types": incident_types,
        "severity_distribution": severity_distribution
    } 
@log_tool_call("get_incidents_for_responder")
def get_incidents_for_responder(responder_id: str) -> list:
    """Fetch all incidents for a given responder based on responder_status_updates."""
    # Find all status events for this responder with an incidentId
    status_events = list(db.collection('responder_status_updates')
        .where('responderId', '==', responder_id)
        .stream())
    incident_ids = [e.to_dict().get('incidentId') for e in status_events if e.to_dict().get('incidentId')]
    if not incident_ids:
        return []
    # Remove duplicates
    incident_ids = list(set(incident_ids))
    # Fetch incident details
    incidents = [dict(id=doc.id, **doc.to_dict()) for doc in db.collection('incidents').where('id', 'in', incident_ids).stream()]
    return incidents 

@log_tool_call("get_incidents_details_for_responder")
def get_incidents_details_for_responder(responder_id: str) -> list:
    """Fetch full incident details for a given responder from incidents collection."""
    # Find all status events for this responder with an incidentId
    status_events = list(db.collection('responder_status_updates')
        .where('responderId', '==', responder_id)
        .stream())
    incident_ids = [e.to_dict().get('incidentId') for e in status_events if e.to_dict().get('incidentId')]
    if not incident_ids:
        return []
    # Remove duplicates
    incident_ids = list(set(incident_ids))
    # Fetch full incident details from incidents collection
    incidents = []
    for incident_id in incident_ids:
        doc = db.collection('incidents').document(incident_id).get()
        if doc.exists:
            incident_data = dict(id=doc.id, **doc.to_dict())
            incidents.append(incident_data)
    return incidents 
