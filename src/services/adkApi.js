// API Service for Python/FastAPI ADK Backend
const BASE_URL = "https://gcp-crowd-agents-961501630221.us-central1.run.app/api";

function authHeaders(extra = {}) {
  const token = localStorage.getItem('token');
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function handleAuthError(response) {
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('token');
    localStorage.removeItem('userid');
    localStorage.removeItem('accesscode');
    window.location.href = '/login';
    throw new Error('Unauthorized. Redirecting to login.');
  }
  return response;
}

export const api = {
  // Incidents
  getIncidents: async () => handleAuthError(await fetch(`${BASE_URL}/incidents`, { headers: authHeaders() })).json(),
  getActiveIncidents: async () => handleAuthError(await fetch(`${BASE_URL}/incidents/active`, { headers: authHeaders() })).json(),
  getIncidentById: async (id) => handleAuthError(await fetch(`${BASE_URL}/incidents/${id}`, { headers: authHeaders() })).json(),
  getIncidentsByStatus: async (status) => handleAuthError(await fetch(`${BASE_URL}/incidents/status/${status}`, { headers: authHeaders() })).json(),
  getIncidentsByZone: async (zoneId) => handleAuthError(await fetch(`${BASE_URL}/incidents/zone/${zoneId}`, { headers: authHeaders() })).json(),
  getIncidentsForResponder: async (responderId) => {
    const response = await fetch(`${BASE_URL}/db_tools/incidents_for_responder/${responderId}`, { headers: authHeaders() });
    handleAuthError(response);
    return await response.json();
  },
  getIncidentsDetailsForResponder: async (responderId) => {
    const response = await fetch(`${BASE_URL}/incidents_details_for_responder/${responderId}`, { headers: authHeaders() });
    handleAuthError(response);
    return await response.json();
  },

  // Zones
  getZones: async () => handleAuthError(await fetch(`${BASE_URL}/zones`, { headers: authHeaders() })).json(),
  getZoneById: async (id) => handleAuthError(await fetch(`${BASE_URL}/zones/${id}`, { headers: authHeaders() })).json(),

  // Responders
  getResponders: async () => handleAuthError(await fetch(`${BASE_URL}/responders`, { headers: authHeaders() })).json(),
  getAvailableResponders: async () => handleAuthError(await fetch(`${BASE_URL}/responders/available`, { headers: authHeaders() })).json(),

  // Dispatch Responder (uses new endpoint)
  dispatchResponder: async ({ responderId, incidentId }) => {
    const response = await fetch(`${BASE_URL}/assign_responder_to_incident`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ incident_id: incidentId, responder_id: responderId }),
    });
    handleAuthError(response);
    return await response.json();
  },

  // Alerts
  getAlerts: async () => handleAuthError(await fetch(`${BASE_URL}/alerts`, { headers: authHeaders() })).json(),

  // Suggest zones needing responders
  suggestZonesNeedingResponders: async () => handleAuthError(await fetch(`${BASE_URL}/suggest_zones_needing_responders`, { headers: authHeaders() })).json(),

  // Emergency Contacts
  getEmergencyContacts: async () => handleAuthError(await fetch(`${BASE_URL}/emergency_contacts`, { headers: authHeaders() })).json(),
  getEmergencyContactById: async (id) => handleAuthError(await fetch(`${BASE_URL}/emergency_contacts/${id}`, { headers: authHeaders() })).json(),
  getEmergencyContactsByType: async (type) => handleAuthError(await fetch(`${BASE_URL}/emergency_contacts/type/${type}`, { headers: authHeaders() })).json(),
  getEmergencyContactsByStatus: async (isActive) => handleAuthError(await fetch(`${BASE_URL}/emergency_contacts/status/${isActive}`, { headers: authHeaders() })).json(),

  // Send Alert
  sendAlert: async ({ alertType, target, language, message }) => {
    const response = await fetch(`${BASE_URL}/send_alert`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ alertType, target, language, message }),
    });
    handleAuthError(response);
    return await response.json();
  },

  // Generate Alert Message (AI)
  generateAlertMessage: async ({ alertType, target, language }) => {
    const response = await fetch(`${BASE_URL}/generate_alert_message`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ alertType, target, language }),
    });
    handleAuthError(response);
    return await response.json();
  },

  // Text-to-Speech (TTS)
  textToSpeech: async ({ text, language, voice }) => {
    const response = await fetch(`${BASE_URL}/text_to_speech`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ text, language, voice }),
    });
    handleAuthError(response);
    return await response.json();
  },

  // AI Command Suggestions
  getAICommandSuggestions: async () => {
    const response = await fetch(`${BASE_URL}/ai_command_suggestions`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
    });
    handleAuthError(response);
    return await response.json();
  },

  // AI Command Center APIs
  getAISummary: async () => {
    const response = await fetch(`${BASE_URL}/ai_summary`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
    });
    handleAuthError(response);
    return await response.json();
  },
  getAIResourceRecommendations: async () => {
    const response = await fetch(`${BASE_URL}/ai_resource_recommendations`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
    });
    handleAuthError(response);
    return await response.json();
  },
  getAICommandActions: async () => {
    const response = await fetch(`${BASE_URL}/ai_command_actions`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
    });
    handleAuthError(response);
    return await response.json();
  },

  // Upload: Get signed upload URL
  getSignedUploadUrl: async ({ filename, mimetype, zone, notes = "", type = null, bucket = null }) => {
    const response = await fetch(`${BASE_URL}/upload/presigned-url`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ filename, mimetype, zone, notes, type, bucket }),
    });
    handleAuthError(response);
    return await response.json();
  },

  // Vision Analysis
  analyzeMedia: async ({ fileUrl, zone, docId,autoIncident=false }) => {
    const response = await fetch(`${BASE_URL}/analyze-media`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ fileUrl, zone, docId, autoIncident }),
    });
    handleAuthError(response);
    return await response.json();
  },

  // Venue: Create Venue
  createVenue: async (venueData) => {
    const response = await fetch(`${BASE_URL}/venues`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(venueData),
    });
    if (!response.ok) throw new Error((await response.json()).detail || 'Failed to create venue');
    handleAuthError(response);
    return await response.json();
  },

  // Get responders assigned to an incident
  getAssignedResponders: async (incidentId) => {
    const response = await fetch(`${BASE_URL}/responders/assigned_to_incident/${incidentId}`, { headers: authHeaders() });
    handleAuthError(response);
    return await response.json();
  },

  predictCrowd: async (payload) => {
    const response = await fetch(`${BASE_URL}/predict`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });
    handleAuthError(response);
    return await response.json();
  },

  // Incident Reports & Statistics
  getAllIncidentReports: async () => (await fetch(`${BASE_URL}/incident_reports`)).json(),
  getIncidentStatistics: async () => (await fetch(`${BASE_URL}/incident_statistics`)).json(),
  getIncidentReportsByVenue: async (venueId) => (await fetch(`${BASE_URL}/incident_reports/${venueId}`)).json(),
  getVenueById: async (venueId) => (await fetch(`${BASE_URL}/venues/${venueId}`)).json(),
};

// Agent Orchestrator API
export const agentAPI = {
  runAgent: async ({ input,sessionId="default" }) => {
    const response = await fetch("https://gcp-crowd-agents-268678901849.us-central1.run.app/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query:input, session_id:sessionId }),
    });
    return await response.json();
  },
};

// Chat Agent API
export const chatAPI = {
  async enhancedChatAgent(message) {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ query: message }),
    });
    handleAuthError(res);
    return res.json();
  }
}; 