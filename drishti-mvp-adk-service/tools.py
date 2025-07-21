# tools.py
import os
import requests
from typing import Any, Dict, List, Optional
from google.cloud import firestore

# Load environment variables (important for local testing of tools directly)
from dotenv import load_dotenv
load_dotenv()

# Configuration for tools
NODE_BACKEND_URL = os.getenv("NODE_BACKEND_URL", "http://localhost:5001")

# Initialize Firestore (assuming it's needed by some tools)
db = firestore.Client()

# --- TOOL IMPLEMENTATIONS ---

def create_incident_tool(
    incident_type: str,
    status: str,
    priority: str,
    zone_name: str,
    description: Optional[str] = None
) -> Dict[str, Any]:
    """
    Calls the Node.js backend to create an incident.
    This function acts as a tool that the AI agent can invoke.
    Args:
        incident_type (str): The type of incident (e.g., "fire", "medical", "security", "panic").
        status (str): The current status of the incident (e.g., "active", "investigating", "resolved").
        priority (str): The priority level of the incident (e.g., "critical", "high", "medium", "low").
        zone_name (str): The name of the zone where the incident occurred (e.g., "Zone A", "Zone B", "Zone C").
        description (Optional[str]): A brief description of the incident.
    Returns:
        Dict[str, Any]: The response from the Node.js backend or an error.
    """
    print(f"DEBUG (tools.py): Attempting to create incident: type={incident_type}, status={status}, priority={priority}, zone={zone_name}")
    
    incident_data = {
        "type": incident_type,
        "status": status,
        "priority": priority,
        "zoneName": zone_name, # Pass name, Node.js backend should handle lookup
        "description": description
    }
    url = f"{NODE_BACKEND_URL}/incidents" # Ensure this endpoint exists and handles zoneName
    try:
        response = requests.post(url, json=incident_data)
        response.raise_for_status() # Raise an HTTPError for bad responses (4xx or 5xx)
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"ERROR (tools.py): Failed to call Node.js backend for incident creation: {e}")
        return {"error": f"Failed to create incident: {e}. Please ensure Node.js backend is running and '/incidents' endpoint is correct."}
    except Exception as e:
        print(f"ERROR (tools.py): An unexpected error occurred in create_incident_tool: {e}")
        return {"error": f"An unexpected error occurred: {e}"}

def get_incident_data(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    incident_type: Optional[str] = None,
    zone_name: Optional[str] = None,
    limit: int = 5
) -> List[Dict[str, Any]]:
    """
    Retrieves incident data from Firestore based on provided filters.
    This function acts as a tool that the AI agent can invoke.
    Args:
        status (Optional[str]): Filter by incident status (e.g., "active", "resolved", "investigating").
        priority (Optional[str]): Filter by incident priority (e.g., "critical", "high", "medium", "low").
        incident_type (Optional[str]): Filter by incident type (e.g., "fire", "medical", "security", "panic").
        zone_name (Optional[str]): Filter by zone name.
        limit (int): Maximum number of incidents to return.
    Returns:
        List[Dict[str, Any]]: A list of incident dictionaries.
    """
    print(f"DEBUG (tools.py): Fetching incidents with filters: status={status}, priority={priority}, type={incident_type}, zone={zone_name}, limit={limit}")
    incidents_query = db.collection("incidents")

    if status:
        incidents_query = incidents_query.where("status", "==", status)
    if priority:
        incidents_query = incidents_query.where("priority", "==", priority)
    if incident_type:
        incidents_query = incidents_query.where("type", "==", incident_type)
    if zone_name:
        # Assuming 'zoneName' field exists directly on incident documents for simplicity.
        # If 'zoneId' is used, you'd need to fetch the zone document first to get its ID.
        incidents_query = incidents_query.where("zoneName", "==", zone_name)

    try:
        # Order by timestamp for most recent, then limit
        incidents = [ {"id": doc.id, **doc.to_dict()} for doc in incidents_query.order_by("timestamp", direction=firestore.Query.DESCENDING).limit(limit).stream() ]
        return incidents
    except Exception as e:
        print(f"ERROR (tools.py): Failed to fetch incident data from Firestore: {e}")
        return [{"error": f"Failed to retrieve incident data: {e}"}]

def get_zone_data(
    zone_name: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 5
) -> List[Dict[str, Any]]:
    """
    Retrieves zone data from Firestore based on provided filters.
    Args:
        zone_name (Optional[str]): Filter by specific zone name.
        status (Optional[str]): Filter by zone status (e.g., "normal", "active", "critical").
        limit (int): Maximum number of zones to return.
    Returns:
        List[Dict[str, Any]]: A list of zone dictionaries.
    """
    print(f"DEBUG (tools.py): Fetching zones with filters: zone_name={zone_name}, status={status}, limit={limit}")
    zones_query = db.collection("zones")

    if zone_name:
        zones_query = zones_query.where("name", "==", zone_name)
    if status:
        zones_query = zones_query.where("status", "==", status)

    try:
        zones = [ {"id": doc.id, **doc.to_dict()} for doc in zones_query.limit(limit).stream() ]
        return zones
    except Exception as e:
        print(f"ERROR (tools.py): Failed to fetch zone data from Firestore: {e}")
        return [{"error": f"Failed to retrieve zone data: {e}"}]


