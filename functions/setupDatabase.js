const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

// --- 1. Original Sample Data for All Collections ---
const collectionsData = {
  // System Configuration
  'system_config/system': {
    version: "1.0.0",
    settings: {
      maxIncidentSeverity: 5,
      defaultResponseTime: "5 min",
      autoEscalationThreshold: 10,
      notificationChannels: ["email", "push", "sms"]
    },
    zones: {
      defaultZone: "Zone A",
      zoneTypes: ["indoor", "outdoor", "parking", "hall"]
    },
    incidentTypes: ["fire", "medical", "security", "panic", "crowd", "environmental", "technical"],
    responderTypes: ["Fire Brigade", "Medical", "Security", "Police", "Ambulance", "Technical"],
    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
  },
  // Responders
  'responders/responder_001': {
    name: "John Smith",
    type: "Fire Brigade",
    status: "available",
    vehicle: "Fire Truck 1",
    position: {
      lat: 12.9716,
      lng: 77.5946,
      lastUpdate: admin.firestore.FieldValue.serverTimestamp()
    },
    contact: {
      phone: "+91-9876543210",
      radio: "Channel 1",
      email: "john.smith@fire.gov"
    },
    equipment: {
      batteryLevel: 85,
      signalStrength: 4,
      medicalKit: true,
      defibrillator: false
    },
    assignedIncident: null,
    eta: null,
    speed: "0 km/h",
    experience: "8 years",
    specializations: ["Fire Suppression", "Rescue Operations"],
    lastUpdate: admin.firestore.FieldValue.serverTimestamp()
  },
  'responders/responder_002': {
    name: "Sarah Johnson",
    type: "Medical",
    status: "en_route",
    vehicle: "Ambulance 2",
    position: {
      lat: 12.9726,
      lng: 77.5956,
      lastUpdate: admin.firestore.FieldValue.serverTimestamp()
    },
    contact: {
      phone: "+91-9876543211",
      radio: "Channel 2",
      email: "sarah.johnson@medical.gov"
    },
    equipment: {
      batteryLevel: 92,
      signalStrength: 5,
      medicalKit: true,
      defibrillator: true
    },
    assignedIncident: "incident_001",
    eta: "3 min",
    speed: "45 km/h",
    experience: "5 years",
    specializations: ["Emergency Medicine", "Trauma Care"],
    lastUpdate: admin.firestore.FieldValue.serverTimestamp()
  },
  'responders/responder_003': {
    name: "Mike Wilson",
    type: "Security",
    status: "on_scene",
    vehicle: "Patrol Car 3",
    position: {
      lat: 12.9736,
      lng: 77.5966,
      lastUpdate: admin.firestore.FieldValue.serverTimestamp()
    },
    contact: {
      phone: "+91-9876543212",
      radio: "Channel 3",
      email: "mike.wilson@security.gov"
    },
    equipment: {
      batteryLevel: 78,
      signalStrength: 3,
      medicalKit: false,
      defibrillator: false
    },
    assignedIncident: "incident_002",
    eta: "0 min",
    speed: "0 km/h",
    experience: "12 years",
    specializations: ["Crowd Control", "Surveillance"],
    lastUpdate: admin.firestore.FieldValue.serverTimestamp()
  },
  // Emergency Contacts
  'emergency_contacts/contact_001': {
    name: "Fire Department",
    type: "fire",
    contact: {
      phone: "+91-9876543200",
      email: "fire@emergency.gov",
      radio: "Channel 1"
    },
    priority: 1,
    responseTime: "5 min",
    specializations: ["Fire Suppression", "Rescue"],
    availability: "24/7",
    location: {
      address: "123 Emergency St, City",
      lat: 12.9716,
      lng: 77.5946
    },
    isActive: true
  },
  'emergency_contacts/contact_002': {
    name: "Medical Emergency",
    type: "medical",
    contact: {
      phone: "+91-9876543201",
      email: "medical@emergency.gov",
      radio: "Channel 2"
    },
    priority: 1,
    responseTime: "7 min",
    specializations: ["Emergency Medicine", "Trauma Care"],
    availability: "24/7",
    location: {
      address: "456 Medical Ave, City",
      lat: 12.9726,
      lng: 77.5956
    },
    isActive: true
  },
  'emergency_contacts/contact_003': {
    name: "Police Department",
    type: "police",
    contact: {
      phone: "+91-9876543202",
      email: "police@emergency.gov",
      radio: "Channel 3"
    },
    priority: 2,
    responseTime: "10 min",
    specializations: ["Law Enforcement", "Crowd Control"],
    availability: "24/7",
    location: {
      address: "789 Police Rd, City",
      lat: 12.9736,
      lng: 77.5966
    },
    isActive: true
  },
  // Incidents
  'incidents/incident_001': {
    type: "fire",
    status: "active",
    priority: "critical",
    severity: 5,
    zoneId: "zone_a",
    location: {
      lat: 12.9716,
      lng: 77.5946,
      address: "Main Hall, Zone A"
    },
    description: "Electrical fire detected in main hall, smoke visible from multiple exits",
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    reportedBy: "user_001",
    assignedResponderId: "responder_001",
    assignmentTransactionId: "txn_001",
    environmentalData: {
      temperature: "28°C",
      humidity: "70%",
      windSpeed: "8 km/h",
      visibility: "Poor",
      airQuality: "Poor"
    },
    crowdData: {
      density: 85,
      evacuated: 150,
      remaining: 200
    },
    equipment: ["Fire Extinguishers", "Smoke Detectors", "Emergency Lighting"],
    tags: ["electrical", "smoke", "evacuation"],
    media: {
      cameras: 6,
      recordings: 4,
      photos: 12
    },
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    resolvedAt: null
  },
  'incidents/incident_002': {
    type: "medical",
    status: "ongoing",
    priority: "high",
    severity: 4,
    zoneId: "zone_b",
    location: {
      lat: 12.9746,
      lng: 77.5976,
      address: "Conference Room, Zone B"
    },
    description: "Medical emergency - person collapsed, requires immediate attention",
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    reportedBy: "user_002",
    assignedResponderId: "responder_002",
    assignmentTransactionId: "txn_002",
    environmentalData: {
      temperature: "24°C",
      humidity: "60%",
      windSpeed: "3 km/h",
      visibility: "Good",
      airQuality: "Good"
    },
    crowdData: {
      density: 45,
      evacuated: 20,
      remaining: 80
    },
    equipment: ["First Aid Kit", "Defibrillator", "Medical Supplies"],
    tags: ["medical", "emergency", "first-aid"],
    media: {
      cameras: 3,
      recordings: 2,
      photos: 5
    },
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    resolvedAt: null
  },
  'incidents/incident_003': {
    type: "crowd",
    status: "investigating",
    priority: "medium",
    severity: 3,
    zoneId: "zone_c",
    location: {
      lat: 12.9776,
      lng: 77.6006,
      address: "Parking Area, Zone C"
    },
    description: "Large crowd gathering, potential safety concern",
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    reportedBy: "user_003",
    assignedResponderId: "responder_003",
    assignmentTransactionId: "txn_003",
    environmentalData: {
      temperature: "26°C",
      humidity: "65%",
      windSpeed: "5 km/h",
      visibility: "Good",
      airQuality: "Good"
    },
    crowdData: {
      density: 92,
      evacuated: 50,
      remaining: 1050
    },
    equipment: ["Crowd Control Barriers", "Communication Devices"],
    tags: ["crowd-control", "safety", "monitoring"],
    media: {
      cameras: 8,
      recordings: 6,
      photos: 15
    },
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    resolvedAt: null
  },
  // Add responderAssignments sample documents
  'responderAssignments/txn_001': {
    incidentId: "incident_001",
    responderId: "responder_001",
    assignedAt: admin.firestore.FieldValue.serverTimestamp(),
    statusHistory: [
      { status: "en_route", timestamp: new Date().toISOString() },
      { status: "on_scene", timestamp: new Date().toISOString() }
    ],
    locationHistory: [
      { lat: 12.9716, lng: 77.5946, timestamp: new Date().toISOString() }
    ]
  },
  'responderAssignments/txn_002': {
    incidentId: "incident_002",
    responderId: "responder_002",
    assignedAt: admin.firestore.FieldValue.serverTimestamp(),
    statusHistory: [
      { status: "en_route", timestamp: new Date().toISOString() },
      { status: "on_scene", timestamp: new Date().toISOString() }
    ],
    locationHistory: [
      { lat: 12.9746, lng: 77.5976, timestamp: new Date().toISOString() }
    ]
  },
  'responderAssignments/txn_003': {
    incidentId: "incident_003",
    responderId: "responder_003",
    assignedAt: admin.firestore.FieldValue.serverTimestamp(),
    statusHistory: [
      { status: "en_route", timestamp: new Date().toISOString() },
      { status: "on_scene", timestamp: new Date().toISOString() }
    ],
    locationHistory: [
      { lat: 12.9776, lng: 77.6006, timestamp: new Date().toISOString() }
    ]
  }
};

