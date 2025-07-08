#!/bin/bash

# Firebase Firestore Setup Commands for Google Cloud Console CLI
# Run these commands in Google Cloud Console or locally with gcloud CLI

echo "🚀 Setting up Firebase Firestore collections for Drishti Project..."

# Set your project ID (replace with your actual project ID)
PROJECT_ID="project-drishti-mvp-31f1b"
gcloud config set project $PROJECT_ID

echo "📋 Creating System Configuration..."

# System Configuration
gcloud firestore documents create system_config/system --data='{
  "version": "1.0.0",
  "settings": {
    "maxIncidentSeverity": 5,
    "defaultResponseTime": "5 min",
    "autoEscalationThreshold": 10,
    "notificationChannels": ["email", "push", "sms"]
  },
  "zones": {
    "defaultZone": "Zone A",
    "zoneTypes": ["indoor", "outdoor", "parking", "hall"]
  },
  "incidentTypes": ["fire", "medical", "security", "panic", "crowd", "environmental", "technical"],
  "responderTypes": ["Fire Brigade", "Medical", "Security", "Police", "Ambulance", "Technical"],
  "lastUpdated": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
}'

echo "🏢 Creating Zones..."

# Zone A
gcloud firestore documents create zones/zone_a --data='{
  "name": "Zone A",
  "status": "normal",
  "boundaries": {
    "coordinates": [
      {"lat": 12.9716, "lng": 77.5946},
      {"lat": 12.9726, "lng": 77.5956},
      {"lat": 12.9736, "lng": 77.5966},
      {"lat": 12.9706, "lng": 77.5936}
    ]
  },
  "capacity": {
    "maxOccupancy": 1000,
    "currentOccupancy": 750,
    "crowdDensity": 75
  },
  "sensors": {
    "cameras": 8,
    "temperature": 2,
    "airQuality": 1,
    "crowdCounters": 4
  },
  "emergencyExits": [
    {
      "id": "exit_1",
      "location": {"lat": 12.9716, "lng": 77.5946},
      "status": "open"
    }
  ],
  "lastUpdate": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
}'

# Zone B
gcloud firestore documents create zones/zone_b --data='{
  "name": "Zone B",
  "status": "active",
  "boundaries": {
    "coordinates": [
      {"lat": 12.9746, "lng": 77.5976},
      {"lat": 12.9756, "lng": 77.5986},
      {"lat": 12.9766, "lng": 77.5996},
      {"lat": 12.9736, "lng": 77.5966}
    ]
  },
  "capacity": {
    "maxOccupancy": 800,
    "currentOccupancy": 600,
    "crowdDensity": 65
  },
  "sensors": {
    "cameras": 6,
    "temperature": 1,
    "airQuality": 1,
    "crowdCounters": 3
  },
  "emergencyExits": [
    {
      "id": "exit_3",
      "location": {"lat": 12.9746, "lng": 77.5976},
      "status": "open"
    }
  ],
  "lastUpdate": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
}'

# Zone C
gcloud firestore documents create zones/zone_c --data='{
  "name": "Zone C",
  "status": "critical",
  "boundaries": {
    "coordinates": [
      {"lat": 12.9776, "lng": 77.6006},
      {"lat": 12.9786, "lng": 77.6016},
      {"lat": 12.9796, "lng": 77.6026},
      {"lat": 12.9766, "lng": 77.5996}
    ]
  },
  "capacity": {
    "maxOccupancy": 1200,
    "currentOccupancy": 1100,
    "crowdDensity": 92
  },
  "sensors": {
    "cameras": 10,
    "temperature": 3,
    "airQuality": 2,
    "crowdCounters": 5
  },
  "emergencyExits": [
    {
      "id": "exit_4",
      "location": {"lat": 12.9776, "lng": 77.6006},
      "status": "blocked"
    }
  ],
  "lastUpdate": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
}'

echo "👨‍🚒 Creating Responders..."

# Responder 001
gcloud firestore documents create responders/responder_001 --data='{
  "name": "John Smith",
  "type": "Fire Brigade",
  "status": "available",
  "vehicle": "Fire Truck 1",
  "position": {
    "lat": 12.9716,
    "lng": 77.5946,
    "lastUpdate": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  },
  "contact": {
    "phone": "+91-9876543210",
    "radio": "Channel 1",
    "email": "john.smith@fire.gov"
  },
  "equipment": {
    "batteryLevel": 85,
    "signalStrength": 4,
    "medicalKit": true,
    "defibrillator": false
  },
  "assignedIncident": null,
  "eta": null,
  "speed": "0 km/h",
  "experience": "8 years",
  "specializations": ["Fire Suppression", "Rescue Operations"],
  "lastUpdate": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
}'

