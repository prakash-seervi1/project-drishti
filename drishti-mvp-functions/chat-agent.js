const functions = require('firebase-functions');

// Get centralized dependencies from index.js
const { db, geminiModel } = require('./index.js').dependencies;

// Enhanced Chat Agent with Gemini-powered query analysis
exports.enhancedChatAgent = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required'
      });
    }

    console.log('Enhanced Chat Agent Query:', query);

    // Use Gemini to analyze the query and generate search parameters
    const geminiAnalysis = await analyzeQueryWithGemini(query);
    
    // If Gemini analysis fails, fall back to our existing logic
    const analysis = geminiAnalysis || analyzeQuery(query);
    
    // Fetch relevant data based on the analysis
    const contextData = await fetchContextData(analysis);
    
    // Generate intelligent response using Gemini
    const response = await generateIntelligentResponseWithGemini(query, contextData, analysis);
    
    res.status(200).json({
      success: true,
      response: response,
      context: analysis.contextType,
      analysisMethod: geminiAnalysis ? 'gemini' : 'fallback'
    });

  } catch (error) {
    console.error('Enhanced Chat Agent Error:', error.message,error.stack);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// AI Recommendations for Incident (new normalized schema)
exports.getIncidentRecommendations = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  try {
    const { query, incidentId } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, error: 'Query is required' });
    }
    let contextText = '';
    if (incidentId) {
      // Fetch incident context
      const incidentDoc = await db.collection('incidents').doc(incidentId).get();
      if (!incidentDoc.exists) {
        return res.status(404).json({ success: false, error: 'Incident not found' });
      }
      const incident = { id: incidentDoc.id, ...incidentDoc.data() };
      // Fetch zone
      let zone = null;
      if (incident.zoneId) {
        const zoneDoc = await db.collection('zones').doc(incident.zoneId).get();
        if (zoneDoc.exists) zone = { id: zoneDoc.id, ...zoneDoc.data() };
      }
      // Fetch assigned responder
      let assignedResponder = null;
      if (incident.assignedResponderId) {
        const responderDoc = await db.collection('responders').doc(incident.assignedResponderId).get();
        if (responderDoc.exists) assignedResponder = { id: responderDoc.id, ...responderDoc.data() };
      }
      // Fetch assignment transaction
      let assignmentTransaction = null;
      if (incident.assignmentTransactionId) {
        const txnDoc = await db.collection('responderAssignments').doc(incident.assignmentTransactionId).get();
        if (txnDoc.exists) assignmentTransaction = { id: txnDoc.id, ...txnDoc.data() };
      }
      contextText = `Incident: ${JSON.stringify(incident, null, 2)}\n\nZone: ${JSON.stringify(zone, null, 2)}\n\nAssigned Responder: ${JSON.stringify(assignedResponder, null, 2)}\n\nAssignment Transaction: ${JSON.stringify(assignmentTransaction, null, 2)}`;
    } else {
      // Global context
      const incidentsSnapshot = await db.collection('incidents').where('status', 'in', ['active', 'ongoing', 'investigating']).get();
      const incidents = [];
      incidentsSnapshot.forEach(doc => incidents.push({ id: doc.id, ...doc.data() }));
      const zonesSnapshot = await db.collection('zones').get();
      const zones = [];
      zonesSnapshot.forEach(doc => zones.push({ id: doc.id, ...doc.data() }));
      const respondersSnapshot = await db.collection('responders').get();
      const responders = [];
      respondersSnapshot.forEach(doc => responders.push({ id: doc.id, ...doc.data() }));
      contextText = `Incidents: ${JSON.stringify(incidents, null, 2)}\n\nZones: ${JSON.stringify(zones, null, 2)}\n\nResponders: ${JSON.stringify(responders, null, 2)}`;
    }
    // Build prompt for Gemini
    const prompt = `${query}\n\nContext:\n${contextText}`;
    // Call Gemini
    const result = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: null }
    });
    const aiText = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.status(200).json({ success: true, response: aiText });
  } catch (error) {
    console.error('AI Recommendation Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Use Gemini to intelligently analyze user query and generate search parameters
async function analyzeQueryWithGemini(query) {
  try {
    const prompt = `You are an AI assistant analyzing user queries for a safety monitoring system. 
    
Available data collections:
- incidents: emergency incidents with type, status, priority, zone, timestamp
- zones: areas with name, status, capacity (currentOccupancy/maxOccupancy)
- responders: emergency personnel with type, status, assignedIncident
- emergency_contacts: contact information
- analytics: system statistics

User Query: "${query}"

Analyze this query and return a JSON object with the following structure:
{
  "contextType": "incidents|zones|responders|contacts|analytics|general",
  "needsIncidents": boolean,
  "needsZones": boolean, 
  "needsResponders": boolean,
  "needsContacts": boolean,
  "needsAnalytics": boolean,
  "specificFilters": {
    "status": "active|resolved|investigating",
    "priority": "critical|high|medium|low", 
    "zone": "Zone A|Zone B|Zone C",
    "type": "fire|medical|security|panic"
  },
  "intent": "incident_analysis|zone_analysis|responder_analysis|analytics|safety_recommendations|general",
  "suggestedSearches": [
    "additional search terms or filters that might be relevant"
  ]
}

Only include fields that are relevant based on the query. Be intelligent about what data would be most helpful.
If the query is about recent incidents, set needsIncidents: true and contextType: "incidents".
If asking about crowd levels or occupancy, set needsZones: true.
If asking about available help or personnel, set needsResponders: true.
If asking for statistics or overview, set needsAnalytics: true.

For suggestedSearches, think of related queries or filters that might provide additional context.
For example, if someone asks about "fire incidents", also suggest checking "critical priority incidents" and "Zone A incidents".

Return ONLY the JSON object, no other text.`;

    const result = await geminiModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: null
      }
    });

    console.log('result.response--------analyzeQueryWithGemini-------result.response?.candidates?.[0]?.content?.parts',result.response?.candidates?.[0]?.content?.parts)
    let output = result.response?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('result.response--------analyzeQueryWithGemini----------output',output
      .replace(/```json/g, '')
      .replace(/```/g, ''));
    if (output) {
      output= output
      .replace(/```json/g, '')
      .replace(/```/g, '')
      // Try to parse the JSON response
      const analysis = JSON.parse(output.trim());
      
      // Validate the structure
      if (analysis && typeof analysis === 'object') {
        console.log('Gemini Analysis Result:', analysis);
        
        // If Gemini suggests additional searches, try to fetch that data too
        if (analysis.suggestedSearches && analysis.suggestedSearches.length > 0) {
          console.log('Gemini suggested additional searches:', analysis.suggestedSearches);
        }
    console.log('result.analysis--------analyzeQueryWithGemini-------',analysis)
        
        return analysis;
      }
    }
    
    return null; // Fall back to manual analysis

  } catch (error) {
    console.error('Error in Gemini query analysis:', error);
    return null; // Fall back to manual analysis
  }
}

