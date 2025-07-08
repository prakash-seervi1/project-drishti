const functions = require('firebase-functions');

// Get centralized dependencies from index.js
const { db } = require('./index.js').dependencies;

// Utility functions
const utils = {
  setupCORS: (res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  },

  handleOptions: (req, res) => {
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return true;
    }
    return false;
  },

  validateResponder: (data) => {
    const errors = [];
    
    if (!data.name) errors.push('Responder name is required');
    if (!data.type) errors.push('Responder type is required');
    if (!data.vehicle) errors.push('Vehicle information is required');
    
    // Validate responder type
    const validTypes = ['fire', 'medical', 'security', 'police', 'emergency'];
    if (data.type && !validTypes.includes(data.type)) {
      errors.push('Responder type must be one of: fire, medical, security, police, emergency');
    }
    
    // Validate status
    const validStatuses = ['available', 'en_route', 'on_scene', 'returning', 'off_duty', 'maintenance'];
    if (data.status && !validStatuses.includes(data.status)) {
      errors.push('Status must be one of: available, en_route, on_scene, returning, off_duty, maintenance');
    }
    
    // Validate experience
    if (data.experience && (data.experience < 0 || data.experience > 50)) {
      errors.push('Experience must be between 0 and 50 years');
    }
    
    return errors;
  },

  logExecution: (functionName, params = {}) => {
    console.log(`[${new Date().toISOString()}] ${functionName} executed with params:`, params);
  },

  errorResponse: (res, statusCode, message, details = null) => {
    const response = {
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    };
    
    if (details) response.details = details;
    
    res.status(statusCode).json(response);
  },

  successResponse: (res, data = null, message = 'Success', statusCode = 200) => {
    const response = {
      success: true,
      message,
      timestamp: new Date().toISOString()
    };
    
    if (data) response.data = data;
    
    res.status(statusCode).json(response);
  },

  parseQueryParams: (req) => {
    const {
      status,
      type,
      zone,
      limit = '50',
      offset = '0',
      sortBy = 'name',
      sortOrder = 'asc',
      availableOnly = 'false',
      assignedOnly = 'false'
    } = req.query;

    return {
      status,
      type,
      zone,
      limit: parseInt(limit),
      offset: parseInt(offset),
      sortBy,
      sortOrder,
      availableOnly: availableOnly === 'true',
      assignedOnly: assignedOnly === 'true'
    };
  },

  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },

  calculateETA: (distance, averageSpeed = 40) => {
    // distance in km, averageSpeed in km/h
    const timeInHours = distance / averageSpeed;
    return Math.round(timeInHours * 60); // Return in minutes
  }
};

