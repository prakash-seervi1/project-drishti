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

  validateZone: (data) => {
    const errors = [];
    
    if (!data.name) errors.push('Zone name is required');
    if (!data.type) errors.push('Zone type is required');
    
    // Validate zone type
    const validTypes = ['indoor', 'outdoor', 'parking', 'entrance', 'exit', 'common'];
    if (data.type && !validTypes.includes(data.type)) {
      errors.push('Zone type must be one of: indoor, outdoor, parking, entrance, exit, common');
    }
    
    // Validate capacity data
    if (data.capacity) {
      if (data.capacity.maxOccupancy && data.capacity.maxOccupancy <= 0) {
        errors.push('Maximum occupancy must be greater than 0');
      }
      if (data.capacity.currentOccupancy && data.capacity.currentOccupancy < 0) {
        errors.push('Current occupancy cannot be negative');
      }
      if (data.capacity.currentOccupancy && data.capacity.maxOccupancy && 
          data.capacity.currentOccupancy > data.capacity.maxOccupancy) {
        errors.push('Current occupancy cannot exceed maximum occupancy');
      }
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
      limit = '50',
      offset = '0',
      sortBy = 'name',
      sortOrder = 'asc',
      occupancyThreshold,
      criticalOnly = 'false'
    } = req.query;

    return {
      status,
      type,
      limit: parseInt(limit),
      offset: parseInt(offset),
      sortBy,
      sortOrder,
      occupancyThreshold: occupancyThreshold ? parseFloat(occupancyThreshold) : null,
      criticalOnly: criticalOnly === 'true'
    };
  },

  calculateZoneStatus: (zone) => {
    if (!zone.capacity) return 'normal';
    
    const { currentOccupancy, maxOccupancy, crowdDensity } = zone.capacity;
    
    if (crowdDensity >= 90) return 'critical';
    if (crowdDensity >= 75) return 'warning';
    if (crowdDensity >= 50) return 'moderate';
    return 'normal';
  },

  calculateCrowdDensity: (currentOccupancy, maxOccupancy) => {
    if (!maxOccupancy || maxOccupancy <= 0) return 0;
    return Math.round((currentOccupancy / maxOccupancy) * 100);
  }
};

