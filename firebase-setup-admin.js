// Firebase Firestore Setup Script using Firebase Admin SDK
// Run this with: node firebase-setup-admin.js

const admin = require('firebase-admin');

// Initialize Firebase Admin (you'll need to download your service account key)
// Download from: Firebase Console > Project Settings > Service Accounts > Generate New Private Key

// Option 1: Using service account key file
const serviceAccount = require('./path-to-your-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'project-drishti-mvp-31f1b'
});

const db = admin.firestore();

// Sample data for collections
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

  // Zones
  'zones/zone_a': {
    name: "Zone A",
    status: "normal",
    boundaries: {
      coordinates: [
        {lat: 12.9716, lng: 77.5946},
        {lat: 12.9726, lng: 77.5956},
        {lat: 12.9736, lng: 77.5966},
        {lat: 12.9706, lng: 77.5936}
      ]
    },
    capacity: {
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
        location: {lat: 12.9716, lng: 77.5946},
        status: "open"
      }
    ],
    lastUpdate: admin.firestore.FieldValue.serverTimestamp()
  },

  'zones/zone_b': {
    name: "Zone B",
    status: "active",
    boundaries: {
      coordinates: [
        {lat: 12.9746, lng: 77.5976},
        {lat: 12.9756, lng: 77.5986},
        {lat: 12.9766, lng: 77.5996},
        {lat: 12.9736, lng: 77.5966}
      ]
    },
    capacity: {
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
        location: {lat: 12.9746, lng: 77.5976},
        status: "open"
      }
    ],
    lastUpdate: admin.firestore.FieldValue.serverTimestamp()
  },

  'zones/zone_c': {
    name: "Zone C",
    status: "critical",
    boundaries: {
      coordinates: [
        {lat: 12.9776, lng: 77.6006},
        {lat: 12.9786, lng: 77.6016},
        {lat: 12.9796, lng: 77.6026},
        {lat: 12.9766, lng: 77.5996}
      ]
    },
    capacity: {
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
        location: {lat: 12.9776, lng: 77.6006},
        status: "blocked"
      }
    ],
    lastUpdate: admin.firestore.FieldValue.serverTimestamp()
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
    zone: "Zone A",
    location: {
      lat: 12.9716,
      lng: 77.5946,
      address: "Main Hall, Zone A"
    },
    description: "Electrical fire detected in main hall, smoke visible from multiple exits",
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    reportedBy: "user_001",
    assignedResponder: {
      id: "responder_001",
      name: "John Smith",
      type: "Fire Brigade",
      eta: "2 min",
      status: "en_route"
    },
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
      remaining: 200,
      total: 350
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
    zone: "Zone B",
    location: {
      lat: 12.9746,
      lng: 77.5976,
      address: "Conference Room, Zone B"
    },
    description: "Medical emergency - person collapsed, requires immediate attention",
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    reportedBy: "user_002",
    assignedResponder: {
      id: "responder_002",
      name: "Sarah Johnson",
      type: "Medical",
      eta: "1 min",
      status: "en_route"
    },
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
      remaining: 80,
      total: 100
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
    zone: "Zone C",
    location: {
      lat: 12.9776,
      lng: 77.6006,
      address: "Parking Area, Zone C"
    },
    description: "Large crowd gathering, potential safety concern",
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    reportedBy: "user_003",
    assignedResponder: {
      id: "responder_003",
      name: "Mike Wilson",
      type: "Security",
      eta: "0 min",
      status: "on_scene"
    },
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
      remaining: 1050,
      total: 1100
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
  }
};

// Function to create collections and documents
async function setupFirebaseCollections() {
  console.log('🚀 Starting Firebase Firestore setup for Drishti Project...\n');

  try {
    let successCount = 0;
    let totalCount = Object.keys(collectionsData).length;

    for (const [docPath, data] of Object.entries(collectionsData)) {
      try {
        const docRef = db.doc(docPath);
        await docRef.set(data);
        console.log(`✅ Created: ${docPath}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to create ${docPath}:`, error.message);
      }
    }

    console.log(`\n🎉 Setup completed! ${successCount}/${totalCount} documents created successfully.`);

    // Create subcollections
    console.log('\n📝 Creating subcollections...');
    
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

  } catch (error) {
    console.error('❌ Error setting up Firebase collections:', error);
    throw error;
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupFirebaseCollections()
    .then(() => {
      console.log('\n🔐 Next Steps:');
      console.log('1. Set up Firestore Security Rules in Firebase Console');
      console.log('2. Test the collections with your application');
      console.log('3. Configure authentication if needed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupFirebaseCollections }; 