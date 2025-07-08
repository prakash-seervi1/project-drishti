'use strict';
const { Tool, Agent, ToolRegistry, Context } = require('@google/model-context-protocol');

// Tool: Analyze Query with Gemini
class AnalyzeQueryWithGeminiTool extends Tool {
  constructor() { super('AnalyzeQueryWithGeminiTool'); }
  async run({ input, geminiModel }) {
    try {
      const prompt = `You are an AI assistant analyzing user queries for a safety monitoring system. \n\nAvailable data collections:\n- incidents: emergency incidents with type, status, priority, zone, timestamp\n- zones: areas with name, status, capacity (currentOccupancy/maxOccupancy)\n- responders: emergency personnel with type, status, assignedIncident\n- emergency_contacts: contact information\n- analytics: system statistics\n\nUser Query: "${input}"\n\nAnalyze this query and return a JSON object with the following structure:\n{\n  "contextType": "incidents|zones|responders|contacts|analytics|general",\n  "needsIncidents": boolean,\n  "needsZones": boolean, \n  "needsResponders": boolean,\n  "needsContacts": boolean,\n  "needsAnalytics": boolean,\n  "specificFilters": {\n    "status": "active|resolved|investigating",\n    "priority": "critical|high|medium|low", \n    "zone": "Zone A|Zone B|Zone C",\n    "type": "fire|medical|security|panic"\n  },\n  "intent": "incident_analysis|zone_analysis|responder_analysis|analytics|safety_recommendations|general",\n  "suggestedSearches": [\n    "additional search terms or filters that might be relevant"\n  ]\n}\n\nOnly include fields that are relevant based on the query. Be intelligent about what data would be most helpful.\nIf the query is about recent incidents, set needsIncidents: true and contextType: "incidents".\nIf asking about crowd levels or occupancy, set needsZones: true.\nIf asking about available help or personnel, set needsResponders: true.\nIf asking for statistics or overview, set needsAnalytics: true.\n\nFor suggestedSearches, think of related queries or filters that might provide additional context.\nFor example, if someone asks about "fire incidents", also suggest checking "critical priority incidents" and "Zone A incidents".\n\nReturn ONLY the JSON object, no other text.`;
      const result = await geminiModel.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: null }
      });
      let output = result.response?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (output) {
        output = output.replace(/```json/g, '').replace(/```/g, '');
        const analysis = JSON.parse(output.trim());
        if (analysis && typeof analysis === 'object') {
          analysis.geminiUsed = true;
          return analysis;
        }
      }
      return null;
    } catch (error) {
      console.error('Error in Gemini query analysis:', error);
      return null;
    }
  }
}

// Tool: Fallback Analyze Query
class FallbackAnalyzeQueryTool extends Tool {
  constructor() { super('FallbackAnalyzeQueryTool'); }
  async run({ input }) {
    const lowerQuery = input.toLowerCase();
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
    if (lowerQuery.includes('incident') || lowerQuery.includes('emergency') || lowerQuery.includes('fire') || lowerQuery.includes('medical') || lowerQuery.includes('security') || lowerQuery.includes('panic')) {
      analysis.contextType = 'incidents';
      analysis.needsIncidents = true;
      analysis.intent = 'incident_analysis';
      if (lowerQuery.includes('active')) analysis.specificFilters.status = 'active';
      if (lowerQuery.includes('critical')) analysis.specificFilters.priority = 'critical';
      if (lowerQuery.includes('zone a')) analysis.specificFilters.zone = 'Zone A';
      if (lowerQuery.includes('zone b')) analysis.specificFilters.zone = 'Zone B';
      if (lowerQuery.includes('zone c')) analysis.specificFilters.zone = 'Zone C';
    }
    if (lowerQuery.includes('zone') || lowerQuery.includes('occupancy') || lowerQuery.includes('crowd') || lowerQuery.includes('capacity') || lowerQuery.includes('sensor')) {
      analysis.contextType = 'zones';
      analysis.needsZones = true;
      analysis.intent = 'zone_analysis';
      if (lowerQuery.includes('zone a')) analysis.specificFilters.zone = 'Zone A';
      if (lowerQuery.includes('zone b')) analysis.specificFilters.zone = 'Zone B';
      if (lowerQuery.includes('zone c')) analysis.specificFilters.zone = 'Zone C';
    }
    if (lowerQuery.includes('responder') || lowerQuery.includes('fire brigade') || lowerQuery.includes('medical') || lowerQuery.includes('security') || lowerQuery.includes('available') || lowerQuery.includes('assigned')) {
      analysis.contextType = 'responders';
      analysis.needsResponders = true;
      analysis.intent = 'responder_analysis';
    }
    if (lowerQuery.includes('summary') || lowerQuery.includes('statistics') || lowerQuery.includes('analytics') || lowerQuery.includes('overview') || lowerQuery.includes('status') || lowerQuery.includes('report')) {
      analysis.needsAnalytics = true;
      analysis.intent = 'analytics';
    }
    if (lowerQuery.includes('safety') || lowerQuery.includes('recommend') || lowerQuery.includes('advice') || lowerQuery.includes('suggest')) {
      analysis.intent = 'safety_recommendations';
    }
    return analysis;
  }
}

