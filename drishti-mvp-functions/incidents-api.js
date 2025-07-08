const functions = require('firebase-functions');

// Get centralized dependencies from index.js
const { db } = require('./index.js').dependencies;

// Utility functions
const utils = {
  // CORS setup
  setupCORS: (res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  },

  // Handle OPTIONS requests
  handleOptions: (req, res) => {
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return true;
    }
    return false;
  },

  // Validate incident data
  validateIncident: (data) => {
    const errors = [];
    
    if (!data.type) errors.push('Incident type is required');
    if (!data.zone) errors.push('Zone is required');
    if (!data.description) errors.push('Description is required');
    if (!data.priority) errors.push('Priority is required');
    
    // Validate priority values
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    if (data.priority && !validPriorities.includes(data.priority)) {
      errors.push('Priority must be one of: low, medium, high, critical');
    }
    
    // Validate status values
    const validStatuses = ['reported', 'investigating', 'active', 'resolved', 'closed'];
    if (data.status && !validStatuses.includes(data.status)) {
      errors.push('Status must be one of: reported, investigating, active, resolved, closed');
    }
    
    return errors;
  },

  // Log function execution
  logExecution: (functionName, params = {}) => {
    console.log(`[${new Date().toISOString()}] ${functionName} executed with params:`, params);
  },

  // Create error response
  errorResponse: (res, statusCode, message, details = null) => {
    const response = {
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    };
    
    if (details) response.details = details;
    
    res.status(statusCode).json(response);
  },

  // Create success response
  successResponse: (res, data = null, message = 'Success', statusCode = 200) => {
    const response = {
      success: true,
      message,
      timestamp: new Date().toISOString()
    };
    
    if (data) response.data = data;
    
    res.status(statusCode).json(response);
  },

  // Parse query parameters with defaults
  parseQueryParams: (req) => {
    const {
      status,
      zone,
      type,
      priority,
      severity,
      limit = '50',
      offset = '0',
      sortBy = 'timestamp',
      sortOrder = 'desc',
      dateFrom,
      dateTo,
      assignedResponder
    } = req.query;

    return {
      status,
      zone,
      type,
      priority,
      severity,
      limit: parseInt(limit),
      offset: parseInt(offset),
      sortBy,
      sortOrder,
      dateFrom: dateFrom ? new Date(dateFrom) : null,
      dateTo: dateTo ? new Date(dateTo) : null,
      assignedResponder
    };
  }
};

