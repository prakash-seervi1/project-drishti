// Enhanced functions/index.js

const functions = require("firebase-functions");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const cors = require("cors");
const { VertexAI } = require("@google-cloud/vertexai");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// 🔧 Initialize Firebase Admin (only once)
initializeApp();
const db = getFirestore();

// 🌐 Setup CORS (shared)
const corsHandler = cors({ origin: true });

// ⚙️ Vertex AI client & Gemini Pro Vision model (shared)
const vertexAI = new VertexAI({
  project: process.env.GCLOUD_PROJECT || "project-drishti-mvp-31f1b",
  location: "us-central1",
});

const geminiModel = vertexAI.getGenerativeModel({
  model: "gemini-2.5-pro",
  generationConfig: { temperature: 0.4 },
});

// ✅ Import enhanced function modules
const enhancedChatAgent = require("./enhanced-chatAgent");
const enhancedDispatchResponder = require("./enhanced-dispatchResponder");
const enhancedSummarizeZone = require("./enhanced-summarizeZone");
const enhancedLostAndFound = require("./enhanced-lostAndFound");
const enhancedAutoIncidentSimulator = require("./enhanced-autoIncidentSimulator");

// ✅ Import original function modules (for backward compatibility)
const summarizeZone = require("./summarizeZone");
const lostAndFound = require("./lostAndFound");
const chatAgent = require("./chatAgent");
const dispatchResponder = require("./dispatchResponder");
const autoIncidentSimulator = require("./autoIncidentSimulator");
const uploadMedia = require("./uploadMedia");
const getSignedUploadUrl = require("./getSignedUploadUrl");
const analyzeWithGemini = require("./analyzeWithGemini");

// ✅ Export enhanced functions
exports.enhancedChatAgent = enhancedChatAgent(db, vertexAI, corsHandler);
exports.enhancedDispatchResponder = enhancedDispatchResponder(db, corsHandler);
exports.enhancedSummarizeZone = enhancedSummarizeZone(db, vertexAI, corsHandler);
exports.enhancedLostAndFound = enhancedLostAndFound(vertexAI, corsHandler);
exports.enhancedAutoIncidentSimulator = enhancedAutoIncidentSimulator(db, corsHandler);

// ✅ Export original functions (for backward compatibility)
exports.summarizeZone = summarizeZone(db, vertexAI, corsHandler);
exports.lostAndFound2 = lostAndFound(vertexAI, corsHandler);
exports.chatAgent = chatAgent(db, vertexAI, corsHandler);
exports.dispatchResponder = dispatchResponder(db, corsHandler);
exports.autoIncidentSimulator = autoIncidentSimulator(db, corsHandler);
exports.getSignedUploadUrl = getSignedUploadUrl(db, corsHandler);
exports.analyzeWithGemini = analyzeWithGemini(db, geminiModel);

// 🆕 New utility functions
exports.getSystemStatus = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
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
  });
});

// 🆕 Analytics function
exports.getAnalytics = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    try {
      const { period = "24h", type = "all" } = req.query;
      
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
  });
});

// 🆕 Health check function
exports.healthCheck = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    try {
      const healthStatus = {
        timestamp: new Date().toISOString(),
        status: "healthy",
        services: {
          firestore: "operational",
          vertexAI: "operational",
          functions: "operational"
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
  });
});

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