// Firebase Firestore Setup Script for Drishti Project
// Run this in Google Cloud Console CLI or Firebase Console

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc,
  serverTimestamp 
} = require('firebase/firestore');

// Your Firebase config (replace with your actual config)
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample data for collections
const sampleData = {
  // System Configuration
  system_config: {
    system: {
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
      incidentTypes: [
        "fire", "medical", "security", "panic", 
        "crowd", "environmental", "technical"
      ],
      responderTypes: [
        "Fire Brigade", "Medical", "Security", 
        "Police", "Ambulance", "Technical"
      ],
      lastUpdated: new Date()
    }
  },

  // Zones Collection
  zones: [
    {
      id: "zone_a",
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
        },
        {
          id: "exit_2", 
          location: {lat: 12.9726, lng: 77.5956},
          status: "open"
        }
      ],
      lastUpdate: new Date()
    },
    {
      id: "zone_b",
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
      lastUpdate: new Date()
    },
    {
      id: "zone_c",
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
        },
        {
          id: "exit_5",
          location: {lat: 12.9786, lng: 77.6016},
          status: "open"
        }
      ],
      lastUpdate: new Date()
    }
  ],

  // Responders Collection
  responders: [
    {
      id: "responder_001",
      name: "John Smith",
      type: "Fire Brigade",
      status: "available",
      vehicle: "Fire Truck 1",
      position: {
        lat: 12.9716,
        lng: 77.5946,
        lastUpdate: new Date()
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
      lastUpdate: new Date()
    },
    {
      id: "responder_002", 
      name: "Sarah Johnson",
      type: "Medical",
      status: "en_route",
      vehicle: "Ambulance 2",
      position: {
        lat: 12.9726,
        lng: 77.5956,
        lastUpdate: new Date()
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
      lastUpdate: new Date()
    },
    {
      id: "responder_003",
      name: "Mike Wilson", 
      type: "Security",
      status: "on_scene",
      vehicle: "Patrol Car 3",
      position: {
        lat: 12.9736,
        lng: 77.5966,
        lastUpdate: new Date()
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
      lastUpdate: new Date()
    }
  ],

  // Emergency Contacts Collection
  emergency_contacts: [
    {
      id: "contact_001",
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
    {
      id: "contact_002",
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
    {
      id: "contact_003",
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
    }
  ],

  // Incidents Collection
  incidents: [
    {
      id: "incident_001",
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
      timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
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
      lastUpdated: new Date(),
      resolvedAt: null
    },
    {
      id: "incident_002",
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
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
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
      lastUpdated: new Date(),
      resolvedAt: null
    },
    {
      id: "incident_003",
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
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
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
      lastUpdated: new Date(),
      resolvedAt: null
    }
  ]
};

// Function to create collections and add sample data
async function setupFirebaseCollections() {
  console.log('🚀 Starting Firebase Firestore setup for Drishti Project...\n');

  try {
    // 1. Create System Configuration
    console.log('📋 Creating System Configuration...');
    await setDoc(doc(db, 'system_config', 'system'), sampleData.system_config.system);
    console.log('✅ System Configuration created successfully\n');

    // 2. Create Zones
    console.log('🏢 Creating Zones...');
    for (const zone of sampleData.zones) {
      await setDoc(doc(db, 'zones', zone.id), zone);
    }
    console.log(`✅ ${sampleData.zones.length} Zones created successfully\n`);

    // 3. Create Responders
    console.log('👨‍🚒 Creating Responders...');
    for (const responder of sampleData.responders) {
      await setDoc(doc(db, 'responders', responder.id), responder);
    }
    console.log(`✅ ${sampleData.responders.length} Responders created successfully\n`);

    // 4. Create Emergency Contacts
    console.log('📞 Creating Emergency Contacts...');
    for (const contact of sampleData.emergency_contacts) {
      await setDoc(doc(db, 'emergency_contacts', contact.id), contact);
    }
    console.log(`✅ ${sampleData.emergency_contacts.length} Emergency Contacts created successfully\n`);

    // 5. Create Incidents
    console.log('🚨 Creating Incidents...');
    for (const incident of sampleData.incidents) {
      await setDoc(doc(db, 'incidents', incident.id), incident);
    }
    console.log(`✅ ${sampleData.incidents.length} Incidents created successfully\n`);

    // 6. Create Subcollections for Incidents
    console.log('📝 Creating Incident Subcollections...');
    
    // Sample notes for incident_001
    const incident1Notes = [
      {
        content: "Fire alarm activated, evacuation in progress",
        author: { id: "user_001", name: "System Operator", role: "operator" },
        timestamp: new Date(Date.now() - 8 * 60 * 1000),
        type: "status_update"
      },
      {
        content: "Fire department contacted, ETA 5 minutes",
        author: { id: "user_002", name: "Emergency Coordinator", role: "operator" },
        timestamp: new Date(Date.now() - 7 * 60 * 1000),
        type: "action_taken"
      }
    ];

    for (const note of incident1Notes) {
      await addDoc(collection(db, 'incidents', 'incident_001', 'notes'), note);
    }

    // Sample media for incident_001
    const incident1Media = [
      {
        type: "image",
        filename: "fire_evidence_001.jpg",
        url: "https://storage.googleapis.com/drishti-media/fire_evidence_001.jpg",
        metadata: {
          size: 2048576,
          format: "jpg",
          resolution: "1920x1080"
        },
        uploadedBy: "user_001",
        uploadedAt: new Date(Date.now() - 9 * 60 * 1000),
        tags: ["evidence", "fire", "smoke"],
        isPublic: false
      }
    ];

    for (const media of incident1Media) {
      await addDoc(collection(db, 'incidents', 'incident_001', 'media'), media);
    }

    console.log('✅ Incident Subcollections created successfully\n');

    // 7. Create Zone Subcollections
    console.log('📡 Creating Zone Subcollections...');
    
    // Sample sensors for Zone A
    const zoneASensors = [
      {
        type: "temperature",
        value: "26°C",
        timestamp: new Date(),
        status: "active"
      },
      {
        type: "air_quality",
        value: "Good",
        timestamp: new Date(),
        status: "active"
      },
      {
        type: "crowd_counter",
        value: 750,
        timestamp: new Date(),
        status: "active"
      }
    ];

    for (const sensor of zoneASensors) {
      await addDoc(collection(db, 'zones', 'zone_a', 'sensors'), sensor);
    }

    console.log('✅ Zone Subcollections created successfully\n');

    console.log('🎉 Firebase Firestore setup completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • System Configuration: 1 document`);
    console.log(`   • Zones: ${sampleData.zones.length} documents`);
    console.log(`   • Responders: ${sampleData.responders.length} documents`);
    console.log(`   • Emergency Contacts: ${sampleData.emergency_contacts.length} documents`);
    console.log(`   • Incidents: ${sampleData.incidents.length} documents`);
    console.log(`   • Incident Notes: ${incident1Notes.length} documents`);
    console.log(`   • Incident Media: ${incident1Media.length} documents`);
    console.log(`   • Zone Sensors: ${zoneASensors.length} documents`);

  } catch (error) {
    console.error('❌ Error setting up Firebase collections:', error);
    throw error;
  }
}

// Function to create security rules
function createSecurityRules() {
  const securityRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // System configuration - read only for authenticated users
    match /system_config/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Zones - read for authenticated users, write for operators and admins
    match /zones/{zoneId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'operator'];
      
      // Zone subcollections
      match /sensors/{sensorId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null && 
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'operator'];
      }
    }
    
    // Responders - read for authenticated users, write for operators and admins
    match /responders/{responderId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'operator'];
    }
    
    // Emergency contacts - read for authenticated users, write for admins only
    match /emergency_contacts/{contactId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Incidents - read for authenticated users, write for operators and admins
    match /incidents/{incidentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'operator'];
      
      // Incident subcollections
      match /notes/{noteId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null && 
          (resource.data.author.id == request.auth.uid || 
           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'operator']);
      }
      
      match /media/{mediaId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null && 
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'operator'];
      }
    }
    
    // Users - users can read/write their own data, admins can read all
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Analytics - read for authenticated users, write for admins only
    match /analytics/{analyticsId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}`;

  return securityRules;
}

// Export functions for use
module.exports = {
  setupFirebaseCollections,
  createSecurityRules,
  sampleData
};

// Run setup if this file is executed directly
if (require.main === module) {
  setupFirebaseCollections()
    .then(() => {
      console.log('\n🔐 Security Rules:');
      console.log(createSecurityRules());
      console.log('\n📝 Instructions:');
      console.log('1. Copy the security rules above to your Firebase Console');
      console.log('2. Go to Firestore Database > Rules');
      console.log('3. Replace the existing rules with the ones above');
      console.log('4. Publish the rules');
    })
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
} 