// Tool: Fetch Context Data
class FetchContextDataTool extends Tool {
  constructor() { super('FetchContextDataTool'); }
  async run({ analysis, db }) {
    const contextData = {};
    try {
      if (analysis.needsIncidents) {
        let incidentsQuery = db.collection('incidents');
        if (analysis.specificFilters.status) {
          incidentsQuery = incidentsQuery.where('status', '==', analysis.specificFilters.status);
        }
        if (analysis.specificFilters.priority) {
          incidentsQuery = incidentsQuery.where('priority', '==', analysis.specificFilters.priority);
        }
        if (analysis.specificFilters.zone) {
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
          contextData.incidents.push({ id: doc.id, ...doc.data() });
        });
      }
      if (analysis.needsZones) {
        let zonesQuery = db.collection('zones');
        if (analysis.specificFilters.zone) {
          zonesQuery = zonesQuery.where('name', '==', analysis.specificFilters.zone);
        }
        const zonesSnapshot = await zonesQuery.get();
        contextData.zones = [];
        zonesSnapshot.forEach(doc => {
          contextData.zones.push({ id: doc.id, ...doc.data() });
        });
      }
      if (analysis.needsResponders) {
        const respondersSnapshot = await db.collection('responders').get();
        contextData.responders = [];
        respondersSnapshot.forEach(doc => {
          contextData.responders.push({ id: doc.id, ...doc.data() });
        });
      }
      if (analysis.needsContacts) {
        const contactsSnapshot = await db.collection('emergency_contacts').get();
        contextData.contacts = [];
        contactsSnapshot.forEach(doc => {
          contextData.contacts.push({ id: doc.id, ...doc.data() });
        });
      }
      if (analysis.needsAnalytics) {
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
    return contextData;
  }
}

// Tool: Generate Response with Gemini
class GenerateResponseWithGeminiTool extends Tool {
  constructor() { super('GenerateResponseWithGeminiTool'); }
  async run({ query, contextData, analysis, geminiModel }) {
    try {
      let incidentSummary = '';
      let zoneSummary = '';
      let responderSummary = '';
      let analyticsSummary = '';
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
      if (contextData.analytics) {
        analyticsSummary += `System Analytics:\n`;
        analyticsSummary += `- Total Incidents: ${contextData.analytics.incidents?.total}\n`;
        analyticsSummary += `- Active Incidents: ${contextData.analytics.incidents?.active}\n`;
        analyticsSummary += `- Critical Incidents: ${contextData.analytics.incidents?.critical}\n`;
        analyticsSummary += `- Available Responders: ${contextData.analytics.responders?.available}\n`;
        analyticsSummary += `- Overcrowded Zones: ${contextData.analytics.zones?.critical}\n`;
      }
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
}

const toolRegistry = new ToolRegistry([
  new AnalyzeQueryWithGeminiTool(),
  new FallbackAnalyzeQueryTool(),
  new FetchContextDataTool(),
  new GenerateResponseWithGeminiTool(),
]);

class ChatMCPAgent extends Agent {
  constructor(toolRegistry, dependencies) {
    super(toolRegistry);
    this.dependencies = dependencies;
  }
  async run(context) {
    const { input } = context;
    const { db, geminiModel } = this.dependencies;
    let analysis = await this.toolRegistry.get('AnalyzeQueryWithGeminiTool').run({ input, geminiModel });
    if (!analysis) {
      analysis = await this.toolRegistry.get('FallbackAnalyzeQueryTool').run({ input });
    }
    const contextData = await this.toolRegistry.get('FetchContextDataTool').run({ analysis, db });
    const response = await this.toolRegistry.get('GenerateResponseWithGeminiTool').run({ query: input, contextData, analysis, geminiModel });
    return {
      output: response,
      context: analysis?.contextType,
      analysisMethod: analysis?.geminiUsed ? 'gemini' : 'fallback',
    };
  }
}

async function runMCPAgent(context) {
  // The dependencies object should be passed in from the main index.js
  const dependencies = require('./index.js').dependencies;
  const agent = new ChatMCPAgent(toolRegistry, dependencies);
  return await agent.run(context);
}

module.exports = { runMCPAgent, ChatMCPAgent }; 