// Get all zones with advanced filtering and analytics
exports.getZones = functions.https.onRequest(async (req, res) => {
  utils.setupCORS(res);
  if (utils.handleOptions(req, res)) return;

  try {
    utils.logExecution('getZones', req.query);
    
    const params = utils.parseQueryParams(req);
    let query = db.collection('zones');

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
    const zones = [];

    snapshot.forEach(doc => {
      const zoneData = {
        id: doc.id,
        ...doc.data()
      };
      
      // Calculate real-time status if not set
      if (!zoneData.status) {
        zoneData.status = utils.calculateZoneStatus(zoneData);
      }
      
      zones.push(zoneData);
    });

    // Apply additional filters
    let filteredZones = zones;
    
    if (params.criticalOnly) {
      filteredZones = filteredZones.filter(zone => zone.status === 'critical');
    }
    
    if (params.occupancyThreshold) {
      filteredZones = filteredZones.filter(zone => 
        zone.capacity?.crowdDensity >= params.occupancyThreshold
      );
    }

    // Get total count
    const totalSnapshot = await db.collection('zones').get();
    const totalCount = totalSnapshot.size;

    // Calculate summary analytics
    const analytics = {
      total: zones.length,
      byStatus: {},
      byType: {},
      totalOccupancy: 0,
      totalCapacity: 0,
      averageDensity: 0,
      criticalZones: 0
    };

    zones.forEach(zone => {
      analytics.byStatus[zone.status] = (analytics.byStatus[zone.status] || 0) + 1;
      analytics.byType[zone.type] = (analytics.byType[zone.type] || 0) + 1;
      
      if (zone.capacity) {
        analytics.totalOccupancy += zone.capacity.currentOccupancy || 0;
        analytics.totalCapacity += zone.capacity.maxOccupancy || 0;
      }
      
      if (zone.status === 'critical') {
        analytics.criticalZones++;
      }
    });

    if (analytics.totalCapacity > 0) {
      analytics.averageDensity = Math.round((analytics.totalOccupancy / analytics.totalCapacity) * 100);
    }

    utils.successResponse(res, {
      zones: filteredZones,
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
    console.error('Error fetching zones:', error);
    utils.errorResponse(res, 500, 'Failed to fetch zones', error.message);
  }
});

// Get single zone by ID with detailed analytics
exports.getZoneById = functions.https.onRequest(async (req, res) => {
  utils.setupCORS(res);
  if (utils.handleOptions(req, res)) return;

  try {
    const { zoneId } = req.params;
    utils.logExecution('getZoneById', { zoneId });

    const doc = await db.collection('zones').doc(zoneId).get();

    if (!doc.exists) {
      return utils.errorResponse(res, 404, 'Zone not found');
    }

    const zone = {
      id: doc.id,
      ...doc.data()
    };

    // Calculate real-time status
    zone.status = utils.calculateZoneStatus(zone);

    // Get recent sensor data
    const [sensorsSnapshot, incidentsSnapshot] = await Promise.all([
      db.collection('zones').doc(zoneId).collection('sensors')
        .orderBy('timestamp', 'desc').limit(20).get(),
      db.collection('incidents')
        .where('zone', '==', zone.name)
        .orderBy('timestamp', 'desc').limit(10).get()
    ]);

    const sensors = [];
    const incidents = [];

    sensorsSnapshot.forEach(doc => sensors.push({ id: doc.id, ...doc.data() }));
    incidentsSnapshot.forEach(doc => incidents.push({ id: doc.id, ...doc.data() }));

    // Calculate sensor analytics
    const sensorAnalytics = {
      totalReadings: sensors.length,
      averageTemperature: 0,
      averageHumidity: 0,
      averageAirQuality: 0,
      lastUpdate: sensors[0]?.timestamp || null
    };

    if (sensors.length > 0) {
      const tempSensors = sensors.filter(s => s.temperature !== undefined);
      const humiditySensors = sensors.filter(s => s.humidity !== undefined);
      const airQualitySensors = sensors.filter(s => s.airQuality !== undefined);

      if (tempSensors.length > 0) {
        sensorAnalytics.averageTemperature = tempSensors.reduce((sum, s) => sum + s.temperature, 0) / tempSensors.length;
      }
      if (humiditySensors.length > 0) {
        sensorAnalytics.averageHumidity = humiditySensors.reduce((sum, s) => sum + s.humidity, 0) / humiditySensors.length;
      }
      if (airQualitySensors.length > 0) {
        sensorAnalytics.averageAirQuality = airQualitySensors.reduce((sum, s) => sum + s.airQuality, 0) / airQualitySensors.length;
      }
    }

    utils.successResponse(res, {
      ...zone,
      sensors: sensors.slice(0, 10), // Return only recent sensors
      incidents: incidents.slice(0, 5), // Return only recent incidents
      analytics: {
        sensorAnalytics,
        incidentCount: incidents.length,
        activeIncidents: incidents.filter(i => ['active', 'investigating'].includes(i.status)).length
      }
    });

  } catch (error) {
    console.error('Error fetching zone:', error);
    utils.errorResponse(res, 500, 'Failed to fetch zone', error.message);
  }
});

// Update zone with real-time status calculation
exports.updateZone = functions.https.onRequest(async (req, res) => {
  utils.setupCORS(res);
  if (utils.handleOptions(req, res)) return;

  try {
    const { zoneId } = req.params;
    utils.logExecution('updateZone', { zoneId, body: req.body });

    const zoneRef = db.collection('zones').doc(zoneId);
    const zoneDoc = await zoneRef.get();

    if (!zoneDoc.exists) {
      return utils.errorResponse(res, 404, 'Zone not found');
    }

    const oldData = zoneDoc.data();
    const updateData = {
      ...req.body,
      lastUpdate: admin.firestore.FieldValue.serverTimestamp()
    };

    // Validate update data
    const validationErrors = utils.validateZone({ ...oldData, ...updateData });
    if (validationErrors.length > 0) {
      return utils.errorResponse(res, 400, 'Validation failed', validationErrors);
    }

    // Calculate crowd density if capacity is updated
    if (updateData.capacity && updateData.capacity.currentOccupancy !== undefined && updateData.capacity.maxOccupancy) {
      updateData.capacity.crowdDensity = utils.calculateCrowdDensity(
        updateData.capacity.currentOccupancy,
        updateData.capacity.maxOccupancy
      );
    }

    // Calculate real-time status
    const newStatus = utils.calculateZoneStatus({ ...oldData, ...updateData });
    updateData.status = newStatus;

    // Track status changes
    if (newStatus !== oldData.status) {
      updateData.statusHistory = admin.firestore.FieldValue.arrayUnion({
        from: oldData.status,
        to: newStatus,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        reason: req.body.statusChangeReason || 'automatic'
      });

      // Trigger alerts for critical status
      if (newStatus === 'critical') {
        await triggerZoneAlert(zoneId, 'critical', updateData);
      }
    }

    await zoneRef.update(updateData);

    // Update zone analytics
    await updateZoneAnalytics();

    utils.successResponse(res, {
      ...updateData,
      id: zoneId
    }, 'Zone updated successfully');

  } catch (error) {
    console.error('Error updating zone:', error);
    utils.errorResponse(res, 500, 'Failed to update zone', error.message);
  }
});

// Get zone sensors with advanced filtering
exports.getZoneSensors = functions.https.onRequest(async (req, res) => {
  utils.setupCORS(res);
  if (utils.handleOptions(req, res)) return;

  try {
    const { zoneId } = req.params;
    const { type, limit = '50', offset = '0', dateFrom, dateTo } = req.query;
    utils.logExecution('getZoneSensors', { zoneId, type, limit, offset });

    let query = db.collection('zones').doc(zoneId).collection('sensors');
    
    if (type) query = query.where('type', '==', type);
    
    // Apply date range filter
    if (dateFrom || dateTo) {
      if (dateFrom && dateTo) {
        query = query.where('timestamp', '>=', new Date(dateFrom)).where('timestamp', '<=', new Date(dateTo));
      } else if (dateFrom) {
        query = query.where('timestamp', '>=', new Date(dateFrom));
      } else if (dateTo) {
        query = query.where('timestamp', '<=', new Date(dateTo));
      }
    }

    query = query.orderBy('timestamp', 'desc');

    // Apply pagination
    if (parseInt(offset) > 0) {
      const offsetSnapshot = await query.limit(parseInt(offset)).get();
      const lastDoc = offsetSnapshot.docs[offsetSnapshot.docs.length - 1];
      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }
    }
    
    query = query.limit(parseInt(limit));

    const snapshot = await query.get();
    const sensors = [];

    snapshot.forEach(doc => {
      sensors.push({
        id: doc.id,
        ...doc.data()
      });
    });

    utils.successResponse(res, {
      sensors,
      count: sensors.length,
      zoneId
    });

  } catch (error) {
    console.error('Error fetching zone sensors:', error);
    utils.errorResponse(res, 500, 'Failed to fetch zone sensors', error.message);
  }
});

// Add sensor reading with validation and alerts
exports.addSensorReading = functions.https.onRequest(async (req, res) => {
  utils.setupCORS(res);
  if (utils.handleOptions(req, res)) return;

  try {
    const { zoneId } = req.params;
    const sensorData = {
      ...req.body,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      zoneId
    };
    utils.logExecution('addSensorReading', { zoneId, sensorType: sensorData.type });

    // Validate sensor data
    if (!sensorData.type) {
      return utils.errorResponse(res, 400, 'Sensor type is required');
    }

    // Validate sensor values
    const validationErrors = validateSensorData(sensorData);
    if (validationErrors.length > 0) {
      return utils.errorResponse(res, 400, 'Sensor data validation failed', validationErrors);
    }

    const docRef = await db.collection('zones').doc(zoneId).collection('sensors').add(sensorData);

    // Check for sensor alerts
    await checkSensorAlerts(zoneId, sensorData);

    // Update zone if occupancy sensor
    if (sensorData.type === 'occupancy' && sensorData.count !== undefined) {
      await updateZoneOccupancy(zoneId, sensorData.count);
    }

    utils.successResponse(res, {
      id: docRef.id,
      ...sensorData
    }, 'Sensor reading added successfully', 201);

  } catch (error) {
    console.error('Error adding sensor reading:', error);
    utils.errorResponse(res, 500, 'Failed to add sensor reading', error.message);
  }
});

// Get zone analytics with detailed metrics
exports.getZoneAnalytics = functions.https.onRequest(async (req, res) => {
  utils.setupCORS(res);
  if (utils.handleOptions(req, res)) return;

  try {
    const { zoneId } = req.params;
    const { period = '24h' } = req.query;
    utils.logExecution('getZoneAnalytics', { zoneId, period });

    const zoneRef = db.collection('zones').doc(zoneId);
    const zoneDoc = await zoneRef.get();

    if (!zoneDoc.exists) {
      return utils.errorResponse(res, 404, 'Zone not found');
    }

    const zone = zoneDoc.data();

    // Calculate time range
    const now = new Date();
    let startTime;
    switch (period) {
      case '1h':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '6h':
        startTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        break;
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Get sensor data for the period
    const sensorsSnapshot = await zoneRef.collection('sensors')
      .where('timestamp', '>=', startTime)
      .orderBy('timestamp', 'desc')
      .get();

    const sensors = [];
    sensorsSnapshot.forEach(doc => sensors.push({ id: doc.id, ...doc.data() }));

    // Calculate analytics
    const analytics = {
      period,
      totalReadings: sensors.length,
      occupancy: {
        current: zone.capacity?.currentOccupancy || 0,
        max: zone.capacity?.maxOccupancy || 0,
        density: zone.capacity?.crowdDensity || 0,
        trend: calculateOccupancyTrend(sensors)
      },
      sensors: {
        temperature: calculateSensorStats(sensors, 'temperature'),
        humidity: calculateSensorStats(sensors, 'humidity'),
        airQuality: calculateSensorStats(sensors, 'airQuality'),
        noise: calculateSensorStats(sensors, 'noiseLevel')
      },
      alerts: {
        critical: sensors.filter(s => s.alertLevel === 'critical').length,
        warning: sensors.filter(s => s.alertLevel === 'warning').length,
        normal: sensors.filter(s => s.alertLevel === 'normal').length
      },
      status: {
        current: zone.status,
        history: zone.statusHistory || []
      }
    };

    utils.successResponse(res, analytics);

  } catch (error) {
    console.error('Error fetching zone analytics:', error);
    utils.errorResponse(res, 500, 'Failed to fetch zone analytics', error.message);
  }
});

// Bulk zone operations
exports.bulkUpdateZones = functions.https.onRequest(async (req, res) => {
  utils.setupCORS(res);
  if (utils.handleOptions(req, res)) return;

  try {
    const { zoneIds, updates } = req.body;
    utils.logExecution('bulkUpdateZones', { zoneIds: zoneIds?.length, updates });

    if (!zoneIds || !Array.isArray(zoneIds) || zoneIds.length === 0) {
      return utils.errorResponse(res, 400, 'Zone IDs array is required');
    }

    if (!updates || Object.keys(updates).length === 0) {
      return utils.errorResponse(res, 400, 'Updates object is required');
    }

    const batch = db.batch();
    const results = { success: [], failed: [] };

    for (const zoneId of zoneIds) {
      try {
        const zoneRef = db.collection('zones').doc(zoneId);
        const zoneDoc = await zoneRef.get();

        if (!zoneDoc.exists) {
          results.failed.push({ id: zoneId, error: 'Zone not found' });
          continue;
        }

        const updateData = {
          ...updates,
          lastUpdate: admin.firestore.FieldValue.serverTimestamp()
        };

        batch.update(zoneRef, updateData);
        results.success.push(zoneId);
      } catch (error) {
        results.failed.push({ id: zoneId, error: error.message });
      }
    }

    await batch.commit();

    utils.successResponse(res, results, 'Bulk update completed');

  } catch (error) {
    console.error('Error in bulk update:', error);
    utils.errorResponse(res, 500, 'Failed to perform bulk update', error.message);
  }
});

// Get all incidents for a zone
exports.getIncidentsByZone = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  try {
    const zoneId = req.params['0'];
    const snapshot = await db.collection('incidents').where('zoneId', '==', zoneId).get();
    const incidents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ success: true, incidents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all active incidents for a zone
exports.getActiveIncidentsByZone = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  try {
    const zoneId = req.params['0'];
    const snapshot = await db.collection('incidents')
      .where('zoneId', '==', zoneId)
      .where('status', 'in', ['active', 'ongoing', 'investigating'])
      .get();
    const incidents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ success: true, incidents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper functions
function validateSensorData(sensorData) {
  const errors = [];
  
  // Validate temperature
  if (sensorData.temperature !== undefined) {
    if (sensorData.temperature < -50 || sensorData.temperature > 100) {
      errors.push('Temperature must be between -50 and 100 degrees');
    }
  }
  
  // Validate humidity
  if (sensorData.humidity !== undefined) {
    if (sensorData.humidity < 0 || sensorData.humidity > 100) {
      errors.push('Humidity must be between 0 and 100 percent');
    }
  }
  
  // Validate air quality
  if (sensorData.airQuality !== undefined) {
    if (sensorData.airQuality < 0 || sensorData.airQuality > 500) {
      errors.push('Air quality must be between 0 and 500');
    }
  }
  
  // Validate occupancy count
  if (sensorData.count !== undefined) {
    if (sensorData.count < 0) {
      errors.push('Occupancy count cannot be negative');
    }
  }
  
  return errors;
}

async function checkSensorAlerts(zoneId, sensorData) {
  try {
    const alerts = [];
    
    // Temperature alerts
    if (sensorData.temperature !== undefined) {
      if (sensorData.temperature > 35) {
        alerts.push({ type: 'temperature', level: 'critical', value: sensorData.temperature });
      } else if (sensorData.temperature > 30) {
        alerts.push({ type: 'temperature', level: 'warning', value: sensorData.temperature });
      }
    }
    
    // Air quality alerts
    if (sensorData.airQuality !== undefined) {
      if (sensorData.airQuality > 300) {
        alerts.push({ type: 'airQuality', level: 'critical', value: sensorData.airQuality });
      } else if (sensorData.airQuality > 150) {
        alerts.push({ type: 'airQuality', level: 'warning', value: sensorData.airQuality });
      }
    }
    
    // Create alerts if any
    if (alerts.length > 0) {
      const alertRef = db.collection('alerts').doc();
      await alertRef.set({
        zoneId,
        sensorData,
        alerts,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'active'
      });
    }
  } catch (error) {
    console.error('Error checking sensor alerts:', error);
  }
}

async function updateZoneOccupancy(zoneId, count) {
  try {
    const zoneRef = db.collection('zones').doc(zoneId);
    const zoneDoc = await zoneRef.get();
    
    if (!zoneDoc.exists) return;
    
    const zoneData = zoneDoc.data();
    const maxOccupancy = zoneData.capacity?.maxOccupancy || 1000;
    const crowdDensity = utils.calculateCrowdDensity(count, maxOccupancy);
    const newStatus = utils.calculateZoneStatus({
      ...zoneData,
      capacity: { ...zoneData.capacity, currentOccupancy: count, crowdDensity }
    });
    
    await zoneRef.update({
      'capacity.currentOccupancy': count,
      'capacity.crowdDensity': crowdDensity,
      status: newStatus,
      lastUpdate: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating zone occupancy:', error);
  }
}

async function triggerZoneAlert(zoneId, alertType, zoneData) {
  try {
    const alertRef = db.collection('alerts').doc();
    await alertRef.set({
      zoneId,
      type: alertType,
      zoneData,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'active',
      priority: 'high'
    });
  } catch (error) {
    console.error('Error triggering zone alert:', error);
  }
}

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

function calculateSensorStats(sensors, sensorType) {
  const typeSensors = sensors.filter(s => s[sensorType] !== undefined);
  
  if (typeSensors.length === 0) {
    return { min: 0, max: 0, average: 0, count: 0 };
  }
  
  const values = typeSensors.map(s => s[sensorType]);
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    average: Math.round(values.reduce((sum, val) => sum + val, 0) / values.length * 100) / 100,
    count: values.length
  };
}

async function updateZoneAnalytics() {
  try {
    const analyticsRef = db.collection('analytics').doc('zones');
    const snapshot = await db.collection('zones').get();
    const zones = [];
    
    snapshot.forEach(doc => {
      zones.push({ id: doc.id, ...doc.data() });
    });

    const analytics = {
      totalZones: zones.length,
      criticalZones: zones.filter(z => z.status === 'critical').length,
      warningZones: zones.filter(z => z.status === 'warning').length,
      normalZones: zones.filter(z => z.status === 'normal').length,
      totalOccupancy: zones.reduce((sum, z) => sum + (z.capacity?.currentOccupancy || 0), 0),
      totalCapacity: zones.reduce((sum, z) => sum + (z.capacity?.maxOccupancy || 0), 0),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    };

    await analyticsRef.set(analytics, { merge: true });
  } catch (error) {
    console.error('Error updating zone analytics:', error);
  }
} 