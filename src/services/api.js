// API Service for Firebase Functions
const BASE_URL = 'https://us-central1-project-drishti-mvp-31f1b.cloudfunctions.net';

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${BASE_URL}/${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// Incidents API
export const incidentsAPI = {
  // Get all incidents with filtering
  getIncidents: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`getIncidents?${queryString}`);
  },

  // Get single incident
  getIncidentById: (id) => apiCall(`getIncidentById/${id}`),

  // Create new incident
  createIncident: (data) => apiCall('createIncident', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Update incident
  updateIncident: (id, data) => apiCall(`updateIncident/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Delete incident
  deleteIncident: (id) => apiCall(`deleteIncident/${id}`, {
    method: 'DELETE',
  }),

  // Get incident notes
  getIncidentNotes: (id) => apiCall(`getIncidentNotes/${id}`),

  // Add incident note
  addIncidentNote: (id, note) => apiCall(`addIncidentNote/${id}`, {
    method: 'POST',
    body: JSON.stringify({ note }),
  }),

  // Bulk update incidents
  bulkUpdateIncidents: (updates) => apiCall('bulkUpdateIncidents', {
    method: 'PUT',
    body: JSON.stringify({ updates }),
  }),

  // Get incident analytics
  getIncidentAnalytics: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`getIncidentAnalytics?${queryString}`);
  },

  // Get AI response for any query/context
  getAIResponse: ({ query, incidentId }) => apiCall('getIncidentRecommendations', {
    method: 'POST',
    body: JSON.stringify({ query, incidentId }),
    headers: { 'Content-Type': 'application/json' },
  }),
};

// Zones API
export const zonesAPI = {
  // Get all zones
  getZones: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`getZones?${queryString}`);
  },

  // Get single zone
  getZoneById: (id) => apiCall(`getZoneById/${id}`),

  // Update zone
  updateZone: (id, data) => apiCall(`updateZone/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Get zone sensors
  getZoneSensors: (id) => apiCall(`getZoneSensors/${id}`),

  // Add sensor reading
  addSensorReading: (id, reading) => apiCall(`addSensorReading/${id}`, {
    method: 'POST',
    body: JSON.stringify(reading),
  }),

  // Get zone analytics
  getZoneAnalytics: (id) => apiCall(`getZoneAnalytics/${id}`),

  // Bulk update zones
  bulkUpdateZones: (updates) => apiCall('bulkUpdateZones', {
    method: 'PUT',
    body: JSON.stringify({ updates }),
  }),
};

// Responders API
export const respondersAPI = {
  // Get all responders
  getResponders: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`getResponders?${queryString}`);
  },

  // Get single responder
  getResponderById: (id) => apiCall(`getResponderById/${id}`),

  // Update responder
  updateResponder: (id, data) => apiCall(`updateResponder/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Assign responder to incident
  assignResponderToIncident: (responderId, incidentId) => apiCall(`assignResponderToIncident/${responderId}`, {
    method: 'POST',
    body: JSON.stringify({ incidentId }),
  }),

  // Unassign responder
  unassignResponder: (responderId) => apiCall(`unassignResponder/${responderId}`, {
    method: 'POST',
  }),

  // Get available responders
  getAvailableResponders: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`getAvailableResponders?${queryString}`);
  },

  // Update responder position
  updateResponderPosition: (id, position) => apiCall(`updateResponderPosition/${id}`, {
    method: 'PUT',
    body: JSON.stringify(position),
  }),

  // Get responder analytics
  getResponderAnalytics: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`getResponderAnalytics?${queryString}`);
  },
};

// Emergency Contacts API
export const emergencyContactsAPI = {
  // Get all emergency contacts
  getEmergencyContacts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`getEmergencyContacts?${queryString}`);
  },

  // Get single emergency contact
  getEmergencyContactById: (id) => apiCall(`getEmergencyContactById/${id}`),

  // Create new emergency contact
  createEmergencyContact: (data) => apiCall('createEmergencyContact', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Update emergency contact
  updateEmergencyContact: (id, data) => apiCall(`updateEmergencyContact/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Delete emergency contact
  deleteEmergencyContact: (id) => apiCall(`deleteEmergencyContact/${id}`, {
    method: 'DELETE',
  }),

  // Get contacts by incident type
  getContactsByIncidentType: (type) => apiCall(`getContactsByIncidentType/${type}`),

  // Toggle contact status
  toggleContactStatus: (id) => apiCall(`toggleContactStatus/${id}`, {
    method: 'POST',
  }),

  // Get contact analytics
  getContactAnalytics: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`getContactAnalytics?${queryString}`);
  },
};

// System API
export const systemAPI = {
  // Get system status
  getSystemStatus: () => apiCall('getSystemStatus'),

  // Get analytics
  getAnalytics: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`getAnalytics?${queryString}`);
  },

  // Health check
  healthCheck: () => apiCall('healthCheck'),
};

// Enhanced Chat Agent API
export const chatAPI = {
  // Enhanced chat agent
  enhancedChatAgent: (query) => {
    const queryString = new URLSearchParams({ query }).toString();
    return apiCall(`enhancedChatAgent?${queryString}`);
  },
};

// File Upload API
export const uploadAPI = {
  // Get signed upload URL
  getSignedUploadUrl: (data) => apiCall('getSignedUploadUrl', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Gemini Analysis API
export const geminiAPI = {
  // Analyze with Gemini
  analyzeWithGemini: (data) => apiCall('analyzeWithGemini', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Responder Assignments API
export const responderAssignmentsAPI = {
  // Get responder assignment by ID
  getAssignmentById: (id) => apiCall(`getResponderAssignmentById/${id}`),
};

export default {
  incidents: incidentsAPI,
  zones: zonesAPI,
  responders: respondersAPI,
  emergencyContacts: emergencyContactsAPI,
  system: systemAPI,
  chat: chatAPI,
  upload: uploadAPI,
  gemini: geminiAPI,
}; 