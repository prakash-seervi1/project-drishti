const { onRequest } = require("firebase-functions/v2/https");

// 🌍 Helper: Haversine formula to calculate distance between two geo points
function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = deg => deg * (Math.PI / 180);
  const R = 6371; // Radius of Earth in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 🚨 Enhanced dispatch function with intelligent matching
module.exports = (db, corsHandler) =>
  onRequest(async (req, res) => {
    corsHandler(req, res, async () => {
      if (req.method !== "POST") {
        return res.status(405).json({ 
          success: false,
          error: "Method Not Allowed",
          timestamp: new Date().toISOString()
        });
      }

      const { 
        incidentId, 
        lat, 
        lon, 
        incidentType, 
        priority = 'medium',
        zone,
        description,
        autoDispatch = false 
      } = req.body;

      console.log("Enhanced Dispatch Request:", {
        incidentId,
        incidentType,
        priority,
        zone,
        autoDispatch
      });

      // Validate required parameters
      if (!incidentId || lat === undefined || lon === undefined || !incidentType) {
        return res.status(400).json({ 
          success: false,
          error: "Missing required parameters: incidentId, lat, lon, incidentType",
          timestamp: new Date().toISOString()
        });
      }

      try {
        // 1. Get incident details first
        const incidentDoc = await db.collection("incidents").doc(incidentId).get();
        if (!incidentDoc.exists) {
          return res.status(404).json({ 
            success: false,
            error: "Incident not found",
            timestamp: new Date().toISOString()
          });
        }

        const incident = incidentDoc.data();

        // 2. Find suitable responders with intelligent filtering
        const suitableResponders = await findSuitableResponders(db, {
          incidentType,
          priority,
          zone,
          lat,
          lon
        });

        if (suitableResponders.length === 0) {
          return res.status(200).json({ 
            success: false, 
            message: "No suitable responders available for this incident type.",
            timestamp: new Date().toISOString()
          });
        }

        // 3. Select the best responder using scoring algorithm
        const bestResponder = selectBestResponder(suitableResponders, {
          lat,
          lon,
          priority,
          incidentType
        });

        if (!bestResponder) {
          return res.status(200).json({ 
            success: false, 
            message: "No responder could be optimally matched.",
            timestamp: new Date().toISOString()
          });
        }

        // 4. Calculate ETA and route information
        const routeInfo = calculateRouteInfo(bestResponder, { lat, lon });

        // 5. Create assignment record
        const assignmentData = {
          incidentId,
          responderId: bestResponder.id,
          assignedAt: new Date(),
          status: 'assigned',
          priority,
          incidentType,
          zone,
          distance: routeInfo.distance,
          eta: routeInfo.eta,
          route: routeInfo.route,
          autoDispatch
        };

        // 6. Update responder status
        await updateResponderStatus(db, bestResponder.id, {
          status: 'en_route',
          assignedIncident: incidentId,
          assignedAt: new Date(),
          eta: routeInfo.eta,
          destination: { lat, lon },
          lastUpdated: new Date()
        });

        // 7. Update incident with responder assignment
        await updateIncidentAssignment(db, incidentId, {
          responderId: bestResponder.id,
          responderName: bestResponder.name,
          responderType: bestResponder.type,
          responderContact: bestResponder.contact,
          dispatchTime: new Date(),
          eta: routeInfo.eta,
          distance: routeInfo.distance,
          status: 'assigned'
        });

        // 8. Create assignment history record
        await createAssignmentHistory(db, assignmentData);

        // 9. Send notification if needed
        if (priority === 'critical') {
          await sendCriticalAlert(db, {
            incidentId,
            responderId: bestResponder.id,
            incidentType,
            zone
          });
        }

        console.log("Enhanced dispatch successful:", {
          incidentId,
          responderId: bestResponder.id,
          eta: routeInfo.eta
        });

        return res.status(200).json({
          success: true,
          responder: {
            id: bestResponder.id,
            name: bestResponder.name,
            type: bestResponder.type,
            contact: bestResponder.contact,
            distance: `${routeInfo.distance.toFixed(2)} km`,
            eta: `${routeInfo.eta} minutes`,
            vehicle: bestResponder.vehicle,
            experience: bestResponder.experience
          },
          assignment: {
            incidentId,
            status: 'assigned',
            priority,
            autoDispatch
          },
          route: routeInfo,
          timestamp: new Date().toISOString()
        });

      } catch (err) {
        console.error("Enhanced dispatch error:", err);
        return res.status(500).json({ 
          success: false,
          error: "Internal server error during dispatch",
          details: err.message,
          timestamp: new Date().toISOString()
        });
      }
    });
  });