// --- 2. New Venue and Zones as Subcollection ---
const venueId = 'spring_fest_2024';
const venueData = {
  eventName: "Spring Fest 2024",
  venueType: "Ground",
  venueArea: 10000,
  layoutImageUrl: "gs://bucket/venues/spring_fest_2024/layout.jpg",
  entryGates: 3,
  crowdType: "Standing",
  autoZone: true,
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
  createdBy: "user@example.com"
};
const zonesData = [
  {
    zoneId: "zone-1",
    name: "Zone 1",
    area: 2500,
    capacity: 500,
    assignedGates: [0],
    risk: "none",
    status: "normal",
    boundaries: {
      coordinates: [
        { lat: 12.9716, lng: 77.5946 },
        { lat: 12.9726, lng: 77.5956 },
        { lat: 12.9736, lng: 77.5966 },
        { lat: 12.9706, lng: 77.5936 }
      ]
    },
    capacityDetails: {
      maxOccupancy: 1000,
      currentOccupancy: 750,
      crowdDensity: 75
    },
    sensors: {
      cameras: 8,
      temperature: 2,
      airQuality: 1,
      crowdCounters: 4
    },
    emergencyExits: [
      {
        id: "exit_1",
        location: { lat: 12.9716, lng: 77.5946 },
        status: "open"
      }
    ],
    lastUpdate: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    zoneId: "zone-2",
    name: "Zone 2",
    area: 2500,
    capacity: 500,
    assignedGates: [1],
    risk: "none",
    status: "active",
    boundaries: {
      coordinates: [
        { lat: 12.9746, lng: 77.5976 },
        { lat: 12.9756, lng: 77.5986 },
        { lat: 12.9766, lng: 77.5996 },
        { lat: 12.9736, lng: 77.5966 }
      ]
    },
    capacityDetails: {
      maxOccupancy: 800,
      currentOccupancy: 600,
      crowdDensity: 65
    },
    sensors: {
      cameras: 6,
      temperature: 1,
      airQuality: 1,
      crowdCounters: 3
    },
    emergencyExits: [
      {
        id: "exit_3",
        location: { lat: 12.9746, lng: 77.5976 },
        status: "open"
      }
    ],
    lastUpdate: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    zoneId: "zone-3",
    name: "Zone 3",
    area: 2500,
    capacity: 500,
    assignedGates: [2],
    risk: "none",
    status: "critical",
    boundaries: {
      coordinates: [
        { lat: 12.9776, lng: 77.6006 },
        { lat: 12.9786, lng: 77.6016 },
        { lat: 12.9796, lng: 77.6026 },
        { lat: 12.9766, lng: 77.5996 }
      ]
    },
    capacityDetails: {
      maxOccupancy: 1200,
      currentOccupancy: 1100,
      crowdDensity: 92
    },
    sensors: {
      cameras: 10,
      temperature: 3,
      airQuality: 2,
      crowdCounters: 5
    },
    emergencyExits: [
      {
        id: "exit_4",
        location: { lat: 12.9776, lng: 77.6006 },
        status: "blocked"
      }
    ],
    lastUpdate: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    zoneId: "zone-4",
    name: "Zone 4",
    area: 2500,
    capacity: 500,
    assignedGates: [],
    risk: "cascading",
    status: "normal",
    boundaries: {
      coordinates: [
        { lat: 12.9800, lng: 77.6030 },
        { lat: 12.9810, lng: 77.6040 },
        { lat: 12.9820, lng: 77.6050 },
        { lat: 12.9790, lng: 77.6020 }
      ]
    },
    capacityDetails: {
      maxOccupancy: 900,
      currentOccupancy: 700,
      crowdDensity: 78
    },
    sensors: {
      cameras: 7,
      temperature: 2,
      airQuality: 1,
      crowdCounters: 3
    },
    emergencyExits: [
      {
        id: "exit_5",
        location: { lat: 12.9800, lng: 77.6030 },
        status: "open"
      }
    ],
    lastUpdate: admin.firestore.FieldValue.serverTimestamp()
  }
];