// Get all incidents with advanced filtering and pagination
exports.getIncidents = functions.https.onRequest(async (req, res) => {
  utils.setupCORS(res);
  if (utils.handleOptions(req, res)) return;

  try {
    utils.logExecution('getIncidents', req.query);
    
    const params = utils.parseQueryParams(req);
    let query = db.collection('incidents');

    // Apply filters
    if (params.status) query = query.where('status', '==', params.status);
    if (params.zone) query = query.where('zone', '==', params.zone);
    if (params.type) query = query.where('type', '==', params.type);
    if (params.priority) query = query.where('priority', '==', params.priority);
    if (params.severity) query = query.where('severity', '==', parseInt(params.severity));
    if (params.assignedResponder) query = query.where('assignedResponder.id', '==', params.assignedResponder);

    // Apply date range filter
    if (params.dateFrom || params.dateTo) {
      if (params.dateFrom && params.dateTo) {
        query = query.where('timestamp', '>=', params.dateFrom).where('timestamp', '<=', params.dateTo);
      } else if (params.dateFrom) {
        query = query.where('timestamp', '>=', params.dateFrom);
      } else if (params.dateTo) {
        query = query.where('timestamp', '<=', params.dateTo);
      }
    }

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
    const incidents = [];

    snapshot.forEach(doc => {
      incidents.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Get total count for pagination
    const totalSnapshot = await db.collection('incidents').get();
    const totalCount = totalSnapshot.size;

    utils.successResponse(res, {
      incidents,
      pagination: {
        limit: params.limit,
        offset: params.offset,
        total: totalCount,
        hasMore: params.offset + params.limit < totalCount
      },
      filters: params
    });

  } catch (error) {
    console.error('Error fetching incidents:', error);
    utils.errorResponse(res, 500, 'Failed to fetch incidents', error.message);
  }
});

// Get single incident by ID with related data (updated for req.params['0'] and new schema)
exports.getIncidentById = functions.https.onRequest(async (req, res) => {
  utils.setupCORS(res);
  if (utils.handleOptions(req, res)) return;

  try {
    const incidentId = req.params['0'];
    utils.logExecution('getIncidentById', { incidentId });

    const doc = await db.collection('incidents').doc(incidentId).get();
    if (!doc.exists) {
      return utils.errorResponse(res, 404, 'Incident not found');
    }
    const incident = { id: doc.id, ...doc.data() };

    // Fetch assigned responder details if needed
    let assignedResponder = null;
    if (incident.assignedResponderId) {
      const responderDoc = await db.collection('responders').doc(incident.assignedResponderId).get();
      if (responderDoc.exists) {
        assignedResponder = { id: responderDoc.id, ...responderDoc.data() };
      }
    }

    // Fetch assignment transaction if needed
    let assignmentTransaction = null;
    if (incident.assignmentTransactionId) {
      const txnDoc = await db.collection('responderAssignments').doc(incident.assignmentTransactionId).get();
      if (txnDoc.exists) {
        assignmentTransaction = { id: txnDoc.id, ...txnDoc.data() };
      }
    }

    // Fetch zone details if needed
    let zone = null;
    if (incident.zoneId) {
      const zoneDoc = await db.collection('zones').doc(incident.zoneId).get();
      if (zoneDoc.exists) {
        zone = { id: zoneDoc.id, ...zoneDoc.data() };
      }
    }

    utils.successResponse(res, {
      incident,
      zone,
      assignedResponder,
      assignmentTransaction
    });
  } catch (error) {
    console.error('Error fetching incident by ID:', error);
    utils.errorResponse(res, 500, 'Failed to fetch incident', error.message);
  }
});

// Get all incidents for a zone (new endpoint)
exports.getIncidentsByZone = functions.https.onRequest(async (req, res) => {
  utils.setupCORS(res);
  if (utils.handleOptions(req, res)) return;

  try {
    const zoneId = req.params['0'];
    utils.logExecution('getIncidentsByZone', { zoneId });
    const snapshot = await db.collection('incidents').where('zoneId', '==', zoneId).get();
    const incidents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    utils.successResponse(res, { incidents });
  } catch (error) {
    console.error('Error fetching incidents by zone:', error);
    utils.errorResponse(res, 500, 'Failed to fetch incidents by zone', error.message);
  }
});

// Get all active incidents for a zone (new endpoint)
exports.getActiveIncidentsByZone = functions.https.onRequest(async (req, res) => {
  utils.setupCORS(res);
  if (utils.handleOptions(req, res)) return;

  try {
    const zoneId = req.params['0'];
    utils.logExecution('getActiveIncidentsByZone', { zoneId });
    const snapshot = await db.collection('incidents')
      .where('zoneId', '==', zoneId)
      .where('status', 'in', ['active', 'ongoing', 'investigating'])
      .get();
    const incidents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    utils.successResponse(res, { incidents });
  } catch (error) {
    console.error('Error fetching active incidents by zone:', error);
    utils.errorResponse(res, 500, 'Failed to fetch active incidents by zone', error.message);
  }
});

// Create new incident with validation and auto-assignment (updated for new schema)
exports.createIncident = functions.https.onRequest(async (req, res) => {
  utils.setupCORS(res);
  if (utils.handleOptions(req, res)) return;

  try {
    const data = req.body;
    utils.logExecution('createIncident', data);

    // Validate required fields for new schema
    const errors = [];
    if (!data.type) errors.push('Incident type is required');
    if (!data.zoneId) errors.push('zoneId is required');
    if (!data.description) errors.push('Description is required');
    if (!data.priority) errors.push('Priority is required');
    if (!data.status) errors.push('Status is required');
    if (errors.length > 0) {
      return utils.errorResponse(res, 400, 'Validation failed', errors);
    }

    // Prepare incident data for new schema
    const incidentData = {
      type: data.type,
      status: data.status,
      priority: data.priority,
      severity: data.severity || 3,
      zoneId: data.zoneId,
      location: data.location || null,
      description: data.description,
      timestamp: new Date(),
      reportedBy: data.reportedBy || null,
      assignedResponderId: data.assignedResponderId || null,
      assignmentTransactionId: data.assignmentTransactionId || null,
      environmentalData: data.environmentalData || {},
      crowdData: data.crowdData ? {
        density: data.crowdData.density,
        evacuated: data.crowdData.evacuated,
        remaining: data.crowdData.remaining
      } : {},
      equipment: data.equipment || [],
      tags: data.tags || [],
      media: data.media || {},
      lastUpdated: new Date(),
      resolvedAt: data.resolvedAt || null
    };

    // Remove crowdData.total if present
    if (incidentData.crowdData && 'total' in incidentData.crowdData) {
      delete incidentData.crowdData.total;
    }

    const docRef = await db.collection('incidents').add(incidentData);
    utils.successResponse(res, { id: docRef.id, ...incidentData }, 'Incident created', 201);
  } catch (error) {
    console.error('Error creating incident:', error);
    utils.errorResponse(res, 500, 'Failed to create incident', error.message);
  }
});

// Update incident (updated for new schema and req.params['0'])
exports.updateIncident = functions.https.onRequest(async (req, res) => {
  utils.setupCORS(res);
  if (utils.handleOptions(req, res)) return;

  try {
    const incidentId = req.params['0'];
    const data = req.body;
    utils.logExecution('updateIncident', { incidentId, ...data });

    // Prepare update data for new schema
    const updateData = { ...data };
    if (updateData.crowdData && 'total' in updateData.crowdData) {
      delete updateData.crowdData.total;
    }
    if (updateData.timestamp) {
      delete updateData.timestamp; // Don't allow direct timestamp update
    }
    updateData.lastUpdated = new Date();

    await db.collection('incidents').doc(incidentId).update(updateData);
    utils.successResponse(res, { id: incidentId, ...updateData }, 'Incident updated');
  } catch (error) {
    console.error('Error updating incident:', error);
    utils.errorResponse(res, 500, 'Failed to update incident', error.message);
  }
});

// Delete incident with soft delete option
exports.deleteIncident = functions.https.onRequest(async (req, res) => {
  utils.setupCORS(res);
  if (utils.handleOptions(req, res)) return;

  try {
    const incidentId  = req.params['0'];
    const { softDelete = true } = req.query;
    utils.logExecution('deleteIncident', { incidentId, softDelete });

    const incidentRef = db.collection('incidents').doc(incidentId);
    const incidentDoc = await incidentRef.get();

    if (!incidentDoc.exists) {
      return utils.errorResponse(res, 404, 'Incident not found');
    }

    if (softDelete === 'true') {
      // Soft delete - mark as deleted
      await incidentRef.update({
        deleted: true,
        deletedAt: admin.firestore.FieldValue.serverTimestamp(),
        deletedBy: req.body.deletedBy || 'system'
      });
    } else {
      // Hard delete - remove from database
      await incidentRef.delete();
      
      // Delete related collections
      const batch = db.batch();
      
      // Delete notes
      const notesSnapshot = await incidentRef.collection('notes').get();
      notesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      
      // Delete media
      const mediaSnapshot = await incidentRef.collection('media').get();
      mediaSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      
      await batch.commit();
    }

    utils.successResponse(res, null, 'Incident deleted successfully');

  } catch (error) {
    console.error('Error deleting incident:', error);
    utils.errorResponse(res, 500, 'Failed to delete incident', error.message);
  }
});

// Get incident notes with pagination
exports.getIncidentNotes = functions.https.onRequest(async (req, res) => {
  utils.setupCORS(res);
  if (utils.handleOptions(req, res)) return;

  try {
    const  incidentId  = req.params['0'];
    const { limit = '20', offset = '0', type } = req.query;
    utils.logExecution('getIncidentNotes', { incidentId, limit, offset, type });

    let query = db.collection('incidents').doc(incidentId).collection('notes');
    
    if (type) query = query.where('type', '==', type);
    
    query = query.orderBy('timestamp', 'desc').limit(parseInt(limit));

    const snapshot = await query.get();
    const notes = [];

    snapshot.forEach(doc => {
      notes.push({
        id: doc.id,
        ...doc.data()
      });
    });

    utils.successResponse(res, { notes, count: notes.length });

  } catch (error) {
    console.error('Error fetching incident notes:', error);
    utils.errorResponse(res, 500, 'Failed to fetch incident notes', error.message);
  }
});

// Add incident note
exports.addIncidentNote = functions.https.onRequest(async (req, res) => {
  utils.setupCORS(res);
  if (utils.handleOptions(req, res)) return;

  try {
    const  incidentId  = req.params['0'];
    const { content, type = 'general', createdBy } = req.body;
    utils.logExecution('addIncidentNote', { incidentId, type });

    if (!content) {
      return utils.errorResponse(res, 400, 'Note content is required');
    }

    const noteData = {
      content,
      type,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: createdBy || 'system'
    };

    const docRef = await db.collection('incidents').doc(incidentId).collection('notes').add(noteData);

    utils.successResponse(res, {
      id: docRef.id,
      ...noteData
    }, 'Note added successfully', 201);

  } catch (error) {
    console.error('Error adding incident note:', error);
    utils.errorResponse(res, 500, 'Failed to add incident note', error.message);
  }
});

// Bulk operations
exports.bulkUpdateIncidents = functions.https.onRequest(async (req, res) => {
  utils.setupCORS(res);
  if (utils.handleOptions(req, res)) return;

  try {
    const { incidentIds, updates, changeNote } = req.body;
    utils.logExecution('bulkUpdateIncidents', { incidentIds: incidentIds?.length, updates });

    if (!incidentIds || !Array.isArray(incidentIds) || incidentIds.length === 0) {
      return utils.errorResponse(res, 400, 'Incident IDs array is required');
    }

    if (!updates || Object.keys(updates).length === 0) {
      return utils.errorResponse(res, 400, 'Updates object is required');
    }

    const batch = db.batch();
    const results = { success: [], failed: [] };

    for (const incidentId of incidentIds) {
      try {
        const incidentRef = db.collection('incidents').doc(incidentId);
        const incidentDoc = await incidentRef.get();

        if (!incidentDoc.exists) {
          results.failed.push({ id: incidentId, error: 'Incident not found' });
          continue;
        }

        const updateData = {
          ...updates,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        };

        batch.update(incidentRef, updateData);

        // Add change note if provided
        if (changeNote) {
          const noteRef = incidentRef.collection('notes').doc();
          batch.set(noteRef, {
            content: changeNote,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: updates.changedBy || 'system',
            type: 'bulk_update'
          });
        }

        results.success.push(incidentId);
      } catch (error) {
        results.failed.push({ id: incidentId, error: error.message });
      }
    }

    await batch.commit();

    utils.successResponse(res, results, 'Bulk update completed');

  } catch (error) {
    console.error('Error in bulk update:', error);
    utils.errorResponse(res, 500, 'Failed to perform bulk update', error.message);
  }
});

// Get incident analytics
exports.getIncidentAnalytics = functions.https.onRequest(async (req, res) => {
  utils.setupCORS(res);
  if (utils.handleOptions(req, res)) return;

  try {
    const { dateFrom, dateTo, zone } = req.query;
    utils.logExecution('getIncidentAnalytics', { dateFrom, dateTo, zone });

    let query = db.collection('incidents');
    
    if (dateFrom || dateTo) {
      if (dateFrom && dateTo) {
        query = query.where('timestamp', '>=', new Date(dateFrom)).where('timestamp', '<=', new Date(dateTo));
      } else if (dateFrom) {
        query = query.where('timestamp', '>=', new Date(dateFrom));
      } else if (dateTo) {
        query = query.where('timestamp', '<=', new Date(dateTo));
      }
    }

    if (zone) {
      query = query.where('zone', '==', zone);
    }

    const snapshot = await query.get();
    const incidents = [];

    snapshot.forEach(doc => {
      incidents.push({ id: doc.id, ...doc.data() });
    });

    // Calculate analytics
    const analytics = {
      total: incidents.length,
      byStatus: {},
      byPriority: {},
      byType: {},
      byZone: {},
      byHour: {},
      averageResolutionTime: 0,
      criticalIncidents: 0,
      activeIncidents: 0
    };

    let totalResolutionTime = 0;
    let resolvedCount = 0;

    incidents.forEach(incident => {
      // Status distribution
      analytics.byStatus[incident.status] = (analytics.byStatus[incident.status] || 0) + 1;
      
      // Priority distribution
      analytics.byPriority[incident.priority] = (analytics.byPriority[incident.priority] || 0) + 1;
      
      // Type distribution
      analytics.byType[incident.type] = (analytics.byType[incident.type] || 0) + 1;
      
      // Zone distribution
      analytics.byZone[incident.zone] = (analytics.byZone[incident.zone] || 0) + 1;
      
      // Hour distribution
      const hour = new Date(incident.timestamp?.toDate?.() || incident.timestamp).getHours();
      analytics.byHour[hour] = (analytics.byHour[hour] || 0) + 1;
      
      // Critical incidents
      if (incident.priority === 'critical') {
        analytics.criticalIncidents++;
      }
      
      // Active incidents
      if (['active', 'investigating'].includes(incident.status)) {
        analytics.activeIncidents++;
      }
      
      // Resolution time
      if (incident.resolvedAt && incident.timestamp) {
        const resolvedTime = incident.resolvedAt.toDate?.() || incident.resolvedAt;
        const createdTime = incident.timestamp.toDate?.() || incident.timestamp;
        totalResolutionTime += (resolvedTime - createdTime);
        resolvedCount++;
      }
    });

    if (resolvedCount > 0) {
      analytics.averageResolutionTime = Math.round(totalResolutionTime / resolvedCount / (1000 * 60)); // in minutes
    }

    utils.successResponse(res, analytics);

  } catch (error) {
    console.error('Error fetching incident analytics:', error);
    utils.errorResponse(res, 500, 'Failed to fetch incident analytics', error.message);
  }
});

// Update incident analytics (called after incident changes)
async function updateIncidentAnalytics() {
  try {
    const analyticsRef = db.collection('analytics').doc('incidents');
    const analyticsDoc = await analyticsRef.get();
    
    const snapshot = await db.collection('incidents').get();
    const incidents = [];
    
    snapshot.forEach(doc => {
      incidents.push({ id: doc.id, ...doc.data() });
    });

    const analytics = {
      totalIncidents: incidents.length,
      activeIncidents: incidents.filter(i => ['active', 'investigating'].includes(i.status)).length,
      criticalIncidents: incidents.filter(i => i.priority === 'critical').length,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    };

    await analyticsRef.set(analytics, { merge: true });
  } catch (error) {
    console.error('Error updating incident analytics:', error);
  }
} 