// Find suitable responders with intelligent filtering
async function findSuitableResponders(db, criteria) {
  const { incidentType, priority, zone, lat, lon } = criteria;
  
  try {
    // Base query for available responders
    let query = db.collection("responders").where("status", "==", "available");

    // Add type filter if specified
    if (incidentType) {
      query = query.where("type", "==", incidentType.toLowerCase());
    }

    const snapshot = await query.get();
    const responders = [];

    snapshot.forEach(doc => {
      const responder = { id: doc.id, ...doc.data() };
      
      // Calculate distance if coordinates are available
      if (responder.lat && responder.lon && lat && lon) {
        responder.distance = haversineDistance(lat, lon, responder.lat, responder.lon);
      } else {
        responder.distance = Infinity;
      }

      // Check if responder is suitable for this incident
      if (isResponderSuitable(responder, criteria)) {
        responders.push(responder);
      }
    });

    return responders.sort((a, b) => a.distance - b.distance);
  } catch (error) {
    console.error("Error finding suitable responders:", error);
    return [];
  }
}

// Check if responder is suitable for the incident
function isResponderSuitable(responder, criteria) {
  const { priority, zone, incidentType } = criteria;

  // Check if responder is available
  if (responder.status !== 'available') return false;

  // Check if responder has required equipment for priority
  if (priority === 'critical' && !responder.equipment?.criticalResponse) {
    return false;
  }

  // Check if responder is assigned to the zone (if specified)
  if (zone && responder.assignedZone && responder.assignedZone !== zone) {
    return false;
  }

  // Check if responder type matches incident type
  if (incidentType && responder.type !== incidentType.toLowerCase()) {
    return false;
  }

  // Check if responder is not on break
  if (responder.onBreak) return false;

  // Check if responder has sufficient experience for priority
  if (priority === 'critical' && (responder.experience || 0) < 2) {
    return false;
  }

  return true;
}

// Select the best responder using scoring algorithm
function selectBestResponder(responders, criteria) {
  if (responders.length === 0) return null;

  const { lat, lon, priority, incidentType } = criteria;

  // Score each responder
  const scoredResponders = responders.map(responder => {
    let score = 0;

    // Distance score (closer is better) - 40% weight
    const maxDistance = Math.max(...responders.map(r => r.distance));
    const distanceScore = (maxDistance - responder.distance) / maxDistance * 40;
    score += distanceScore;

    // Experience score - 25% weight
    const maxExperience = Math.max(...responders.map(r => r.experience || 0));
    const experienceScore = (responder.experience || 0) / maxExperience * 25;
    score += experienceScore;

    // Equipment score - 20% weight
    if (responder.equipment?.criticalResponse) score += 20;
    if (responder.equipment?.communication) score += 10;

    // Availability score - 15% weight
    if (responder.status === 'available') score += 15;

    // Priority bonus
    if (priority === 'critical' && responder.experience >= 3) score += 10;

    return { ...responder, score };
  });

  // Return the highest scored responder
  return scoredResponders.sort((a, b) => b.score - a.score)[0];
}

// Calculate route information
function calculateRouteInfo(responder, destination) {
  const { lat: destLat, lon: destLon } = destination;
  const { lat: respLat, lon: respLon } = responder;

  const distance = haversineDistance(respLat, respLon, destLat, destLon);
  
  // Calculate ETA based on distance and responder type
  let averageSpeed = 40; // km/h default
  if (responder.type === 'fire') averageSpeed = 50;
  else if (responder.type === 'medical') averageSpeed = 60;
  else if (responder.type === 'security') averageSpeed = 30;

  const etaMinutes = Math.round((distance / averageSpeed) * 60);

  return {
    distance,
    eta: etaMinutes,
    route: {
      from: { lat: respLat, lon: respLon },
      to: { lat: destLat, lon: destLon },
      averageSpeed
    }
  };
}

// Update responder status
async function updateResponderStatus(db, responderId, updateData) {
  try {
    await db.collection("responders").doc(responderId).update({
      ...updateData,
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error("Error updating responder status:", error);
    throw error;
  }
}

// Update incident assignment
async function updateIncidentAssignment(db, incidentId, assignmentData) {
  try {
    await db.collection("incidents").doc(incidentId).update({
      ...assignmentData,
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error("Error updating incident assignment:", error);
    throw error;
  }
}

// Create assignment history record
async function createAssignmentHistory(db, assignmentData) {
  try {
    await db.collection("assignments").add({
      ...assignmentData,
      createdAt: new Date()
    });
  } catch (error) {
    console.error("Error creating assignment history:", error);
    // Don't throw error as this is not critical
  }
}

// Send critical alert
async function sendCriticalAlert(db, alertData) {
  try {
    await db.collection("alerts").add({
      ...alertData,
      type: 'critical_dispatch',
      timestamp: new Date(),
      status: 'active'
    });
  } catch (error) {
    console.error("Error sending critical alert:", error);
    // Don't throw error as this is not critical
  }
} 