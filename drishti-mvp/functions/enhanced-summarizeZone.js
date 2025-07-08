const functions = require("firebase-functions");

module.exports = (db, vertexAI, corsHandler) =>
  functions.https.onRequest(async (req, res) => {
    corsHandler(req, res, async () => {
      const zone = req.query.zone || "Zone A";
      const period = req.query.period || "24h"; // 1h, 6h, 24h, 7d
      const includeAnalytics = req.query.analytics === "true";
      
      console.log(`Enhanced Zone Summary Request: ${zone}, Period: ${period}, Analytics: ${includeAnalytics}`);

      try {
        // Calculate time range
        const timeRange = calculateTimeRange(period);
        
        // Fetch comprehensive zone data
        const zoneData = await fetchZoneData(db, zone, timeRange);
        
        if (!zoneData.zoneInfo) {
          return res.status(404).json({
            success: false,
            error: `Zone ${zone} not found`,
            timestamp: new Date().toISOString()
          });
        }

        // Generate AI summary
        const aiSummary = await generateZoneSummary(zoneData, vertexAI);
        
        // Prepare response
        const response = {
          success: true,
          zone: zone,
          period: period,
          summary: aiSummary,
          timestamp: new Date().toISOString()
        };

        // Include analytics if requested
        if (includeAnalytics) {
          response.analytics = zoneData.analytics;
        }

        res.status(200).json(response);

      } catch (error) {
        console.error("Enhanced zone summary error:", error);
        res.status(500).json({
          success: false,
          error: "Internal Server Error",
          details: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });
  });

// Calculate time range based on period
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

// Fetch comprehensive zone data
async function fetchZoneData(db, zoneName, timeRange) {
  try {
    // Get zone information
    const zoneSnapshot = await db.collection("zones")
      .where("name", "==", zoneName)
      .limit(1)
      .get();

    if (zoneSnapshot.empty) {
      return { zoneInfo: null };
    }

    const zoneInfo = { id: zoneSnapshot.docs[0].id, ...zoneSnapshot.docs[0].data() };

    // Get incidents for the zone
    const incidentsSnapshot = await db.collection("incidents")
      .where("zone", "==", zoneName)
      .where("timestamp", ">=", timeRange.startTime)
      .orderBy("timestamp", "desc")
      .get();

    const incidents = [];
    incidentsSnapshot.forEach(doc => {
      incidents.push({ id: doc.id, ...doc.data() });
    });

    // Get sensor data for the zone
    const sensorsSnapshot = await db.collection("zones")
      .doc(zoneInfo.id)
      .collection("sensors")
      .where("timestamp", ">=", timeRange.startTime)
      .orderBy("timestamp", "desc")
      .limit(100)
      .get();

    const sensors = [];
    sensorsSnapshot.forEach(doc => {
      sensors.push({ id: doc.id, ...doc.data() });
    });

    // Get responder assignments for incidents in this zone
    const responderAssignments = [];
    for (const incident of incidents) {
      if (incident.responderId) {
        const responderDoc = await db.collection("responders").doc(incident.responderId).get();
        if (responderDoc.exists) {
          responderAssignments.push({
            incidentId: incident.id,
            responder: { id: responderDoc.id, ...responderDoc.data() }
          });
        }
      }
    }

    // Calculate analytics
    const analytics = calculateZoneAnalytics(zoneInfo, incidents, sensors, timeRange);

    return {
      zoneInfo,
      incidents,
      sensors,
      responderAssignments,
      analytics,
      timeRange
    };

  } catch (error) {
    console.error("Error fetching zone data:", error);
    throw error;
  }
}

// Calculate comprehensive zone analytics
function calculateZoneAnalytics(zoneInfo, incidents, sensors, timeRange) {
  const analytics = {
    period: timeRange,
    occupancy: {
      current: zoneInfo.capacity?.currentOccupancy || 0,
      max: zoneInfo.capacity?.maxOccupancy || 1000,
      density: zoneInfo.capacity?.crowdDensity || 0,
      trend: calculateOccupancyTrend(sensors)
    },
    incidents: {
      total: incidents.length,
      byType: {},
      byStatus: {},
      byPriority: {},
      critical: 0,
      active: 0,
      resolved: 0
    },
    sensors: {
      totalReadings: sensors.length,
      averageTemperature: 0,
      averageHumidity: 0,
      averageAirQuality: 0,
      alerts: {
        critical: 0,
        warning: 0,
        normal: 0
      }
    },
    safety: {
      riskLevel: calculateRiskLevel(zoneInfo, incidents, sensors),
      recommendations: generateSafetyRecommendations(zoneInfo, incidents, sensors)
    }
  };

  // Calculate incident statistics
  incidents.forEach(incident => {
    analytics.incidents.byType[incident.type] = (analytics.incidents.byType[incident.type] || 0) + 1;
    analytics.incidents.byStatus[incident.status] = (analytics.incidents.byStatus[incident.status] || 0) + 1;
    analytics.incidents.byPriority[incident.priority] = (analytics.incidents.byPriority[incident.priority] || 0) + 1;
    
    if (incident.priority === 'critical') analytics.incidents.critical++;
    if (['active', 'investigating'].includes(incident.status)) analytics.incidents.active++;
    if (incident.status === 'resolved') analytics.incidents.resolved++;
  });

  // Calculate sensor statistics
  if (sensors.length > 0) {
    const tempSensors = sensors.filter(s => s.temperature !== undefined);
    const humiditySensors = sensors.filter(s => s.humidity !== undefined);
    const airQualitySensors = sensors.filter(s => s.airQuality !== undefined);

    if (tempSensors.length > 0) {
      analytics.sensors.averageTemperature = tempSensors.reduce((sum, s) => sum + s.temperature, 0) / tempSensors.length;
    }
    if (humiditySensors.length > 0) {
      analytics.sensors.averageHumidity = humiditySensors.reduce((sum, s) => sum + s.humidity, 0) / humiditySensors.length;
    }
    if (airQualitySensors.length > 0) {
      analytics.sensors.averageAirQuality = airQualitySensors.reduce((sum, s) => sum + s.airQuality, 0) / airQualitySensors.length;
    }

    // Count alerts
    sensors.forEach(sensor => {
      if (sensor.alertLevel === 'critical') analytics.sensors.alerts.critical++;
      else if (sensor.alertLevel === 'warning') analytics.sensors.alerts.warning++;
      else analytics.sensors.alerts.normal++;
    });
  }

  return analytics;
}

// Calculate occupancy trend
function calculateOccupancyTrend(sensors) {
  const occupancySensors = sensors.filter(s => s.type === 'occupancy' && s.count !== undefined);
  if (occupancySensors.length < 2) return 'stable';
  
  const recent = occupancySensors.slice(0, 5);
  const older = occupancySensors.slice(5, 10);
  
  if (recent.length === 0 || older.length === 0) return 'stable';
  
  const recentAvg = recent.reduce((sum, s) => sum + s.count, 0) / recent.length;
  const olderAvg = older.reduce((sum, s) => sum + s.count, 0) / older.length;
  
  const change = ((recentAvg - olderAvg) / olderAvg) * 100;
  
  if (change > 10) return 'increasing';
  if (change < -10) return 'decreasing';
  return 'stable';
}

// Calculate risk level
function calculateRiskLevel(zoneInfo, incidents, sensors) {
  let riskScore = 0;
  
  // Base risk from zone status
  if (zoneInfo.status === 'critical') riskScore += 30;
  else if (zoneInfo.status === 'warning') riskScore += 15;
  
  // Risk from occupancy
  if (zoneInfo.capacity?.crowdDensity > 90) riskScore += 25;
  else if (zoneInfo.capacity?.crowdDensity > 75) riskScore += 15;
  
  // Risk from recent incidents
  const recentIncidents = incidents.filter(i => 
    new Date(i.timestamp?.toDate?.() || i.timestamp) > new Date(Date.now() - 60 * 60 * 1000)
  );
  riskScore += recentIncidents.length * 10;
  
  // Risk from critical incidents
  const criticalIncidents = incidents.filter(i => i.priority === 'critical');
  riskScore += criticalIncidents.length * 20;
  
  // Risk from sensor alerts
  const criticalAlerts = sensors.filter(s => s.alertLevel === 'critical').length;
  riskScore += criticalAlerts * 5;
  
  if (riskScore >= 60) return 'high';
  if (riskScore >= 30) return 'medium';
  return 'low';
}

// Generate safety recommendations
function generateSafetyRecommendations(zoneInfo, incidents, sensors) {
  const recommendations = [];
  
  // Occupancy-based recommendations
  if (zoneInfo.capacity?.crowdDensity > 90) {
    recommendations.push("Immediate crowd control measures required");
    recommendations.push("Consider temporary zone closure");
  } else if (zoneInfo.capacity?.crowdDensity > 75) {
    recommendations.push("Monitor crowd density closely");
    recommendations.push("Prepare crowd control resources");
  }
  
  // Incident-based recommendations
  const recentIncidents = incidents.filter(i => 
    new Date(i.timestamp?.toDate?.() || i.timestamp) > new Date(Date.now() - 2 * 60 * 60 * 1000)
  );
  if (recentIncidents.length > 3) {
    recommendations.push("Increase security presence");
    recommendations.push("Review incident patterns");
  }
  
  // Sensor-based recommendations
  const criticalSensors = sensors.filter(s => s.alertLevel === 'critical');
  if (criticalSensors.length > 0) {
    recommendations.push("Address critical sensor alerts immediately");
  }
  
  if (recommendations.length === 0) {
    recommendations.push("Zone operating normally - continue monitoring");
  }
  
  return recommendations;
}

// Generate AI summary using Gemini
async function generateZoneSummary(zoneData, vertexAI) {
  try {
    const { zoneInfo, incidents, sensors, analytics, timeRange } = zoneData;
    
    const prompt = `Generate a comprehensive summary for ${zoneInfo.name} covering the last ${timeRange.period || '24 hours'}.

Zone Information:
- Status: ${zoneInfo.status}
- Current Occupancy: ${analytics.occupancy.current}/${analytics.occupancy.max} (${analytics.occupancy.density}% density)
- Occupancy Trend: ${analytics.occupancy.trend}

Incident Summary (${incidents.length} total):
${incidents.slice(0, 5).map(incident => 
  `- ${incident.type} (${incident.priority} priority): ${incident.status}`
).join('\n')}

Sensor Data (${sensors.length} readings):
- Average Temperature: ${analytics.sensors.averageTemperature.toFixed(1)}°C
- Average Humidity: ${analytics.sensors.averageHumidity.toFixed(1)}%
- Average Air Quality: ${analytics.sensors.averageAirQuality.toFixed(0)}
- Critical Alerts: ${analytics.sensors.alerts.critical}

Safety Assessment:
- Risk Level: ${analytics.safety.riskLevel}
- Key Recommendations: ${analytics.safety.recommendations.join(', ')}

Provide a clear, professional summary that includes:
1. Overall zone status and safety assessment
2. Key incidents and their impact
3. Environmental conditions
4. Immediate actions needed (if any)
5. Recommendations for the next period

Keep the summary concise but informative.`;

    const model = vertexAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 800
      }
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    return result.response?.candidates?.[0]?.content?.parts?.[0]?.text || 
           "Unable to generate summary at this time.";

  } catch (error) {
    console.error("Error generating AI summary:", error);
    return "Summary generation failed. Please try again.";
  }
} 