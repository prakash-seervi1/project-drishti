const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { VertexAI } = require("@google-cloud/vertexai");

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp();
}

// Centralized database instance
const db = admin.firestore();

// Initialize Vertex AI (only once)
const vertexAI = new VertexAI({
  project: process.env.GCLOUD_PROJECT || "project-drishti-mvp-31f1b",
  location: "us-central1",
});

const geminiModel = vertexAI.getGenerativeModel({
  model: "gemini-2.5-pro",
  generationConfig: { temperature: 0.4 },
});

// Export centralized dependencies for other modules
module.exports.dependencies = {
  admin,
  db,
  vertexAI,
  geminiModel,
  functions
};

// Import all API modules (pass dependencies to avoid redundant initialization)
const incidentsAPI = require('./incidents-api.js');
const zonesAPI = require('./zones-api.js');
const respondersAPI = require('./responders-api.js');
const emergencyContactsAPI = require('./emergency-contacts-api.js');
const enhancedChatAgent = require('./chat-agent.js');
const analyzeWithGemini = require('./analyzeWithGemini');
const getSignedUploadUrl = require('./getSignedUploadUrl');
const venuesAPI = require('./venues-api.js');

// MCP Agent integration
// const { Agent, ToolRegistry, Context } = require('@google/model-context-protocol');
// const mcpAgentModule = require('./mcp-agent.js');