// Get all responders with advanced filtering and analytics
exports.getResponders = functions.https.onRequest(async (req, res) => {
  utils.setupCORS(res);
  if (utils.handleOptions(req, res)) return;

  try {
    utils.logExecution('getResponders', req.query);
    
    const params = utils.parseQueryParams(req);
    let query = db.collection('responders');

    // Apply filters
    if (params.status) query = query.where('status', '==', params.status);
    if (params.type) query = query.where('type', '==', params.type);

    // Apply sorting
    query = query.orderBy(params.sortBy, params.sortOrder);

    // Apply pagination
    if (params.offset > 0) {
      const offsetSnapshot = await query.limit(params.offset).get();
      const lastDoc = offsetSnapshot.docs[offsetSnapshot.docs.length - 1];
      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }
    }
    
    query = query.limit(params.limit);

    const snapshot = await query.get();
    const responders = [];

    snapshot.forEach(doc => {
      responders.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Apply additional filters
    let filteredResponders = responders;
    
    if (params.availableOnly) {
      filteredResponders = filteredResponders.filter(r => r.status === 'available');
    }
    
    if (params.assignedOnly) {
      filteredResponders = filteredResponders.filter(r => r.assignedIncident);
    }

    // Get total count
    const totalSnapshot = await db.collection('responders').get();
    const totalCount = totalSnapshot.size;

    // Calculate summary analytics
    const analytics = {
      total: responders.length,
      byStatus: {},
      byType: {},
      available: 0,
      assigned: 0,
      averageExperience: 0,
      totalExperience: 0
    };

    responders.forEach(responder => {
      analytics.byStatus[responder.status] = (analytics.byStatus[responder.status] || 0) + 1;
      analytics.byType[responder.type] = (analytics.byType[responder.type] || 0) + 1;
      
      if (responder.status === 'available') {
        analytics.available++;
      }
      
      if (responder.assignedIncident) {
        analytics.assigned++;
      }
      
      if (responder.experience) {
        analytics.totalExperience += responder.experience;
      }
    });

    if (responders.length > 0) {
      analytics.averageExperience = Math.round(analytics.totalExperience / responders.length * 10) / 10;
    }

    utils.successResponse(res, {
      responders: filteredResponders,
      pagination: {
        limit: params.limit,
        offset: params.offset,
        total: totalCount,
        hasMore: params.offset + params.limit < totalCount
      },
      analytics,
      filters: params
    });

  } catch (error) {
    console.error('Error fetching responders:', error);
    utils.errorResponse(res, 500, 'Failed to fetch responders', error.message);
  }
});

// Get single responder by ID with detailed information
exports.getResponderById = functions.https.onRequest(async (req, res) => {
  utils.setupCORS(res);
  if (utils.handleOptions(req, res)) return;

  try {
    const { responderId } = req.params;
    utils.logExecution('getResponderById', { responderId });

    const doc = await db.collection('responders').doc(responderId).get();

    if (!doc.exists) {
      return utils.errorResponse(res, 404, 'Responder not found');
    }

    const responder = {
      id: doc.id,
      ...doc.data()
    };

    // Get assignment history
    const [assignmentsSnapshot, incidentsSnapshot] = await Promise.all([
      db.collection('responders').doc(responderId).collection('assignments')
        .orderBy('assignedAt', 'desc').limit(20).get(),
      responder.assignedIncident ? 
        db.collection('incidents').doc(responder.assignedIncident).get() : 
        Promise.resolve(null)
    ]);

    const assignments = [];
    assignmentsSnapshot.forEach(doc => assignments.push({ id: doc.id, ...doc.data() }));

    // Calculate performance metrics
    const performance = {
      totalAssignments: assignments.length,
      completedAssignments: assignments.filter(a => a.status === 'completed').length,
      averageResponseTime: 0,
      totalResponseTime: 0,
      successRate: 0
    };

    const completedAssignments = assignments.filter(a => a.status === 'completed');
    if (completedAssignments.length > 0) {
      performance.totalResponseTime = completedAssignments.reduce((sum, a) => {
        if (a.responseTime) return sum + a.responseTime;
        return sum;
      }, 0);
      performance.averageResponseTime = Math.round(performance.totalResponseTime / completedAssignments.length);
      performance.successRate = Math.round((completedAssignments.length / assignments.length) * 100);
    }

    utils.successResponse(res, {
      ...responder,
      assignments: assignments.slice(0, 10), // Return only recent assignments
      currentIncident: incidentsSnapshot?.exists ? { id: incidentsSnapshot.id, ...incidentsSnapshot.data() } : null,
      performance
    });

  } catch (error) {
    console.error('Error fetching responder:', error);
    utils.errorResponse(res, 500, 'Failed to fetch responder', error.message);
  }
});

// Update responder with validation and status tracking
exports.updateResponder = functions.https.onRequest(async (req, res) => {
  utils.setupCORS(res);
  if (utils.handleOptions(req, res)) return;

  try {
    const { responderId } = req.params;
    utils.logExecution('updateResponder', { responderId, body: req.body });

    const responderRef = db.collection('responders').doc(responderId);
    const responderDoc = await responderRef.get();

    if (!responderDoc.exists) {
      return utils.errorResponse(res, 404, 'Responder not found');
    }

    const oldData = responderDoc.data();
    const updateData = {
      ...req.body,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    };

    // Validate update data
    const validationErrors = utils.validateResponder({ ...oldData, ...updateData });
    if (validationErrors.length > 0) {
      return utils.errorResponse(res, 400, 'Validation failed', validationErrors);
    }

    // Track status changes
    if (updateData.status && updateData.status !== oldData.status) {
      updateData.statusHistory = admin.firestore.FieldValue.arrayUnion({
        from: oldData.status,
        to: updateData.status,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        reason: req.body.statusChangeReason || 'manual'
      });

      // Update assignment if status changes to available
      if (updateData.status === 'available' && oldData.assignedIncident) {
        updateData.assignedIncident = null;
        updateData.assignedAt = null;
        updateData.eta = null;
      }
    }

    // Track position updates
    if (updateData.position && updateData.position !== oldData.position) {
      updateData.positionHistory = admin.firestore.FieldValue.arrayUnion({
        position: updateData.position,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    await responderRef.update(updateData);

    // Update responder analytics
    await updateResponderAnalytics();

    utils.successResponse(res, {
      ...updateData,
      id: responderId
    }, 'Responder updated successfully');

  } catch (error) {
    console.error('Error updating responder:', error);
    utils.errorResponse(res, 500, 'Failed to update responder', error.message);
  }
});

// Assign responder to incident with intelligent matching
exports.assignResponderToIncident = functions.https.onRequest(async (req, res) => {
  utils.setupCORS(res);
  if (utils.handleOptions(req, res)) return;

  try {
    const { responderId, incidentId } = req.body;
    utils.logExecution('assignResponderToIncident', { responderId, incidentId });

    if (!responderId || !incidentId) {
      return utils.errorResponse(res, 400, 'Responder ID and Incident ID are required');
    }

    // Get responder and incident data
    const [responderDoc, incidentDoc] = await Promise.all([
      db.collection('responders').doc(responderId).get(),
      db.collection('incidents').doc(incidentId).get()
    ]);

    if (!responderDoc.exists) {
      return utils.errorResponse(res, 404, 'Responder not found');
    }

    if (!incidentDoc.exists) {
      return utils.errorResponse(res, 404, 'Incident not found');
    }

    const responder = responderDoc.data();
    const incident = incidentDoc.data();

    // Check if responder is available
    if (responder.status !== 'available') {
      return utils.errorResponse(res, 400, 'Responder is not available for assignment');
    }

    // Check if responder type matches incident type
    if (responder.type !== incident.type && !isCompatibleType(responder.type, incident.type)) {
      return utils.errorResponse(res, 400, 'Responder type is not compatible with incident type');
    }

    // Calculate ETA if positions are available
    let eta = null;
    if (responder.position && incident.location) {
      const distance = utils.calculateDistance(
        responder.position.latitude,
        responder.position.longitude,
        incident.location.latitude,
        incident.location.longitude
      );
      eta = utils.calculateETA(distance);
    }

    const batch = db.batch();

    // Update responder
    const responderRef = db.collection('responders').doc(responderId);
    batch.update(responderRef, {
      status: 'en_route',
      assignedIncident: incidentId,
      assignedAt: admin.firestore.FieldValue.serverTimestamp(),
      eta: eta,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });

    // Update incident
    const incidentRef = db.collection('incidents').doc(incidentId);
    batch.update(incidentRef, {
      status: 'assigned',
      assignedResponder: {
        id: responderId,
        name: responder.name,
        type: responder.type,
        eta: eta,
        assignedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });

    // Create assignment record
    const assignmentRef = db.collection('responders').doc(responderId).collection('assignments').doc();
    batch.set(assignmentRef, {
      incidentId: incidentId,
      incidentType: incident.type,
      incidentZone: incident.zone,
      assignedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'assigned',
      eta: eta
    });

    await batch.commit();

    utils.successResponse(res, {
      responderId,
      incidentId,
      eta,
      assignmentId: assignmentRef.id
    }, 'Responder assigned successfully');

  } catch (error) {
    console.error('Error assigning responder:', error);
    utils.errorResponse(res, 500, 'Failed to assign responder', error.message);
  }
});

// Unassign responder from incident
exports.unassignResponder = functions.https.onRequest(async (req, res) => {
  utils.setupCORS(res);
  if (utils.handleOptions(req, res)) return;

  try {
    const { responderId, incidentId, reason = 'manual' } = req.body;
    utils.logExecution('unassignResponder', { responderId, incidentId, reason });

    if (!responderId || !incidentId) {
      return utils.errorResponse(res, 400, 'Responder ID and Incident ID are required');
    }

    const batch = db.batch();

    // Update responder
    const responderRef = db.collection('responders').doc(responderId);
    batch.update(responderRef, {
      status: 'available',
      assignedIncident: null,
      assignedAt: null,
      eta: null,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });

    // Update incident
    const incidentRef = db.collection('incidents').doc(incidentId);
    batch.update(incidentRef, {
      status: 'reported',
      assignedResponder: null,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });

    // Update assignment record
    const assignmentsSnapshot = await db.collection('responders').doc(responderId)
      .collection('assignments')
      .where('incidentId', '==', incidentId)
      .where('status', '==', 'assigned')
      .limit(1)
      .get();

    if (!assignmentsSnapshot.empty) {
      const assignmentRef = assignmentsSnapshot.docs[0].ref;
      batch.update(assignmentRef, {
        status: 'unassigned',
        unassignedAt: admin.firestore.FieldValue.serverTimestamp(),
        reason: reason
      });
    }

    await batch.commit();

    utils.successResponse(res, null, 'Responder unassigned successfully');

  } catch (error) {
    console.error('Error unassigning responder:', error);
    utils.errorResponse(res, 500, 'Failed to unassign responder', error.message);
  }
});

// Get available responders with intelligent filtering
exports.getAvailableResponders = functions.https.onRequest(async (req, res) => {
  utils.setupCORS(res);
  if (utils.handleOptions(req, res)) return;

  try {
    const { type, zone, limit = '10', sortBy = 'distance' } = req.query;
    utils.logExecution('getAvailableResponders', { type, zone, limit, sortBy });

    let query = db.collection('responders').where('status', '==', 'available');

    if (type) query = query.where('type', '==', type);

    const snapshot = await query.get();
    const responders = [];

    snapshot.forEach(doc => {
      responders.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Filter by zone if specified
    let filteredResponders = responders;
    if (zone) {
      filteredResponders = responders.filter(r => r.assignedZone === zone || !r.assignedZone);
    }

    // Sort by distance if zone coordinates are provided
    if (sortBy === 'distance' && zone) {
      // This would require zone coordinates - for now, sort by experience
      filteredResponders.sort((a, b) => (b.experience || 0) - (a.experience || 0));
    } else {
      // Sort by experience by default
      filteredResponders.sort((a, b) => (b.experience || 0) - (a.experience || 0));
    }

    // Limit results
    filteredResponders = filteredResponders.slice(0, parseInt(limit));

    utils.successResponse(res, {
      responders: filteredResponders,
      count: filteredResponders.length,
      filters: { type, zone, sortBy }
    });

  } catch (error) {
    console.error('Error fetching available responders:', error);
    utils.errorResponse(res, 500, 'Failed to fetch available responders', error.message);
  }
});

// Update responder position with ETA calculation
exports.updateResponderPosition = functions.https.onRequest(async (req, res) => {
  utils.setupCORS(res);
  if (utils.handleOptions(req, res)) return;

  try {
    const { responderId } = req.params;
    const { latitude, longitude, heading, speed } = req.body;
    utils.logExecution('updateResponderPosition', { responderId, latitude, longitude });

    if (!latitude || !longitude) {
      return utils.errorResponse(res, 400, 'Latitude and longitude are required');
    }

    const responderRef = db.collection('responders').doc(responderId);
    const responderDoc = await responderRef.get();

    if (!responderDoc.exists) {
      return utils.errorResponse(res, 404, 'Responder not found');
    }

    const responder = responderDoc.data();
    const position = { latitude, longitude, heading, speed, timestamp: new Date() };

    const updateData = {
      position,
      lastPositionUpdate: admin.firestore.FieldValue.serverTimestamp()
    };

    // Calculate new ETA if assigned to incident
    if (responder.assignedIncident) {
      const incidentDoc = await db.collection('incidents').doc(responder.assignedIncident).get();
      if (incidentDoc.exists) {
        const incident = incidentDoc.data();
        if (incident.location) {
          const distance = utils.calculateDistance(
            latitude,
            longitude,
            incident.location.latitude,
            incident.location.longitude
          );
          const eta = utils.calculateETA(distance, speed || 40);
          updateData.eta = eta;

          // Update incident ETA
          await db.collection('incidents').doc(responder.assignedIncident).update({
            'assignedResponder.eta': eta,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      }
    }

    await responderRef.update(updateData);

    utils.successResponse(res, {
      position,
      eta: updateData.eta
    }, 'Position updated successfully');

  } catch (error) {
    console.error('Error updating responder position:', error);
    utils.errorResponse(res, 500, 'Failed to update responder position', error.message);
  }
});

// Get responder analytics with performance metrics
exports.getResponderAnalytics = functions.https.onRequest(async (req, res) => {
  utils.setupCORS(res);
  if (utils.handleOptions(req, res)) return;

  try {
    const { period = '30d' } = req.query;
    utils.logExecution('getResponderAnalytics', { period });

    // Calculate time range
    const now = new Date();
    let startTime;
    switch (period) {
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startTime = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const snapshot = await db.collection('responders').get();
    const responders = [];

    snapshot.forEach(doc => {
      responders.push({ id: doc.id, ...doc.data() });
    });

    // Calculate analytics
    const analytics = {
      period,
      total: responders.length,
      byStatus: {},
      byType: {},
      performance: {
        averageResponseTime: 0,
        averageExperience: 0,
        totalAssignments: 0,
        completedAssignments: 0
      },
      availability: {
        available: 0,
        assigned: 0,
        offDuty: 0,
        maintenance: 0
      }
    };

    let totalResponseTime = 0;
    let totalExperience = 0;
    let totalAssignments = 0;
    let completedAssignments = 0;

    responders.forEach(responder => {
      analytics.byStatus[responder.status] = (analytics.byStatus[responder.status] || 0) + 1;
      analytics.byType[responder.type] = (analytics.byType[responder.type] || 0) + 1;

      if (responder.status === 'available') analytics.availability.available++;
      else if (responder.status === 'en_route' || responder.status === 'on_scene') analytics.availability.assigned++;
      else if (responder.status === 'off_duty') analytics.availability.offDuty++;
      else if (responder.status === 'maintenance') analytics.availability.maintenance++;

      if (responder.experience) totalExperience += responder.experience;
      if (responder.assignedIncident) totalAssignments++;
    });

    if (responders.length > 0) {
      analytics.performance.averageExperience = Math.round(totalExperience / responders.length * 10) / 10;
    }

    utils.successResponse(res, analytics);

  } catch (error) {
    console.error('Error fetching responder analytics:', error);
    utils.errorResponse(res, 500, 'Failed to fetch responder analytics', error.message);
  }
});

// Helper functions
function isCompatibleType(responderType, incidentType) {
  const compatibility = {
    fire: ['fire', 'emergency'],
    medical: ['medical', 'emergency'],
    security: ['security', 'emergency'],
    police: ['security', 'emergency'],
    emergency: ['fire', 'medical', 'security', 'emergency']
  };

  return compatibility[responderType]?.includes(incidentType) || false;
}

async function updateResponderAnalytics() {
  try {
    const analyticsRef = db.collection('analytics').doc('responders');
    const snapshot = await db.collection('responders').get();
    const responders = [];
    
    snapshot.forEach(doc => {
      responders.push({ id: doc.id, ...doc.data() });
    });

    const analytics = {
      totalResponders: responders.length,
      availableResponders: responders.filter(r => r.status === 'available').length,
      assignedResponders: responders.filter(r => r.assignedIncident).length,
      byType: responders.reduce((acc, r) => {
        acc[r.type] = (acc[r.type] || 0) + 1;
        return acc;
      }, {}),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    };

    await analyticsRef.set(analytics, { merge: true });
  } catch (error) {
    console.error('Error updating responder analytics:', error);
  }
} 

// Get all assignments for a responder
exports.getAssignmentsForResponder = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  try {
    const responderId = req.params['0'];
    const snapshot = await db.collection('responderAssignments').where('responderId', '==', responderId).get();
    const assignments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ success: true, assignments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get assignment by ID
exports.getAssignmentById = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  try {
    const assignmentId = req.params['0'];
    const doc = await db.collection('responderAssignments').doc(assignmentId).get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }
    res.status(200).json({ success: true, assignment: { id: doc.id, ...doc.data() } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new assignment
exports.createAssignment = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  try {
    const data = req.body;
    if (!data.incidentId || !data.responderId) {
      return res.status(400).json({ success: false, error: 'incidentId and responderId are required' });
    }
    data.assignedAt = new Date();
    const docRef = await db.collection('responderAssignments').add(data);
    res.status(201).json({ success: true, id: docRef.id, ...data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update assignment (status/location)
exports.updateAssignment = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  try {
    const assignmentId = req.params['0'];
    const data = req.body;
    data.lastUpdated = new Date();
    await db.collection('responderAssignments').doc(assignmentId).update(data);
    res.status(200).json({ success: true, id: assignmentId, ...data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}); 