const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

async function setupAgentDatabase() {
  // 1. System Config
  await db.collection('system_config').doc('system').set({
    version: "2.0.0",
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
  });

  // 2. Zones
  await db.collection('zones').doc('zone_a').set({
    name: "Main Hall",
    status: "active",
    riskScore: 4,
    capacity: 500,
    currentOccupancy: 320,
    lastUpdate: admin.firestore.FieldValue.serverTimestamp()
  });
  await db.collection('zones').doc('zone_b').set({
    name: "Conference Room",
    status: "active",
    riskScore: 2,
    capacity: 200,
    currentOccupancy: 120,
    lastUpdate: admin.firestore.FieldValue.serverTimestamp()
  });
  await db.collection('zones').doc('zone_c').set({
    name: "Parking Lot",
    status: "active",
    riskScore: 1,
    capacity: 300,
    currentOccupancy: 80,
    lastUpdate: admin.firestore.FieldValue.serverTimestamp()
  });

  // 3. Responders
  await db.collection('responders').doc('responder_001').set({
    name: "John Smith",
    type: "Fire Brigade",
    vehicle: "Fire Truck 1",
    position: { lat: 12.9716, lng: 77.5946, lastUpdate: admin.firestore.FieldValue.serverTimestamp() },
    contact: { phone: "+91-9876543210", radio: "Channel 1", email: "john.smith@fire.gov" },
    equipment: { batteryLevel: 85, signalStrength: 4, medicalKit: true, defibrillator: false },
    experience: "8 years",
    specializations: ["Fire Suppression", "Rescue Operations"],
    lastUpdate: admin.firestore.FieldValue.serverTimestamp()
  });
  await db.collection('responder_status_updates').add({
    responderId: "responder_001",
    status: "available",
    action: "initialized",
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    location: { lat: 12.9716, lng: 77.5946 }
  });

  await db.collection('responders').doc('responder_002').set({
    name: "Sarah Johnson",
    type: "Medical",
    vehicle: "Ambulance 2",
    position: { lat: 12.9726, lng: 77.5956, lastUpdate: admin.firestore.FieldValue.serverTimestamp() },
    contact: { phone: "+91-9876543211", radio: "Channel 2", email: "sarah.johnson@medical.gov" },
    equipment: { batteryLevel: 92, signalStrength: 5, medicalKit: true, defibrillator: true },
    experience: "5 years",
    specializations: ["Emergency Medicine", "Trauma Care"],
    lastUpdate: admin.firestore.FieldValue.serverTimestamp()
  });
  await db.collection('responder_status_updates').add({
    responderId: "responder_002",
    status: "en_route",
    action: "initialized",
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    location: { lat: 12.9726, lng: 77.5956 }
  });

  await db.collection('responders').doc('responder_003').set({
    name: "Mike Wilson",
    type: "Security",
    vehicle: "Patrol Car 3",
    position: { lat: 12.9736, lng: 77.5966, lastUpdate: admin.firestore.FieldValue.serverTimestamp() },
    contact: { phone: "+91-9876543212", radio: "Channel 3", email: "mike.wilson@security.gov" },
    equipment: { batteryLevel: 78, signalStrength: 3, medicalKit: false, defibrillator: false },
    experience: "12 years",
    specializations: ["Crowd Control", "Surveillance"],
    lastUpdate: admin.firestore.FieldValue.serverTimestamp()
  });
  await db.collection('responder_status_updates').add({
    responderId: "responder_003",
    status: "on_scene",
    action: "initialized",
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    location: { lat: 12.9736, lng: 77.5966 }
  });

  // 4. Emergency Contacts
  await db.collection('emergency_contacts').doc('contact_001').set({
    name: "Fire Department",
    type: "fire",
    contact: { phone: "+91-9876543200", email: "fire@emergency.gov", radio: "Channel 1" },
    priority: 1,
    responseTime: "5 min",
    specializations: ["Fire Suppression", "Rescue"],
    availability: "24/7",
    location: { address: "123 Emergency St, City", lat: 12.9716, lng: 77.5946 },
    isActive: true
  });
  await db.collection('emergency_contacts').doc('contact_002').set({
    name: "Medical Emergency",
    type: "medical",
    contact: { phone: "+91-9876543201", email: "medical@emergency.gov", radio: "Channel 2" },
    priority: 1,
    responseTime: "7 min",
    specializations: ["Emergency Medicine", "Trauma Care"],
    availability: "24/7",
    location: { address: "456 Medical Ave, City", lat: 12.9726, lng: 77.5956 },
    isActive: true
  });
  await db.collection('emergency_contacts').doc('contact_003').set({
    name: "Police Department",
    type: "police",
    contact: { phone: "+91-9876543202", email: "police@emergency.gov", radio: "Channel 3" },
    priority: 2,
    responseTime: "10 min",
    specializations: ["Law Enforcement", "Crowd Control"],
    availability: "24/7",
    location: { address: "789 Police Rd, City", lat: 12.9736, lng: 77.5966 },
    isActive: true
  });

  // 5. Incidents
  await db.collection('incidents').doc('incident_001').set({
    type: "fire",
    status: "active",
    priority: "critical",
    severity: 5,
    zoneId: "zone_a",
    location: { lat: 12.9716, lng: 77.5946, address: "Main Hall, Zone A" },
    description: "Electrical fire detected in main hall, smoke visible from multiple exits",
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    reportedBy: "user_001",
    assignedResponderId: "responder_001",
    assignmentTransactionId: "txn_001",
    environmentalData: { temperature: "28°C", humidity: "70%", windSpeed: "8 km/h", visibility: "Poor", airQuality: "Poor" },
    crowdData: { density: 85, evacuated: 150, remaining: 200 },
    equipment: ["Fire Extinguishers", "Smoke Detectors", "Emergency Lighting"],
    tags: ["electrical", "smoke", "evacuation"],
    media: { cameras: 6, recordings: 4, photos: 12 },
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    resolvedAt: null
  });
  await db.collection('incidents').doc('incident_002').set({
    type: "medical",
    status: "ongoing",
    priority: "high",
    severity: 4,
    zoneId: "zone_b",
    location: { lat: 12.9746, lng: 77.5976, address: "Conference Room, Zone B" },
    description: "Medical emergency - person collapsed, requires immediate attention",
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    reportedBy: "user_002",
    assignedResponderId: "responder_002",
    assignmentTransactionId: "txn_002",
    environmentalData: { temperature: "24°C", humidity: "60%", windSpeed: "3 km/h", visibility: "Good", airQuality: "Good" },
    crowdData: { density: 45, evacuated: 20, remaining: 80 },
    equipment: ["First Aid Kit", "Defibrillator", "Medical Supplies"],
    tags: ["medical", "emergency", "first-aid"],
    media: { cameras: 3, recordings: 2, photos: 5 },
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    resolvedAt: null
  });
  await db.collection('incidents').doc('incident_003').set({
    type: "crowd",
    status: "investigating",
    priority: "medium",
    severity: 3,
    zoneId: "zone_c",
    location: { lat: 12.9756, lng: 77.5986, address: "Parking Lot" },
    description: "Crowd gathering detected in parking lot, monitoring for escalation",
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    reportedBy: "user_003",
    assignedResponderId: "responder_003",
    assignmentTransactionId: "txn_003",
    environmentalData: { temperature: "30°C", humidity: "50%", windSpeed: "5 km/h", visibility: "Good", airQuality: "Moderate" },
    crowdData: { density: 120, evacuated: 0, remaining: 120 },
    equipment: ["Barricades", "CCTV"],
    tags: ["crowd", "monitoring"],
    media: { cameras: 2, recordings: 1, photos: 3 },
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    resolvedAt: null
  });

  // 6. Events
  await db.collection('events').add({
    type: "critical_alert",
    source: "crowd_safety_agent",
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    payload: { incidentId: "incident_001", severity: 5, description: "Critical fire detected in Main Hall" },
    status: "new"
  });
  await db.collection('events').add({
    type: "zone_status",
    source: "zone_monitor",
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    payload: { zoneId: "zone_b", status: "active", riskScore: 2 },
    status: "new"
  });
  await db.collection('events').add({
    type: "responder_status_update",
    source: "dispatcher_agent",
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    payload: { responderId: "responder_002", status: "en_route" },
    status: "new"
  });

  // 7. Alerts
  await db.collection('alerts').add({
    zoneId: "zone_a",
    alertType: "high_risk",
    severity: 5,
    description: "High risk detected in Main Hall",
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    status: "active"
  });
  await db.collection('alerts').add({
    zoneId: "zone_b",
    alertType: "medical",
    severity: 4,
    description: "Medical emergency in Conference Room",
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    status: "active"
  });
  await db.collection('alerts').add({
    zoneId: "zone_c",
    alertType: "crowd",
    severity: 3,
    description: "Crowd gathering in Parking Lot",
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    status: "active"
  });

  // 8. Logs
  await db.collection('logs').add({
    agent: "situational_summary",
    action: "generated_summary",
    input: "...",
    output: "...",
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });
  await db.collection('logs').add({
    agent: "escalation",
    action: "escalated_alert",
    input: "Critical fire detected in Main Hall",
    output: "Alert sent to Police/Fire/EMS",
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });
  await db.collection('logs').add({
    agent: "notification",
    action: "notified_attendees",
    input: "Medical emergency in Conference Room",
    output: "Alert sent to all attendees in zone_b",
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });

  // 9. Responder Status Updates
  await db.collection('responder_status_updates').add({
    responderId: "responder_001",
    status: "en_route",
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    location: { lat: 12.9716, lng: 77.5946 }
  });
  await db.collection('responder_status_updates').add({
    responderId: "responder_002",
    status: "on_scene",
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    location: { lat: 12.9726, lng: 77.5956 }
  });
  await db.collection('responder_status_updates').add({
    responderId: "responder_003",
    status: "investigating",
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    location: { lat: 12.9736, lng: 77.5966 }
  });

  // 10. Incident Reports (Each document is a single incident)
  const incidentSeeds = [
    {
      type: 'fire', severity: 5, description: 'Major electrical fire, rapid response required', timestamp: new Date('2023-12-01T10:15:00Z'), resolved: true, response_time: '3 min', venue_id: 'venue_a', zone_id: 'zone_a', confidence_score: 0.92, feedback_rating: 5, responder_feedback: 'Excellent coordination, fire contained quickly'
    },
    {
      type: 'crowd', severity: 3, description: 'Crowd congestion at main entrance', timestamp: new Date('2023-12-01T12:30:00Z'), resolved: true, response_time: '5 min', venue_id: 'venue_a', zone_id: 'zone_a', confidence_score: 0.90, feedback_rating: 4, responder_feedback: 'Crowd dispersed efficiently'
    },
    {
      type: 'medical', severity: 4, description: 'Medical emergency, fainted attendee', timestamp: new Date('2023-12-01T14:00:00Z'), resolved: true, response_time: '2 min', venue_id: 'venue_a', zone_id: 'zone_b', confidence_score: 0.93, feedback_rating: 5, responder_feedback: 'Patient stabilized and transported'
    },
    {
      type: 'security', severity: 2, description: 'Suspicious activity reported', timestamp: new Date('2023-12-01T16:45:00Z'), resolved: true, response_time: '8 min', venue_id: 'venue_a', zone_id: 'zone_b', confidence_score: 0.88, feedback_rating: 3, responder_feedback: 'False alarm, area secured'
    },
    {
      type: 'security', severity: 2, description: 'Unauthorized access detected', timestamp: new Date('2023-12-02T09:45:00Z'), resolved: true, response_time: '4 min', venue_id: 'venue_b', zone_id: 'zone_c', confidence_score: 0.85, feedback_rating: 4, responder_feedback: 'Access point secured, investigation ongoing'
    },
    {
      type: 'environmental', severity: 1, description: 'Minor water leakage reported', timestamp: new Date('2023-12-02T11:20:00Z'), resolved: true, response_time: '15 min', venue_id: 'venue_b', zone_id: 'zone_c', confidence_score: 0.80, feedback_rating: 3, responder_feedback: 'Leak contained, maintenance notified'
    },
    {
      type: 'technical', severity: 3, description: 'Temporary power outage', timestamp: new Date('2023-12-02T13:10:00Z'), resolved: true, response_time: '12 min', venue_id: 'venue_b', zone_id: 'zone_d', confidence_score: 0.87, feedback_rating: 4, responder_feedback: 'Power restored, backup systems activated'
    },
    {
      type: 'panic', severity: 4, description: 'Crowd panic due to false alarm', timestamp: new Date('2023-12-02T15:30:00Z'), resolved: true, response_time: '6 min', venue_id: 'venue_b', zone_id: 'zone_d', confidence_score: 0.89, feedback_rating: 5, responder_feedback: 'Crowd calmed, situation explained'
    },
    {
      type: 'crowd', severity: 3, description: 'Large crowd gathering in parking area', timestamp: new Date('2023-12-03T10:00:00Z'), resolved: true, response_time: '7 min', venue_id: 'venue_c', zone_id: 'zone_e', confidence_score: 0.78, feedback_rating: 3, responder_feedback: 'Crowd managed, traffic flow restored'
    },
    {
      type: 'medical', severity: 5, description: 'Critical medical emergency - cardiac arrest', timestamp: new Date('2023-12-03T12:15:00Z'), resolved: true, response_time: '1 min', venue_id: 'venue_c', zone_id: 'zone_e', confidence_score: 0.95, feedback_rating: 5, responder_feedback: 'CPR initiated, ambulance arrived quickly'
    },
    {
      type: 'fire', severity: 2, description: 'Small electrical fire in equipment room', timestamp: new Date('2023-12-03T14:30:00Z'), resolved: true, response_time: '5 min', venue_id: 'venue_c', zone_id: 'zone_f', confidence_score: 0.82, feedback_rating: 4, responder_feedback: 'Fire extinguished, area ventilated'
    },
    {
      type: 'environmental', severity: 2, description: 'Poor air quality detected', timestamp: new Date('2023-12-03T16:45:00Z'), resolved: true, response_time: '10 min', venue_id: 'venue_c', zone_id: 'zone_f', confidence_score: 0.80, feedback_rating: 2, responder_feedback: 'Ventilation improved, air quality restored'
    },
    {
      type: 'technical', severity: 1, description: 'Communication system malfunction', timestamp: new Date('2023-12-03T18:20:00Z'), resolved: true, response_time: '20 min', venue_id: 'venue_c', zone_id: 'zone_f', confidence_score: 0.77, feedback_rating: 2, responder_feedback: 'System rebooted, communications restored'
    },
    {
      type: 'security', severity: 4, description: 'Security breach - unauthorized person in restricted area', timestamp: new Date('2023-12-04T08:30:00Z'), resolved: true, response_time: '3 min', venue_id: 'venue_d', zone_id: 'zone_g', confidence_score: 0.88, feedback_rating: 5, responder_feedback: 'Intruder apprehended, area secured'
    },
    {
      type: 'medical', severity: 3, description: 'Injury from fall', timestamp: new Date('2023-12-04T11:00:00Z'), resolved: true, response_time: '4 min', venue_id: 'venue_d', zone_id: 'zone_g', confidence_score: 0.85, feedback_rating: 4, responder_feedback: 'First aid provided, medical attention given'
    },
    {
      type: 'crowd', severity: 2, description: 'Minor crowd disturbance', timestamp: new Date('2023-12-04T13:45:00Z'), resolved: true, response_time: '6 min', venue_id: 'venue_d', zone_id: 'zone_g', confidence_score: 0.80, feedback_rating: 3, responder_feedback: 'Situation de-escalated, crowd dispersed'
    },
    {
      type: 'fire', severity: 4, description: 'Kitchen fire in food court', timestamp: new Date('2023-12-05T12:00:00Z'), resolved: true, response_time: '2 min', venue_id: 'venue_e', zone_id: 'zone_h', confidence_score: 0.95, feedback_rating: 5, responder_feedback: 'Fire contained, kitchen evacuated safely'
    },
    {
      type: 'medical', severity: 2, description: 'Minor allergic reaction', timestamp: new Date('2023-12-05T14:30:00Z'), resolved: true, response_time: '3 min', venue_id: 'venue_e', zone_id: 'zone_h', confidence_score: 0.90, feedback_rating: 4, responder_feedback: 'Patient treated, condition stable'
    },
    {
      type: 'technical', severity: 2, description: 'HVAC system malfunction', timestamp: new Date('2023-12-05T16:15:00Z'), resolved: true, response_time: '25 min', venue_id: 'venue_e', zone_id: 'zone_h', confidence_score: 0.92, feedback_rating: 5, responder_feedback: 'System repaired, temperature normalized'
    }
  ];
  for (const incident of incidentSeeds) {
    await db.collection('incident_reports').add({
      ...incident,
      generated_at: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  console.log('Agent database setup complete!');
}

setupAgentDatabase().then(() => process.exit(0)); 