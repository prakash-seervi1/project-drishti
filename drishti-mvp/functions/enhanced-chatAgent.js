const functions = require("firebase-functions");

module.exports = (db, vertexAI, corsHandler) =>
  functions.https.onRequest(async (req, res) => {
    corsHandler(req, res, async () => {
      const userQuery = req.query.query || "What's happening in Zone A?";
      console.log("Enhanced Chat Agent - User asked:", userQuery);

      try {
        // Analyze the query to determine what data to fetch
        const analysis = analyzeQuery(userQuery);
        console.log("Query analysis:", analysis);

        // Fetch relevant data based on the analysis
        const contextData = await fetchContextData(db, analysis);
        console.log("Context data fetched:", Object.keys(contextData));

        // Generate intelligent response
        const response = await generateIntelligentResponse(userQuery, contextData, analysis, vertexAI);

        res.status(200).json({
          success: true,
          response: response,
          context: analysis.contextType,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error("Enhanced Chat Agent error:", error);
        res.status(500).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });
  });

// Analyze user query to determine what data is needed
function analyzeQuery(query) {
  const lowerQuery = query.toLowerCase();
  
  const analysis = {
    contextType: 'general',
    needsIncidents: false,
    needsZones: false,
    needsResponders: false,
    needsContacts: false,
    needsAnalytics: false,
    specificFilters: {},
    intent: 'general'
  };

  // Check for incident-related queries
  if (lowerQuery.includes('incident') || lowerQuery.includes('emergency') || 
      lowerQuery.includes('fire') || lowerQuery.includes('medical') || 
      lowerQuery.includes('security') || lowerQuery.includes('panic')) {
    analysis.contextType = 'incidents';
    analysis.needsIncidents = true;
    analysis.intent = 'incident_analysis';
    
    // Extract specific filters
    if (lowerQuery.includes('active')) analysis.specificFilters.status = 'active';
    if (lowerQuery.includes('critical')) analysis.specificFilters.priority = 'critical';
    if (lowerQuery.includes('zone a')) analysis.specificFilters.zone = 'Zone A';
    if (lowerQuery.includes('zone b')) analysis.specificFilters.zone = 'Zone B';
    if (lowerQuery.includes('zone c')) analysis.specificFilters.zone = 'Zone C';
  }

  // Check for zone-related queries
  if (lowerQuery.includes('zone') || lowerQuery.includes('occupancy') || 
      lowerQuery.includes('crowd') || lowerQuery.includes('capacity') ||
      lowerQuery.includes('sensor')) {
    analysis.contextType = 'zones';
    analysis.needsZones = true;
    analysis.intent = 'zone_analysis';
    
    if (lowerQuery.includes('zone a')) analysis.specificFilters.zone = 'Zone A';
    if (lowerQuery.includes('zone b')) analysis.specificFilters.zone = 'Zone B';
    if (lowerQuery.includes('zone c')) analysis.specificFilters.zone = 'Zone C';
  }

  // Check for responder-related queries
  if (lowerQuery.includes('responder') || lowerQuery.includes('fire brigade') || 
      lowerQuery.includes('medical') || lowerQuery.includes('security') ||
      lowerQuery.includes('available') || lowerQuery.includes('assigned')) {
    analysis.contextType = 'responders';
    analysis.needsResponders = true;
    analysis.intent = 'responder_analysis';
  }

  // Check for analytics queries
  if (lowerQuery.includes('summary') || lowerQuery.includes('statistics') || 
      lowerQuery.includes('analytics') || lowerQuery.includes('overview') ||
      lowerQuery.includes('status') || lowerQuery.includes('report')) {
    analysis.needsAnalytics = true;
    analysis.intent = 'analytics';
  }

  // Check for safety recommendations
  if (lowerQuery.includes('safety') || lowerQuery.includes('recommend') || 
      lowerQuery.includes('advice') || lowerQuery.includes('suggest')) {
    analysis.intent = 'safety_recommendations';
  }

  return analysis;
}

// Fetch relevant data from Firebase
async function fetchContextData(db, analysis) {
  const contextData = {};

  try {
    // Fetch incidents data
    if (analysis.needsIncidents) {
      let incidentsQuery = db.collection('incidents');
      
      // Apply filters
      if (analysis.specificFilters.status) {
        incidentsQuery = incidentsQuery.where('status', '==', analysis.specificFilters.status);
      }
      if (analysis.specificFilters.priority) {
        incidentsQuery = incidentsQuery.where('priority', '==', analysis.specificFilters.priority);
      }
      if (analysis.specificFilters.zone) {
        incidentsQuery = incidentsQuery.where('zone', '==', analysis.specificFilters.zone);
      }

      const incidentsSnapshot = await incidentsQuery.orderBy('timestamp', 'desc').limit(10).get();
      contextData.incidents = [];
      incidentsSnapshot.forEach(doc => {
        contextData.incidents.push({
          id: doc.id,
          ...doc.data()
        });
      });
    }

    // Fetch zones data
    if (analysis.needsZones) {
      let zonesQuery = db.collection('zones');
      
      if (analysis.specificFilters.zone) {
        zonesQuery = zonesQuery.where('name', '==', analysis.specificFilters.zone);
      }

      const zonesSnapshot = await zonesQuery.get();
      contextData.zones = [];
      zonesSnapshot.forEach(doc => {
        contextData.zones.push({
          id: doc.id,
          ...doc.data()
        });
      });
    }

    // Fetch responders data
    if (analysis.needsResponders) {
      const respondersSnapshot = await db.collection('responders').get();
      contextData.responders = [];
      respondersSnapshot.forEach(doc => {
        contextData.responders.push({
          id: doc.id,
          ...doc.data()
        });
      });
    }

    // Fetch emergency contacts
    if (analysis.needsContacts) {
      const contactsSnapshot = await db.collection('emergency_contacts').get();
      contextData.contacts = [];
      contactsSnapshot.forEach(doc => {
        contextData.contacts.push({
          id: doc.id,
          ...doc.data()
        });
      });
    }

    // Fetch analytics data
    if (analysis.needsAnalytics) {
      // Get overall statistics
      const [incidentsSnapshot, zonesSnapshot, respondersSnapshot] = await Promise.all([
        db.collection('incidents').get(),
        db.collection('zones').get(),
        db.collection('responders').get()
      ]);

      const incidents = [];
      const zones = [];
      const responders = [];

      incidentsSnapshot.forEach(doc => incidents.push({ id: doc.id, ...doc.data() }));
      zonesSnapshot.forEach(doc => zones.push({ id: doc.id, ...doc.data() }));
      respondersSnapshot.forEach(doc => responders.push({ id: doc.id, ...doc.data() }));

      contextData.analytics = {
        incidents: {
          total: incidents.length,
          active: incidents.filter(i => ['active', 'ongoing', 'investigating'].includes(i.status)).length,
          critical: incidents.filter(i => i.priority === 'critical').length,
          byType: incidents.reduce((acc, i) => {
            acc[i.type] = (acc[i.type] || 0) + 1;
            return acc;
          }, {}),
          byZone: incidents.reduce((acc, i) => {
            acc[i.zone] = (acc[i.zone] || 0) + 1;
            return acc;
          }, {})
        },
        zones: {
          total: zones.length,
          critical: zones.filter(z => z.status === 'critical').length,
          active: zones.filter(z => z.status === 'active').length,
          normal: zones.filter(z => z.status === 'normal').length,
          totalOccupancy: zones.reduce((sum, z) => sum + (z.capacity?.currentOccupancy || 0), 0),
          totalCapacity: zones.reduce((sum, z) => sum + (z.capacity?.maxOccupancy || 0), 0)
        },
        responders: {
          total: responders.length,
          available: responders.filter(r => r.status === 'available').length,
          enRoute: responders.filter(r => r.status === 'en_route').length,
          onScene: responders.filter(r => r.status === 'on_scene').length,
          byType: responders.reduce((acc, r) => {
            acc[r.type] = (acc[r.type] || 0) + 1;
            return acc;
          }, {})
        }
      };
    }

  } catch (error) {
    console.error('Error fetching context data:', error);
    throw error;
  }

  return contextData;
}

// Generate intelligent response based on context
async function generateIntelligentResponse(query, contextData, analysis, vertexAI) {
  const lowerQuery = query.toLowerCase();
  
  try {
    // Build comprehensive prompt with context
    let prompt = `You are an intelligent AI safety assistant for a large event monitoring system. 
    
User Query: "${query}"

Available Context Data:`;

    if (contextData.incidents && contextData.incidents.length > 0) {
      prompt += `\n\nRecent Incidents:`;
      contextData.incidents.forEach(incident => {
        prompt += `\n- ${incident.type} in ${incident.zone}: ${incident.status} (${incident.priority || 'medium'} priority)`;
      });
    }

    if (contextData.zones && contextData.zones.length > 0) {
      prompt += `\n\nZone Status:`;
      contextData.zones.forEach(zone => {
        const occupancy = zone.capacity ? `${zone.capacity.currentOccupancy}/${zone.capacity.maxOccupancy}` : 'N/A';
        prompt += `\n- ${zone.name}: ${zone.status} (Occupancy: ${occupancy})`;
      });
    }

    if (contextData.responders && contextData.responders.length > 0) {
      prompt += `\n\nResponder Status:`;
      const available = contextData.responders.filter(r => r.status === 'available').length;
      const assigned = contextData.responders.filter(r => r.assignedIncident).length;
      prompt += `\n- Available: ${available}, Assigned: ${assigned}, Total: ${contextData.responders.length}`;
    }

    if (contextData.analytics) {
      prompt += `\n\nSystem Analytics:`;
      prompt += `\n- Total Incidents: ${contextData.analytics.incidents.total}`;
      prompt += `\n- Active Incidents: ${contextData.analytics.incidents.active}`;
      prompt += `\n- Critical Incidents: ${contextData.analytics.incidents.critical}`;
      prompt += `\n- Available Responders: ${contextData.analytics.responders.available}`;
    }

    prompt += `\n\nInstructions: Provide a clear, helpful response based on the available data. 
    If the user asks about specific incidents, zones, or responders, use the relevant data.
    If no relevant data exists, acknowledge this and provide general safety information.
    Keep responses concise but informative.`;

    const model = vertexAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 500
      }
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    const output = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || 
                   "I couldn't process your request. Please try again.";

    return output;

  } catch (error) {
    console.error('Error generating response:', error);
    return "I'm having trouble analyzing the data right now. Please try again in a moment.";
  }
} 