def get_responder_data(
    status: Optional[str] = None,
    responder_type: Optional[str] = None,
    assigned_incident_id: Optional[str] = None,
    limit: int = 5
) -> List[Dict[str, Any]]:
    """
    Retrieves responder data from Firestore based on provided filters.
    Args:
        status (Optional[str]): Filter by responder status (e.g., "available", "assigned", "en_route", "on_scene").
        responder_type (Optional[str]): Filter by responder type (e.g., "firefighter", "paramedic", "security_guard").
        assigned_incident_id (Optional[str]): Filter by incident ID responders are assigned to.
        limit (int): Maximum number of responders to return.
    Returns:
        List[Dict[str, Any]]: A list of responder dictionaries.
    """
    print(f"DEBUG (tools.py): Fetching responders with filters: status={status}, type={responder_type}, assigned_incident_id={assigned_incident_id}, limit={limit}")
    responders_query = db.collection("responders")

    if status:
        responders_query = responders_query.where("status", "==", status)
    if responder_type:
        responders_query = responders_query.where("type", "==", responder_type)
    if assigned_incident_id:
        # Assuming 'assignedIncidentId' or 'assignmentId' field exists
        responders_query = responders_query.where("assignedIncidentId", "==", assigned_incident_id)

    try:
        responders = [ {"id": doc.id, **doc.to_dict()} for doc in responders_query.limit(limit).stream() ]
        return responders
    except Exception as e:
        print(f"ERROR (tools.py): Failed to fetch responder data from Firestore: {e}")
        return [{"error": f"Failed to retrieve responder data: {e}"}]

def get_emergency_contacts_data(
    contact_type: Optional[str] = None,
    limit: int = 5
) -> List[Dict[str, Any]]:
    """
    Retrieves emergency contact data from Firestore.
    Args:
        contact_type (Optional[str]): Filter by type of contact (e.g., "police", "fire_department", "hospital").
        limit (int): Maximum number of contacts to return.
    Returns:
        List[Dict[str, Any]]: A list of emergency contact dictionaries.
    """
    print(f"DEBUG (tools.py): Fetching emergency contacts with filters: type={contact_type}, limit={limit}")
    contacts_query = db.collection("emergency_contacts")

    if contact_type:
        contacts_query = contacts_query.where("type", "==", contact_type)

    try:
        contacts = [ {"id": doc.id, **doc.to_dict()} for doc in contacts_query.limit(limit).stream() ]
        return contacts
    except Exception as e:
        print(f"ERROR (tools.py): Failed to fetch emergency contact data from Firestore: {e}")
        return [{"error": f"Failed to retrieve emergency contact data: {e}"}]

def get_analytics_summary() -> Dict[str, Any]:
    """
    Generates a summary of incidents, zones, and responders for analytical purposes.
    This tool fetches all relevant data and computes statistics.
    Returns:
        Dict[str, Any]: A dictionary containing various analytics.
    """
    print("DEBUG (tools.py): Generating analytics summary.")
    try:
        incidents = [ {"id": doc.id, **doc.to_dict()} for doc in db.collection("incidents").stream() ]
        zones = [ {"id": doc.id, **doc.to_dict()} for doc in db.collection("zones").stream() ]
        responders = [ {"id": doc.id, **doc.to_dict()} for doc in db.collection("responders").stream() ]

        analytics_summary = {
            "incidents": {
                "total": len(incidents),
                "active": len([i for i in incidents if i.get("status") in ["active", "ongoing", "investigating"]]),
                "critical": len([i for i in incidents if i.get("priority") == "critical"]),
                "byType": { t: sum(1 for i in incidents if i.get("type") == t) for t in set(i.get("type") for i in incidents) if i.get("type")},
                "byZone": { z.get('name', z.get('id')): sum(1 for i in incidents if i.get("zoneId") == z.id) for z in zones if z.get('id')}, # Assuming zoneId on incident matches zone.id
                "byPriority": { p: sum(1 for i in incidents if i.get("priority") == p) for p in set(i.get("priority") for i in incidents) if i.get("priority")}
            },
            "zones": {
                "total": len(zones),
                "critical_status": len([z for z in zones if z.get("status") == "critical"]),
                "active_status": len([z for z in zones if z.get("status") == "active"]),
                "normal_status": len([z for z in zones if z.get("status") == "normal"]),
                "totalOccupancy": sum(z.get("capacity", {}).get("currentOccupancy", 0) for z in zones),
                "totalCapacity": sum(z.get("capacity", {}).get("maxOccupancy", 0) for z in zones)
            },
            "responders": {
                "total": len(responders),
                "available": len([r for r in responders if r.get("status") == "available"]),
                "assigned": len([r for r in responders if r.get("assignedIncidentId")]),
                "enRoute": len([r for r in responders if r.get("status") == "en_route"]),
                "onScene": len([r for r in responders if r.get("status") == "on_scene"]),
                "byType": { t: sum(1 for r in responders if r.get("type") == t) for t in set(r.get("type") for r in responders) if r.get("type")}
            }
        }
        return analytics_summary
    except Exception as e:
        print(f"ERROR (tools.py): Failed to generate analytics summary: {e}")
        return {"error": f"Failed to retrieve analytics summary: {e}"}