// --- 3. Venue-related fields to add to top-level zones ---
const additionalZoneFields = {
  zone_a: {
    venueId: venueId,
    zoneId: "zone-1",
    area: 2500,
    capacity: 500,
    assignedGates: [0],
    risk: "none"
  },
  zone_b: {
    venueId: venueId,
    zoneId: "zone-2",
    area: 2500,
    capacity: 500,
    assignedGates: [1],
    risk: "none"
  },
  zone_c: {
    venueId: venueId,
    zoneId: "zone-3",
    area: 2500,
    capacity: 500,
    assignedGates: [2],
    risk: "none"
  }
};

// --- Main Setup Function ---
async function setupAllSampleData() {
  // 1. Set all original sample docs
  for (const [docPath, docData] of Object.entries(collectionsData)) {
    await db.doc(docPath).set(docData, { merge: true });
    console.log(`Initialized Firestore doc: ${docPath}`);
  }
  // 2. Create the venue document
  await db.collection('venues').doc(venueId).set(venueData, { merge: true });
  // 3. Add zones as subcollection
  const zonesCol = db.collection('venues').doc(venueId).collection('zones');
  for (const zone of zonesData) {
    await zonesCol.doc(zone.zoneId).set(zone, { merge: true });
    console.log(`Created zone: ${zone.zoneId} under venue: ${venueId}`);
  }
  // 4. Update top-level zones with venue fields (merge only)
  for (const [zoneKey, extraFields] of Object.entries(additionalZoneFields)) {
    const docRef = db.collection('zones').doc(zoneKey);
    await docRef.set(extraFields, { merge: true });
    console.log(`Updated zone: ${zoneKey} with venue fields.`);
  }
  console.log(`All sample data initialized.`);
}