// module.exports.mcpChatAgent = functions.https.onRequest(async (req, res) => {
//   res.set('Access-Control-Allow-Origin', '*');
//   res.set('Access-Control-Allow-Methods', 'GET, POST');
//   res.set('Access-Control-Allow-Headers', 'Content-Type');
//   if (req.method === 'OPTIONS') {
//     res.status(204).send('');
//     return;
//   }
//   try {
//     const input = req.body.query || req.query.query;
//     if (!input) {
//       return res.status(400).json({ success: false, error: 'Query parameter is required' });
//     }
//     const context = new Context({ input });
//     const result = await mcpAgentModule.runMCPAgent(context);
//     res.status(200).json({ success: true, ...result });
//   } catch (error) {
//     console.error('MCP Chat Agent Error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// Export all functions
module.exports = {
  // Enhanced Chat Agent
  enhancedChatAgent: enhancedChatAgent.enhancedChatAgent,
  getIncidentRecommendations: enhancedChatAgent.getIncidentRecommendations,

  // Gemini-based crowd analysis
  analyzeWithGemini: analyzeWithGemini(db, geminiModel),

  // File Upload
  getSignedUploadUrl: getSignedUploadUrl,

  // Incidents API
  getIncidents: incidentsAPI.getIncidents,
  getIncidentById: incidentsAPI.getIncidentById,
  createIncident: incidentsAPI.createIncident,
  updateIncident: incidentsAPI.updateIncident,
  deleteIncident: incidentsAPI.deleteIncident,
  getIncidentNotes: incidentsAPI.getIncidentNotes,
  addIncidentNote: incidentsAPI.addIncidentNote,
  bulkUpdateIncidents: incidentsAPI.bulkUpdateIncidents,
  getIncidentAnalytics: incidentsAPI.getIncidentAnalytics,
  getIncidentsByZone: incidentsAPI.getIncidentsByZone,
  getActiveIncidentsByZone: incidentsAPI.getActiveIncidentsByZone,

  // Zones API
  getZones: zonesAPI.getZones,
  getZoneById: zonesAPI.getZoneById,
  updateZone: zonesAPI.updateZone,
  getZoneSensors: zonesAPI.getZoneSensors,
  addSensorReading: zonesAPI.addSensorReading,
  getZoneAnalytics: zonesAPI.getZoneAnalytics,
  bulkUpdateZones: zonesAPI.bulkUpdateZones,

  // Responders API
  getResponders: respondersAPI.getResponders,
  getResponderById: respondersAPI.getResponderById,
  updateResponder: respondersAPI.updateResponder,
  assignResponderToIncident: respondersAPI.assignResponderToIncident,
  unassignResponder: respondersAPI.unassignResponder,
  getAvailableResponders: respondersAPI.getAvailableResponders,
  updateResponderPosition: respondersAPI.updateResponderPosition,
  getResponderAnalytics: respondersAPI.getResponderAnalytics,
  getAssignmentsForResponder: respondersAPI.getAssignmentsForResponder,
  getAssignmentById: respondersAPI.getAssignmentById,
  createAssignment: respondersAPI.createAssignment,
  updateAssignment: respondersAPI.updateAssignment,

  // Emergency Contacts API
  getEmergencyContacts: emergencyContactsAPI.getEmergencyContacts,
  getEmergencyContactById: emergencyContactsAPI.getEmergencyContactById,
  createEmergencyContact: emergencyContactsAPI.createEmergencyContact,
  updateEmergencyContact: emergencyContactsAPI.updateEmergencyContact,
  deleteEmergencyContact: emergencyContactsAPI.deleteEmergencyContact,
  getContactsByIncidentType: emergencyContactsAPI.getContactsByIncidentType,
  toggleContactStatus: emergencyContactsAPI.toggleContactStatus,
  getContactAnalytics: emergencyContactsAPI.getContactAnalytics,

  // Venue API
  createVenue: venuesAPI.createVenue({ db, admin, geminiModel }),

  // System Status and Analytics
  getSystemStatus: functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    try {
      const [incidentsSnapshot, zonesSnapshot, respondersSnapshot] = await Promise.all([
        db.collection("incidents").get(),
        db.collection("zones").get(),
        db.collection("responders").get()
      ]);

      const incidents = [];
      const zones = [];
      const responders = [];

      incidentsSnapshot.forEach(doc => incidents.push({ id: doc.id, ...doc.data() }));
      zonesSnapshot.forEach(doc => zones.push({ id: doc.id, ...doc.data() }));
      respondersSnapshot.forEach(doc => responders.push({ id: doc.id, ...doc.data() }));

      const systemStatus = {
        timestamp: new Date().toISOString(),
        incidents: {
          total: incidents.length,
          active: incidents.filter(i => ['active', 'investigating'].includes(i.status)).length,
          critical: incidents.filter(i => i.priority === 'critical').length
        },
        zones: {
          total: zones.length,
          critical: zones.filter(z => z.status === 'critical').length,
          normal: zones.filter(z => z.status === 'normal').length
        },
        responders: {
          total: responders.length,
          available: responders.filter(r => r.status === 'available').length,
          assigned: responders.filter(r => r.assignedIncident).length
        },
        overallStatus: calculateOverallStatus(incidents, zones, responders)
      };

      res.status(200).json({
        success: true,
        data: systemStatus
      });

    } catch (error) {
      console.error("System status error:", error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }),

  // Analytics Function
  getAnalytics: functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    try {
      const { period = "24h" } = req.query;
      
      const timeRange = calculateTimeRange(period);
      
      let query = db.collection("incidents");
      if (timeRange.startTime) {
        query = query.where("timestamp", ">=", timeRange.startTime);
      }
      
      const snapshot = await query.get();
      const incidents = [];
      snapshot.forEach(doc => incidents.push({ id: doc.id, ...doc.data() }));

      const analytics = {
        period,
        timestamp: new Date().toISOString(),
        incidents: {
          total: incidents.length,
          byType: incidents.reduce((acc, i) => {
            acc[i.type] = (acc[i.type] || 0) + 1;
            return acc;
          }, {}),
          byZone: incidents.reduce((acc, i) => {
            acc[i.zone] = (acc[i.zone] || 0) + 1;
            return acc;
          }, {}),
          byPriority: incidents.reduce((acc, i) => {
            acc[i.priority] = (acc[i.priority] || 0) + 1;
            return acc;
          }, {}),
          byStatus: incidents.reduce((acc, i) => {
            acc[i.status] = (acc[i.status] || 0) + 1;
            return acc;
          }, {})
        },
        trends: calculateTrends(incidents, timeRange)
      };

      res.status(200).json({
        success: true,
        data: analytics
      });

    } catch (error) {
      console.error("Analytics error:", error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }),

  // Health Check Function
  healthCheck: functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    try {
      const healthStatus = {
        timestamp: new Date().toISOString(),
        status: "healthy",
        services: {
          firestore: "operational",
          functions: "operational",
          vertexAI: "operational"
        },
        version: "2.0.0",
        environment: process.env.NODE_ENV || "production"
      };

      res.status(200).json({
        success: true,
        data: healthStatus
      });

    } catch (error) {
      console.error("Health check error:", error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }),

  // MCP Agent API
  // mcpAgent: functions.https.onRequest(async (req, res) => {
  //   res.set('Access-Control-Allow-Origin', '*');
  //   res.set('Access-Control-Allow-Methods', 'GET, POST');
  //   res.set('Access-Control-Allow-Headers', 'Content-Type');
  //   if (req.method === 'OPTIONS') {
  //     res.status(204).send('');
  //     return;
  //   }
  //   try {
  //     const { query } = req.body;
  //     if (!query) {
  //       return res.status(400).json({ success: false, error: 'Query is required' });
  //     }
  //     const context = { input: query };
  //     const result = await mcpAgentModule.runMCPAgent(context);
  //     res.status(200).json({ success: true, ...result });
  //   } catch (error) {
  //     console.error('MCP Agent Error:', error);
  //     res.status(500).json({ success: false, error: error.message });
  //   }
  // })
};

// Helper functions
function calculateOverallStatus(incidents, zones, responders) {
  const criticalIncidents = incidents.filter(i => i.priority === 'critical').length;
  const criticalZones = zones.filter(z => z.status === 'critical').length;
  const availableResponders = responders.filter(r => r.status === 'available').length;

  if (criticalIncidents > 0 || criticalZones > 0) {
    return "critical";
  } else if (availableResponders < 2) {
    return "warning";
  } else {
    return "normal";
  }
}

function calculateTimeRange(period) {
  const now = new Date();
  let startTime;
  
  switch (period) {
    case "1h":
      startTime = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case "6h":
      startTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
      break;
    case "24h":
      startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case "7d":
      startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    default:
      startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
  
  return { startTime, endTime: now };
}

function calculateTrends(incidents, timeRange) {
  // Group incidents by hour
  const hourlyData = {};
  
  incidents.forEach(incident => {
    const timestamp = incident.timestamp?.toDate?.() || incident.timestamp;
    const hour = new Date(timestamp).getHours();
    hourlyData[hour] = (hourlyData[hour] || 0) + 1;
  });

  return {
    hourlyDistribution: hourlyData,
    peakHour: Object.keys(hourlyData).reduce((a, b) => hourlyData[a] > hourlyData[b] ? a : b),
    totalIncidents: incidents.length
  };
} 