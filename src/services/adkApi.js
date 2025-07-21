// API Service for Python/FastAPI ADK Backend
const BASE_URL = "https://gcp-crowd-agents-268678901849.us-central1.run.app/api";

export const api = {
  // Incidents
  getIncidents: async () => (await fetch(`${BASE_URL}/incidents`)).json(),
  getIncidentById: async (id) => (await fetch(`${BASE_URL}/incidents/${id}`)).json(),
  getIncidentsByStatus: async (status) => (await fetch(`${BASE_URL}/incidents/status/${status}`)).json(),
  getIncidentsByZone: async (zoneId) => (await fetch(`${BASE_URL}/incidents/zone/${zoneId}`)).json(),

  // Zones
  getZones: async () => (await fetch(`${BASE_URL}/zones`)).json(),
  getZoneById: async (id) => (await fetch(`${BASE_URL}/zones/${id}`)).json(),
  getZonesByStatus: async (status) => (await fetch(`${BASE_URL}/zones/status/${status}`)).json(),
  getZonesByRisk: async (risk) => (await fetch(`${BASE_URL}/zones/risk/${risk}`)).json(),

  // Responders
  getResponders: async () => (await fetch(`${BASE_URL}/responders`)).json(),
  getResponderById: async (id) => (await fetch(`${BASE_URL}/responders/${id}`)).json(),
  getRespondersByStatus: async (status) => (await fetch(`${BASE_URL}/responders/status/${status}`)).json(),
  getRespondersByType: async (type) => (await fetch(`${BASE_URL}/responders/type/${type}`)).json(),

  // Emergency Contacts
  getEmergencyContacts: async () => (await fetch(`${BASE_URL}/emergency_contacts`)).json(),
  getEmergencyContactById: async (id) => (await fetch(`${BASE_URL}/emergency_contacts/${id}`)).json(),
  getEmergencyContactsByType: async (type) => (await fetch(`${BASE_URL}/emergency_contacts/type/${type}`)).json(),
  getEmergencyContactsByStatus: async (isActive) => (await fetch(`${BASE_URL}/emergency_contacts/status/${isActive}`)).json(),

  // Dispatch Responder
  dispatchResponder: async ({ responderId, zoneId, notes }) => {
    const response = await fetch(`${BASE_URL}/dispatch_responder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ responderId, zoneId, notes }),
    });
    return await response.json();
  },

  // Send Alert
  sendAlert: async ({ alertType, target, language, message }) => {
    const response = await fetch(`${BASE_URL}/send_alert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alertType, target, language, message }),
    });
    return await response.json();
  },

  // Generate Alert Message (AI)
  generateAlertMessage: async ({ alertType, target, language }) => {
    const response = await fetch(`${BASE_URL}/generate_alert_message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alertType, target, language }),
    });
    return await response.json();
  },

  // Text-to-Speech (TTS)
  textToSpeech: async ({ text, language, voice }) => {
    const response = await fetch(`${BASE_URL}/text_to_speech`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language, voice }),
    });
    return await response.json();
  },

  // AI Command Suggestions
  getAICommandSuggestions: async () => {
    const response = await fetch(`${BASE_URL}/ai_command_suggestions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    return await response.json();
  },

  // AI Command Center APIs
  getAISummary: async () => {
    const response = await fetch(`${BASE_URL}/ai_summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    return await response.json();
  },
  getAIResourceRecommendations: async () => {
    const response = await fetch(`${BASE_URL}/ai_resource_recommendations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    return await response.json();
  },
  getAICommandActions: async () => {
    const response = await fetch(`${BASE_URL}/ai_command_actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    return await response.json();
  },

  // Upload: Get signed upload URL
  getSignedUploadUrl: async ({ filename, mimetype, zone, notes = "", type = null, bucket = null }) => {
    const response = await fetch(`${BASE_URL}/upload/presigned-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, mimetype, zone, notes, type, bucket }),
    });
    return await response.json();
  },

  // Vision Analysis
  analyzeMedia: async ({ fileUrl, zone, docId }) => {
    const response = await fetch(`${BASE_URL}/analyze-media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl, zone, docId }),
    });
    return await response.json();
  },

  // Venue: Create Venue
  createVenue: async (venueData) => {
    const response = await fetch(`${BASE_URL}/venues`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(venueData),
    });
    if (!response.ok) throw new Error((await response.json()).detail || 'Failed to create venue');
    return await response.json();
  },
};

// Agent Orchestrator API
export const agentAPI = {
  runAgent: async ({ input }) => {
    const response = await fetch("https://gcp-crowd-agents-268678901849.us-central1.run.app/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query:input }),
    });
    return await response.json();
  },
};

// Chat Agent API
export const chatAPI = {
  async enhancedChatAgent(message) {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: message }),
    });
    return res.json();
  }
}; 