# Responder 002
gcloud firestore documents create responders/responder_002 --data='{
  "name": "Sarah Johnson",
  "type": "Medical",
  "status": "en_route",
  "vehicle": "Ambulance 2",
  "position": {
    "lat": 12.9726,
    "lng": 77.5956,
    "lastUpdate": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  },
  "contact": {
    "phone": "+91-9876543211",
    "radio": "Channel 2",
    "email": "sarah.johnson@medical.gov"
  },
  "equipment": {
    "batteryLevel": 92,
    "signalStrength": 5,
    "medicalKit": true,
    "defibrillator": true
  },
  "assignedIncident": "incident_001",
  "eta": "3 min",
  "speed": "45 km/h",
  "experience": "5 years",
  "specializations": ["Emergency Medicine", "Trauma Care"],
  "lastUpdate": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
}'

# Responder 003
gcloud firestore documents create responders/responder_003 --data='{
  "name": "Mike Wilson",
  "type": "Security",
  "status": "on_scene",
  "vehicle": "Patrol Car 3",
  "position": {
    "lat": 12.9736,
    "lng": 77.5966,
    "lastUpdate": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  },
  "contact": {
    "phone": "+91-9876543212",
    "radio": "Channel 3",
    "email": "mike.wilson@security.gov"
  },
  "equipment": {
    "batteryLevel": 78,
    "signalStrength": 3,
    "medicalKit": false,
    "defibrillator": false
  },
  "assignedIncident": "incident_002",
  "eta": "0 min",
  "speed": "0 km/h",
  "experience": "12 years",
  "specializations": ["Crowd Control", "Surveillance"],
  "lastUpdate": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
}'

echo "📞 Creating Emergency Contacts..."

# Emergency Contact 001
gcloud firestore documents create emergency_contacts/contact_001 --data='{
  "name": "Fire Department",
  "type": "fire",
  "contact": {
    "phone": "+91-9876543200",
    "email": "fire@emergency.gov",
    "radio": "Channel 1"
  },
  "priority": 1,
  "responseTime": "5 min",
  "specializations": ["Fire Suppression", "Rescue"],
  "availability": "24/7",
  "location": {
    "address": "123 Emergency St, City",
    "lat": 12.9716,
    "lng": 77.5946
  },
  "isActive": true
}'

# Emergency Contact 002
gcloud firestore documents create emergency_contacts/contact_002 --data='{
  "name": "Medical Emergency",
  "type": "medical",
  "contact": {
    "phone": "+91-9876543201",
    "email": "medical@emergency.gov",
    "radio": "Channel 2"
  },
  "priority": 1,
  "responseTime": "7 min",
  "specializations": ["Emergency Medicine", "Trauma Care"],
  "availability": "24/7",
  "location": {
    "address": "456 Medical Ave, City",
    "lat": 12.9726,
    "lng": 77.5956
  },
  "isActive": true
}'

# Emergency Contact 003
gcloud firestore documents create emergency_contacts/contact_003 --data='{
  "name": "Police Department",
  "type": "police",
  "contact": {
    "phone": "+91-9876543202",
    "email": "police@emergency.gov",
    "radio": "Channel 3"
  },
  "priority": 2,
  "responseTime": "10 min",
  "specializations": ["Law Enforcement", "Crowd Control"],
  "availability": "24/7",
  "location": {
    "address": "789 Police Rd, City",
    "lat": 12.9736,
    "lng": 77.5966
  },
  "isActive": true
}'

echo "🚨 Creating Incidents..."

# Incident 001
gcloud firestore documents create incidents/incident_001 --data='{
  "type": "fire",
  "status": "active",
  "priority": "critical",
  "severity": 5,
  "zone": "Zone A",
  "location": {
    "lat": 12.9716,
    "lng": 77.5946,
    "address": "Main Hall, Zone A"
  },
  "description": "Electrical fire detected in main hall, smoke visible from multiple exits",
  "timestamp": "'$(date -u -d '10 minutes ago' +%Y-%m-%dT%H:%M:%SZ)'",
  "reportedBy": "user_001",
  "assignedResponder": {
    "id": "responder_001",
    "name": "John Smith",
    "type": "Fire Brigade",
    "eta": "2 min",
    "status": "en_route"
  },
  "environmentalData": {
    "temperature": "28°C",
    "humidity": "70%",
    "windSpeed": "8 km/h",
    "visibility": "Poor",
    "airQuality": "Poor"
  },
  "crowdData": {
    "density": 85,
    "evacuated": 150,
    "remaining": 200,
    "total": 350
  },
  "equipment": ["Fire Extinguishers", "Smoke Detectors", "Emergency Lighting"],
  "tags": ["electrical", "smoke", "evacuation"],
  "media": {
    "cameras": 6,
    "recordings": 4,
    "photos": 12
  },
  "lastUpdated": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
  "resolvedAt": null
}'