// Export as a callable function
exports.setupAllSampleData = functions.https.onRequest(async (req, res) => {
  try {
    await setupAllSampleData();
    res.status(200).send('All sample data initialized successfully.');
  } catch (error) {
    console.error('Error initializing all sample data:', error);
    res.status(500).send('Error initializing all sample data.');
  }
});

// Cloud Function to setup database
exports.setupDatabase = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    console.log('🚀 Starting Firebase Firestore setup for Drishti Project...');

    let successCount = 0;
    let totalCount = Object.keys(collectionsData).length;
    const results = [];

    // Create main documents
    for (const [docPath, data] of Object.entries(collectionsData)) {
      try {
        const docRef = db.doc(docPath);
        await docRef.set(data);
        console.log(`✅ Created: ${docPath}`);
        results.push({ status: 'success', path: docPath });
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to create ${docPath}:`, error.message);
        results.push({ status: 'error', path: docPath, error: error.message });
      }
    }

    // Create subcollections
    console.log('📝 Creating subcollections...');
    
    try {
      // Incident notes
      await db.collection('incidents').doc('incident_001').collection('notes').add({
        content: "Fire alarm activated, evacuation in progress",
        author: { id: "user_001", name: "System Operator", role: "operator" },
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        type: "status_update"
      });

      await db.collection('incidents').doc('incident_001').collection('notes').add({
        content: "Fire department contacted, ETA 5 minutes",
        author: { id: "user_002", name: "Emergency Coordinator", role: "operator" },
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        type: "action_taken"
      });

      // Zone sensors
      await db.collection('zones').doc('zone_a').collection('sensors').add({
        type: "temperature",
        value: "26°C",
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: "active"
      });

      await db.collection('zones').doc('zone_a').collection('sensors').add({
        type: "air_quality",
        value: "Good",
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: "active"
      });

      console.log('✅ Subcollections created successfully!');
      results.push({ status: 'success', path: 'subcollections', message: 'Notes and sensors created' });
    } catch (error) {
      console.error('❌ Error creating subcollections:', error.message);
      results.push({ status: 'error', path: 'subcollections', error: error.message });
    }

    const response = {
      success: true,
      message: `🎉 Setup completed! ${successCount}/${totalCount} documents created successfully.`,
      results: results,
      summary: {
        total: totalCount,
        successful: successCount,
        failed: totalCount - successCount
      }
    };

    console.log(response.message);
    res.status(200).json(response);

  } catch (error) {
    console.error('❌ Error setting up Firebase collections:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to setup database'
    });
  }
});

// Cloud Function to reset database (optional)
exports.resetDatabase = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    console.log('🗑️ Starting database reset...');

    // Delete all documents in collections
    const collections = ['system_config', 'zones', 'responders', 'emergency_contacts', 'incidents'];
    
    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName).get();
      const batch = db.batch();
      
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      console.log(`🗑️ Deleted all documents in ${collectionName}`);
    }

    console.log('✅ Database reset completed!');
    res.status(200).json({
      success: true,
      message: 'Database reset completed successfully'
    });

  } catch (error) {
    console.error('❌ Error resetting database:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to reset database'
    });
  }
}); 