// Fallback manual query analysis (existing logic)
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

  console.log('analyzeQuery--------analysis-------',analysis)

  return analysis;
}

// Fetch relevant data from Firebase
async function fetchContextData(analysis) {
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
        // Try to find zoneId by zone name
        const zoneSnap = await db.collection('zones').where('name', '==', analysis.specificFilters.zone).limit(1).get();
        let zoneId = null;
        if (!zoneSnap.empty) {
          zoneId = zoneSnap.docs[0].id;
        }
        if (zoneId) {
          incidentsQuery = incidentsQuery.where('zoneId', '==', zoneId);
        }
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
            acc[i.zoneId] = (acc[i.zoneId] || 0) + 1;
            return acc;
          }, {}),
          byPriority: incidents.reduce((acc, i) => {
            acc[i.priority] = (acc[i.priority] || 0) + 1;
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
          assigned: responders.filter(r => r.assignedResponderId || r.assignmentId).length,
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

  console.log('contextData--------analysis-------',contextData)
  return contextData;
}

// Generate intelligent response using Gemini
async function generateIntelligentResponseWithGemini(query, contextData, analysis) {
  try {
    // Aggregate and summarize context data
    let incidentSummary = '';
    let zoneSummary = '';
    let responderSummary = '';
    let analyticsSummary = '';

    // Incidents
    if (contextData.incidents && contextData.incidents.length > 0) {
      const byType = {};
      const byZone = {};
      const byPriority = {};
      contextData.incidents.forEach(incident => {
        byType[incident.type] = (byType[incident.type] || 0) + 1;
        byZone[incident.zoneId] = (byZone[incident.zoneId] || 0) + 1;
        byPriority[incident.priority] = (byPriority[incident.priority] || 0) + 1;
      });
      incidentSummary += `There are ${contextData.incidents.length} relevant incidents.\n`;
      incidentSummary += Object.entries(byType).map(([type, count]) => `- ${count} ${type} incident(s)`).join('\n') + '\n';
      incidentSummary += Object.entries(byPriority).map(([priority, count]) => `- ${count} ${priority} priority`).join('\n') + '\n';
      incidentSummary += Object.entries(byZone).map(([zoneId, count]) => `- ${count} in zone ${zoneId}`).join('\n');
      incidentSummary += '\n\nDetails:';
      contextData.incidents.forEach(incident => {
        incidentSummary += `\n• [${incident.type}] Status: ${incident.status}, Priority: ${incident.priority}, Zone: ${incident.zoneId}, Description: ${incident.description || 'N/A'}`;
      });
    }

    // Zones
    if (contextData.zones && contextData.zones.length > 0) {
      const overcrowded = contextData.zones.filter(z => z.capacity && z.capacity.currentOccupancy >= z.capacity.maxOccupancy * 0.9);
      const critical = contextData.zones.filter(z => z.status === 'critical');
      zoneSummary += `There are ${contextData.zones.length} zones.\n`;
      if (critical.length > 0) {
        zoneSummary += `Critical zones: ${critical.map(z => z.name).join(', ')}.\n`;
      }
      if (overcrowded.length > 0) {
        zoneSummary += `Overcrowded zones: ${overcrowded.map(z => `${z.name} (${z.capacity.currentOccupancy}/${z.capacity.maxOccupancy})`).join(', ')}.\n`;
      }
      contextData.zones.forEach(zone => {
        zoneSummary += `\n• [${zone.name}] Status: ${zone.status}, Occupancy: ${zone.capacity?.currentOccupancy || 'N/A'}/${zone.capacity?.maxOccupancy || 'N/A'}`;
      });
    }

    // Responders
    if (contextData.responders && contextData.responders.length > 0) {
      const available = contextData.responders.filter(r => r.status === 'available');
      const assigned = contextData.responders.filter(r => r.status === 'assigned' || r.assignmentId);
      const byType = {};
      contextData.responders.forEach(r => {
        byType[r.type] = (byType[r.type] || 0) + 1;
      });
      responderSummary += `There are ${contextData.responders.length} responders.\n`;
      responderSummary += `Available: ${available.length}, Assigned: ${assigned.length}.\n`;
      responderSummary += Object.entries(byType).map(([type, count]) => `- ${count} ${type}`).join('\n');
      contextData.responders.forEach(r => {
        responderSummary += `\n• [${r.name || r.id}] Type: ${r.type}, Status: ${r.status}, Assigned Incident: ${r.assignmentId || 'None'}`;
      });
    }

    // Analytics
    if (contextData.analytics) {
      analyticsSummary += `System Analytics:\n`;
      analyticsSummary += `- Total Incidents: ${contextData.analytics.incidents?.total}\n`;
      analyticsSummary += `- Active Incidents: ${contextData.analytics.incidents?.active}\n`;
      analyticsSummary += `- Critical Incidents: ${contextData.analytics.incidents?.critical}\n`;
      analyticsSummary += `- Available Responders: ${contextData.analytics.responders?.available}\n`;
      analyticsSummary += `- Overcrowded Zones: ${contextData.analytics.zones?.critical}\n`;
    }

    // Build comprehensive prompt
    let prompt = `You are an intelligent AI safety assistant for a large event monitoring system.\n\nUser Query: "${query}"\n\nAnalyze the following situation and provide:\n1. A comprehensive, prioritized summary of all major issues (incidents, overcrowding, responder shortages, etc).\n2. Actionable recommendations for each issue, with priorities.\n3. Any urgent follow-ups or dependencies.\n4. Suggest relevant follow-up queries.\n\n---\n\n## Incidents\n${incidentSummary || 'No incident data.'}\n\n## Zones\n${zoneSummary || 'No zone data.'}\n\n## Responders\n${responderSummary || 'No responder data.'}\n\n## Analytics\n${analyticsSummary || 'No analytics data.'}\n\n---\n\nPlease be specific, group issues by type/zone/severity, and provide a clear action plan. Format your response with headings, bullet points, and actionable steps.`;

    const result = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: null }
    });
    const aiText = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || 'No recommendations generated.';
    return aiText;
  } catch (error) {
    console.error('Gemini response generation error:', error);
    return 'Error generating AI response.';
  }
} 