# Incident 002
gcloud firestore documents create incidents/incident_002 --data='{
  "type": "medical",
  "status": "ongoing",
  "priority": "high",
  "severity": 4,
  "zone": "Zone B",
  "location": {
    "lat": 12.9746,
    "lng": 77.5976,
    "address": "Conference Room, Zone B"
  },
  "description": "Medical emergency - person collapsed, requires immediate attention",
  "timestamp": "'$(date -u -d '5 minutes ago' +%Y-%m-%dT%H:%M:%SZ)'",
  "reportedBy": "user_002",
  "assignedResponder": {
    "id": "responder_002",
    "name": "Sarah Johnson",
    "type": "Medical",
    "eta": "1 min",
    "status": "en_route"
  },
  "environmentalData": {
    "temperature": "24°C",
    "humidity": "60%",
    "windSpeed": "3 km/h",
    "visibility": "Good",
    "airQuality": "Good"
  },
  "crowdData": {
    "density": 45,
    "evacuated": 20,
    "remaining": 80,
    "total": 100
  },
  "equipment": ["First Aid Kit", "Defibrillator", "Medical Supplies"],
  "tags": ["medical", "emergency", "first-aid"],
  "media": {
    "cameras": 3,
    "recordings": 2,
    "photos": 5
  },
  "lastUpdated": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
  "resolvedAt": null
}'

# Incident 003
gcloud firestore documents create incidents/incident_003 --data='{
  "type": "crowd",
  "status": "investigating",
  "priority": "medium",
  "severity": 3,
  "zone": "Zone C",
  "location": {
    "lat": 12.9776,
    "lng": 77.6006,
    "address": "Parking Area, Zone C"
  },
  "description": "Large crowd gathering, potential safety concern",
  "timestamp": "'$(date -u -d '15 minutes ago' +%Y-%m-%dT%H:%M:%SZ)'",
  "reportedBy": "user_003",
  "assignedResponder": {
    "id": "responder_003",
    "name": "Mike Wilson",
    "type": "Security",
    "eta": "0 min",
    "status": "on_scene"
  },
  "environmentalData": {
    "temperature": "26°C",
    "humidity": "65%",
    "windSpeed": "5 km/h",
    "visibility": "Good",
    "airQuality": "Good"
  },
  "crowdData": {
    "density": 92,
    "evacuated": 50,
    "remaining": 1050,
    "total": 1100
  },
  "equipment": ["Crowd Control Barriers", "Communication Devices"],
  "tags": ["crowd-control", "safety", "monitoring"],
  "media": {
    "cameras": 8,
    "recordings": 6,
    "photos": 15
  },
  "lastUpdated": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
  "resolvedAt": null
}'

echo "📝 Creating Incident Subcollections..."

# Incident 001 Notes
gcloud firestore documents create incidents/incident_001/notes/note_001 --data='{
  "content": "Fire alarm activated, evacuation in progress",
  "author": {
    "id": "user_001",
    "name": "System Operator",
    "role": "operator"
  },
  "timestamp": "'$(date -u -d '8 minutes ago' +%Y-%m-%dT%H:%M:%SZ)'",
  "type": "status_update"
}'

gcloud firestore documents create incidents/incident_001/notes/note_002 --data='{
  "content": "Fire department contacted, ETA 5 minutes",
  "author": {
    "id": "user_002",
    "name": "Emergency Coordinator",
    "role": "operator"
  },
  "timestamp": "'$(date -u -d '7 minutes ago' +%Y-%m-%dT%H:%M:%SZ)'",
  "type": "action_taken"
}'

# Incident 001 Media
gcloud firestore documents create incidents/incident_001/media/media_001 --data='{
  "type": "image",
  "filename": "fire_evidence_001.jpg",
  "url": "https://storage.googleapis.com/drishti-media/fire_evidence_001.jpg",
  "metadata": {
    "size": 2048576,
    "format": "jpg",
    "resolution": "1920x1080"
  },
  "uploadedBy": "user_001",
  "uploadedAt": "'$(date -u -d '9 minutes ago' +%Y-%m-%dT%H:%M:%SZ)'",
  "tags": ["evidence", "fire", "smoke"],
  "isPublic": false
}'

echo "📡 Creating Zone Subcollections..."

# Zone A Sensors
gcloud firestore documents create zones/zone_a/sensors/sensor_001 --data='{
  "type": "temperature",
  "value": "26°C",
  "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
  "status": "active"
}'

gcloud firestore documents create zones/zone_a/sensors/sensor_002 --data='{
  "type": "air_quality",
  "value": "Good",
  "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
  "status": "active"
}'

gcloud firestore documents create zones/zone_a/sensors/sensor_003 --data='{
  "type": "crowd_counter",
  "value": 750,
  "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
  "status": "active"
}'

echo "🎉 Firebase Firestore setup completed successfully!"
echo ""
echo "📊 Summary:"
echo "   • System Configuration: 1 document"
echo "   • Zones: 3 documents"
echo "   • Responders: 3 documents"
echo "   • Emergency Contacts: 3 documents"
echo "   • Incidents: 3 documents"
echo "   • Incident Notes: 2 documents"
echo "   • Incident Media: 1 document"
echo "   • Zone Sensors: 3 documents"
echo ""
echo "🔐 Next Steps:"
echo "1. Set up Firestore Security Rules in Firebase Console"
echo "2. Configure authentication if needed"
echo "3. Test the collections with your application" 