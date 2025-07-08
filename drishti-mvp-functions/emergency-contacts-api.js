const functions = require('firebase-functions');

// Get centralized dependencies from index.js
const { db } = require('./index.js').dependencies;

// Get all emergency contacts
exports.getEmergencyContacts = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { type, priority, isActive } = req.query;
    let query = db.collection('emergency_contacts');

    // Apply filters
    if (type) query = query.where('type', '==', type);
    if (priority) query = query.where('priority', '==', parseInt(priority));
    if (isActive !== undefined) query = query.where('isActive', '==', isActive === 'true');

    const snapshot = await query.orderBy('priority', 'asc').get();
    const contacts = [];

    snapshot.forEach(doc => {
      contacts.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json({
      success: true,
      data: contacts,
      count: contacts.length
    });

  } catch (error) {
    console.error('Error fetching emergency contacts:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get single emergency contact by ID
exports.getEmergencyContactById = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { contactId } = req.params;
    const doc = await db.collection('emergency_contacts').doc(contactId).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Emergency contact not found'
      });
    }

    const contact = {
      id: doc.id,
      ...doc.data()
    };

    res.status(200).json({
      success: true,
      data: contact
    });

  } catch (error) {
    console.error('Error fetching emergency contact:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new emergency contact
exports.createEmergencyContact = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const contactData = {
      ...req.body,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    };

    const docRef = await db.collection('emergency_contacts').add(contactData);
    
    res.status(201).json({
      success: true,
      data: {
        id: docRef.id,
        ...contactData
      },
      message: 'Emergency contact created successfully'
    });

  } catch (error) {
    console.error('Error creating emergency contact:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update emergency contact
exports.updateEmergencyContact = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { contactId } = req.params;
    const updateData = req.body;

    await db.collection('emergency_contacts').doc(contactId).update(updateData);
    
    res.status(200).json({
      success: true,
      message: 'Emergency contact updated successfully'
    });

  } catch (error) {
    console.error('Error updating emergency contact:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete emergency contact
exports.deleteEmergencyContact = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { contactId } = req.params;
    await db.collection('emergency_contacts').doc(contactId).delete();
    
    res.status(200).json({
      success: true,
      message: 'Emergency contact deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting emergency contact:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get contacts by incident type
exports.getContactsByIncidentType = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { incidentType } = req.params;
    
    // Map incident types to contact types
    const typeMapping = {
      'fire': 'fire',
      'medical': 'medical',
      'security': 'police',
      'panic': 'police',
      'crowd': 'police',
      'environmental': 'fire',
      'technical': 'technical'
    };

    const contactType = typeMapping[incidentType] || 'general';
    
    const snapshot = await db.collection('emergency_contacts')
      .where('type', '==', contactType)
      .where('isActive', '==', true)
      .orderBy('priority', 'asc')
      .get();

    const contacts = [];
    snapshot.forEach(doc => {
      contacts.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json({
      success: true,
      data: contacts,
      incidentType: incidentType,
      contactType: contactType
    });

  } catch (error) {
    console.error('Error fetching contacts by incident type:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Toggle contact active status
exports.toggleContactStatus = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { contactId } = req.params;
    
    // Get current status
    const doc = await db.collection('emergency_contacts').doc(contactId).get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Emergency contact not found'
      });
    }

    const currentStatus = doc.data().isActive;
    
    // Toggle status
    await db.collection('emergency_contacts').doc(contactId).update({
      isActive: !currentStatus
    });
    
    res.status(200).json({
      success: true,
      message: `Contact ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      isActive: !currentStatus
    });

  } catch (error) {
    console.error('Error toggling contact status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get contact analytics
exports.getContactAnalytics = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const snapshot = await db.collection('emergency_contacts').get();
    const contacts = [];

    snapshot.forEach(doc => {
      contacts.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Calculate analytics
    const analytics = {
      total: contacts.length,
      active: contacts.filter(c => c.isActive).length,
      inactive: contacts.filter(c => !c.isActive).length,
      byType: {},
      byPriority: {
        priority1: contacts.filter(c => c.priority === 1).length,
        priority2: contacts.filter(c => c.priority === 2).length,
        priority3: contacts.filter(c => c.priority === 3).length
      }
    };

    // Group by type
    contacts.forEach(contact => {
      if (!analytics.byType[contact.type]) {
        analytics.byType[contact.type] = {
          total: 0,
          active: 0,
          inactive: 0
        };
      }
      analytics.byType[contact.type].total++;
      if (contact.isActive) {
        analytics.byType[contact.type].active++;
      } else {
        analytics.byType[contact.type].inactive++;
      }
    });

    res.status(200).json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Error fetching contact analytics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}); 