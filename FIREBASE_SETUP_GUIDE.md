# Firebase Firestore Setup Guide for Drishti Project

## 🎯 Manual Setup via Firebase Console (Recommended)

Since your Node.js version (14.17.4) is incompatible with the latest Firebase tools, use the Firebase Console for setup.

### Step 1: Access Firebase Console
1. Go to: https://console.firebase.google.com
2. Select your project: `project-drishti-mvp-31f1b`
3. Navigate to **Firestore Database** in the left sidebar

### Step 2: Create Collections and Documents

#### 2.1 System Configuration
1. Click **"Start collection"**
2. Collection ID: `system_config`
3. Document ID: `system`
4. Add these fields:
   - `version` (string): `"1.0.0"`
   - `settings` (map):
     - `maxIncidentSeverity` (number): `5`
     - `defaultResponseTime` (string): `"5 min"`
     - `autoEscalationThreshold` (number): `10`
     - `notificationChannels` (array): `["email", "push", "sms"]`
   - `zones` (map):
     - `defaultZone` (string): `"Zone A"`
     - `zoneTypes` (array): `["indoor", "outdoor", "parking", "hall"]`
   - `incidentTypes` (array): `["fire", "medical", "security", "panic", "crowd", "environmental", "technical"]`
   - `responderTypes` (array): `["Fire Brigade", "Medical", "Security", "Police", "Ambulance", "Technical"]`
   - `lastUpdated` (timestamp): Current time

#### 2.2 Zones Collection
1. Click **"Start collection"**
2. Collection ID: `zones`

**Document: zone_a**
- `name` (string): `"Zone A"`
- `status` (string): `"normal"`
- `boundaries` (map):
  - `coordinates` (array): `[{lat: 12.9716, lng: 77.5946}, {lat: 12.9726, lng: 77.5956}, {lat: 12.9736, lng: 77.5966}, {lat: 12.9706, lng: 77.5936}]`
- `capacity` (map):
  - `maxOccupancy` (number): `1000`
  - `currentOccupancy` (number): `750`
  - `crowdDensity` (number): `75`
- `sensors` (map):
  - `cameras` (number): `8`
  - `temperature` (number): `2`
  - `airQuality` (number): `1`
  - `crowdCounters` (number): `4`
- `emergencyExits` (array): `[{id: "exit_1", location: {lat: 12.9716, lng: 77.5946}, status: "open"}]`
- `lastUpdate` (timestamp): Current time

**Document: zone_b**
- `name` (string): `"Zone B"`
- `status` (string): `"active"`
- `boundaries` (map):
  - `coordinates` (array): `[{lat: 12.9746, lng: 77.5976}, {lat: 12.9756, lng: 77.5986}, {lat: 12.9766, lng: 77.5996}, {lat: 12.9736, lng: 77.5966}]`
- `capacity` (map):
  - `maxOccupancy` (number): `800`
  - `currentOccupancy` (number): `600`
  - `crowdDensity` (number): `65`
- `sensors` (map):
  - `cameras` (number): `6`
  - `temperature` (number): `1`
  - `airQuality` (number): `1`
  - `crowdCounters` (number): `3`
- `emergencyExits` (array): `[{id: "exit_3", location: {lat: 12.9746, lng: 77.5976}, status: "open"}]`
- `lastUpdate` (timestamp): Current time

**Document: zone_c**
- `name` (string): `"Zone C"`
- `status` (string): `"critical"`
- `boundaries` (map):
  - `coordinates` (array): `[{lat: 12.9776, lng: 77.6006}, {lat: 12.9786, lng: 77.6016}, {lat: 12.9796, lng: 77.6026}, {lat: 12.9766, lng: 77.5996}]`
- `capacity` (map):
  - `maxOccupancy` (number): `1200`
  - `currentOccupancy` (number): `1100`
  - `crowdDensity` (number): `92`
- `sensors` (map):
  - `cameras` (number): `10`
  - `temperature` (number): `3`
  - `airQuality` (number): `2`
  - `crowdCounters` (number): `5`
- `emergencyExits` (array): `[{id: "exit_4", location: {lat: 12.9776, lng: 77.6006}, status: "blocked"}]`
- `lastUpdate` (timestamp): Current time

#### 2.3 Responders Collection
1. Click **"Start collection"**
2. Collection ID: `responders`

**Document: responder_001**
- `name` (string): `"John Smith"`
- `type` (string): `"Fire Brigade"`
- `status` (string): `"available"`
- `vehicle` (string): `"Fire Truck 1"`
- `position` (map):
  - `lat` (number): `12.9716`
  - `lng` (number): `77.5946`
  - `lastUpdate` (timestamp): Current time
- `contact` (map):
  - `phone` (string): `"+91-9876543210"`
  - `radio` (string): `"Channel 1"`
  - `email` (string): `"john.smith@fire.gov"`
- `equipment` (map):
  - `batteryLevel` (number): `85`
  - `signalStrength` (number): `4`
  - `medicalKit` (boolean): `true`
  - `defibrillator` (boolean): `false`
- `assignedIncident` (string): `null`
- `eta` (string): `null`
- `speed` (string): `"0 km/h"`
- `experience` (string): `"8 years"`
- `specializations` (array): `["Fire Suppression", "Rescue Operations"]`
- `lastUpdate` (timestamp): Current time

**Document: responder_002**
- `name` (string): `"Sarah Johnson"`
- `type` (string): `"Medical"`
- `status` (string): `"en_route"`
- `vehicle` (string): `"Ambulance 2"`
- `position` (map):
  - `lat` (number): `12.9726`
  - `lng` (number): `77.5956`
  - `lastUpdate` (timestamp): Current time
- `contact` (map):
  - `phone` (string): `"+91-9876543211"`
  - `radio` (string): `"Channel 2"`
  - `email` (string): `"sarah.johnson@medical.gov"`
- `equipment` (map):
  - `batteryLevel` (number): `92`
  - `signalStrength` (number): `5`
  - `medicalKit` (boolean): `true`
  - `defibrillator` (boolean): `true`
- `assignedIncident` (string): `"incident_001"`
- `eta` (string): `"3 min"`
- `speed` (string): `"45 km/h"`
- `experience` (string): `"5 years"`
- `specializations` (array): `["Emergency Medicine", "Trauma Care"]`
- `lastUpdate` (timestamp): Current time

**Document: responder_003**
- `name` (string): `"Mike Wilson"`
- `type` (string): `"Security"`
- `status` (string): `"on_scene"`
- `vehicle` (string): `"Patrol Car 3"`
- `position` (map):
  - `lat` (number): `12.9736`
  - `lng` (number): `77.5966`
  - `lastUpdate` (timestamp): Current time
- `contact` (map):
  - `phone` (string): `"+91-9876543212"`
  - `radio` (string): `"Channel 3"`
  - `email` (string): `"mike.wilson@security.gov"`
- `equipment` (map):
  - `batteryLevel` (number): `78`
  - `signalStrength` (number): `3`
  - `medicalKit` (boolean): `false`
  - `defibrillator` (boolean): `false`
- `assignedIncident` (string): `"incident_002"`
- `eta` (string): `"0 min"`
- `speed` (string): `"0 km/h"`
- `experience` (string): `"12 years"`
- `specializations` (array): `["Crowd Control", "Surveillance"]`
- `lastUpdate` (timestamp): Current time

#### 2.4 Emergency Contacts Collection
1. Click **"Start collection"**
2. Collection ID: `emergency_contacts`

**Document: contact_001**
- `name` (string): `"Fire Department"`
- `type` (string): `"fire"`
- `contact` (map):
  - `phone` (string): `"+91-9876543200"`
  - `email` (string): `"fire@emergency.gov"`
  - `radio` (string): `"Channel 1"`
- `priority` (number): `1`
- `responseTime` (string): `"5 min"`
- `specializations` (array): `["Fire Suppression", "Rescue"]`
- `availability` (string): `"24/7"`
- `location` (map):
  - `address` (string): `"123 Emergency St, City"`
  - `lat` (number): `12.9716`
  - `lng` (number): `77.5946`
- `isActive` (boolean): `true`

**Document: contact_002**
- `name` (string): `"Medical Emergency"`
- `type` (string): `"medical"`
- `contact` (map):
  - `phone` (string): `"+91-9876543201"`
  - `email` (string): `"medical@emergency.gov"`
  - `radio` (string): `"Channel 2"`
- `priority` (number): `1`
- `responseTime` (string): `"7 min"`
- `specializations` (array): `["Emergency Medicine", "Trauma Care"]`
- `availability` (string): `"24/7"`
- `location` (map):
  - `address` (string): `"456 Medical Ave, City"`
  - `lat` (number): `12.9726`
  - `lng` (number): `77.5956`
- `isActive` (boolean): `true`

**Document: contact_003**
- `name` (string): `"Police Department"`
- `type` (string): `"police"`
- `contact` (map):
  - `phone` (string): `"+91-9876543202"`
  - `email` (string): `"police@emergency.gov"`
  - `radio` (string): `"Channel 3"`
- `priority` (number): `2`
- `responseTime` (string): `"10 min"`
- `specializations` (array): `["Law Enforcement", "Crowd Control"]`
- `availability` (string): `"24/7"`
- `location` (map):
  - `address` (string): `"789 Police Rd, City"`
  - `lat` (number): `12.9736`
  - `lng` (number): `77.5966`
- `isActive` (boolean): `true`

#### 2.5 Incidents Collection
1. Click **"Start collection"**
2. Collection ID: `incidents`

**Document: incident_001**
- `type` (string): `"fire"`
- `status` (string): `"active"`
- `priority` (string): `"critical"`
- `severity` (number): `5`
- `zone` (string): `"Zone A"`
- `location` (map):
  - `lat` (number): `12.9716`
  - `lng` (number): `77.5946`
  - `address` (string): `"Main Hall, Zone A"`
- `description` (string): `"Electrical fire detected in main hall, smoke visible from multiple exits"`
- `timestamp` (timestamp): Current time
- `reportedBy` (string): `"user_001"`
- `assignedResponder` (map):
  - `id` (string): `"responder_001"`
  - `name` (string): `"John Smith"`
  - `type` (string): `"Fire Brigade"`
  - `eta` (string): `"2 min"`
  - `status` (string): `"en_route"`
- `environmentalData` (map):
  - `temperature` (string): `"28°C"`
  - `humidity` (string): `"70%"`
  - `windSpeed` (string): `"8 km/h"`
  - `visibility` (string): `"Poor"`
  - `airQuality` (string): `"Poor"`
- `crowdData` (map):
  - `density` (number): `85`
  - `evacuated` (number): `150`
  - `remaining` (number): `200`
  - `total` (number): `350`
- `equipment` (array): `["Fire Extinguishers", "Smoke Detectors", "Emergency Lighting"]`
- `tags` (array): `["electrical", "smoke", "evacuation"]`
- `media` (map):
  - `cameras` (number): `6`
  - `recordings` (number): `4`
  - `photos` (number): `12`
- `lastUpdated` (timestamp): Current time
- `resolvedAt` (string): `null`

**Document: incident_002**
- `type` (string): `"medical"`
- `status` (string): `"ongoing"`
- `priority` (string): `"high"`
- `severity` (number): `4`
- `zone` (string): `"Zone B"`
- `location` (map):
  - `lat` (number): `12.9746`
  - `lng` (number): `77.5976`
  - `address` (string): `"Conference Room, Zone B"`
- `description` (string): `"Medical emergency - person collapsed, requires immediate attention"`
- `timestamp` (timestamp): Current time
- `reportedBy` (string): `"user_002"`
- `assignedResponder` (map):
  - `id` (string): `"responder_002"`
  - `name` (string): `"Sarah Johnson"`
  - `type` (string): `"Medical"`
  - `eta` (string): `"1 min"`
  - `status` (string): `"en_route"`
- `environmentalData` (map):
  - `temperature` (string): `"24°C"`
  - `humidity` (string): `"60%"`
  - `windSpeed` (string): `"3 km/h"`
  - `visibility` (string): `"Good"`
  - `airQuality` (string): `"Good"`
- `crowdData` (map):
  - `density` (number): `45`
  - `evacuated` (number): `20`
  - `remaining` (number): `80`
  - `total` (number): `100`
- `equipment` (array): `["First Aid Kit", "Defibrillator", "Medical Supplies"]`
- `tags` (array): `["medical", "emergency", "first-aid"]`
- `media` (map):
  - `cameras` (number): `3`
  - `recordings` (number): `2`
  - `photos` (number): `5`
- `lastUpdated` (timestamp): Current time
- `resolvedAt` (string): `null`

**Document: incident_003**
- `type` (string): `"crowd"`
- `status` (string): `"investigating"`
- `priority` (string): `"medium"`
- `severity` (number): `3`
- `zone` (string): `"Zone C"`
- `location` (map):
  - `lat` (number): `12.9776`
  - `lng` (number): `77.6006`
  - `address` (string): `"Parking Area, Zone C"`
- `description` (string): `"Large crowd gathering, potential safety concern"`
- `timestamp` (timestamp): Current time
- `reportedBy` (string): `"user_003"`
- `assignedResponder` (map):
  - `id` (string): `"responder_003"`
  - `name` (string): `"Mike Wilson"`
  - `type` (string): `"Security"`
  - `eta` (string): `"0 min"`
  - `status` (string): `"on_scene"`
- `environmentalData` (map):
  - `temperature` (string): `"26°C"`
  - `humidity` (string): `"65%"`
  - `windSpeed` (string): `"5 km/h"`
  - `visibility` (string): `"Good"`
  - `airQuality` (string): `"Good"`
- `crowdData` (map):
  - `density` (number): `92`
  - `evacuated` (number): `50`
  - `remaining` (number): `1050`
  - `total` (number): `1100`
- `equipment` (array): `["Crowd Control Barriers", "Communication Devices"]`
- `tags` (array): `["crowd-control", "safety", "monitoring"]`
- `media` (map):
  - `cameras` (number): `8`
  - `recordings` (number): `6`
  - `photos` (number): `15`
- `lastUpdated` (timestamp): Current time
- `resolvedAt` (string): `null`

### Step 3: Create Subcollections

#### 3.1 Incident Notes
1. Go to `incidents` collection
2. Click on `incident_001` document
3. Click **"Start collection"**
4. Collection ID: `notes`
5. Add documents with fields:
   - `content` (string): `"Fire alarm activated, evacuation in progress"`
   - `author` (map): `{id: "user_001", name: "System Operator", role: "operator"}`
   - `timestamp` (timestamp): Current time
   - `type` (string): `"status_update"`

#### 3.2 Zone Sensors
1. Go to `zones` collection
2. Click on `zone_a` document
3. Click **"Start collection"**
4. Collection ID: `sensors`
5. Add documents with fields:
   - `type` (string): `"temperature"`
   - `value` (string): `"26°C"`
   - `timestamp` (timestamp): Current time
   - `status` (string): `"active"`

### Step 4: Set Up Security Rules

1. Go to **Firestore Database** → **Rules**
2. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all authenticated users
    match /{document=**} {
      allow read: if request.auth != null;
    }
    
    // Allow write access to specific collections
    match /incidents/{incidentId} {
      allow write: if request.auth != null;
    }
    
    match /responders/{responderId} {
      allow write: if request.auth != null;
    }
    
    match /zones/{zoneId} {
      allow write: if request.auth != null;
    }
    
    // System config - read only for most users
    match /system_config/{docId} {
      allow read: if request.auth != null;
      allow write: if false; // Only admin can write
    }
  }
}
```

### Step 5: Test Your Setup

1. Go to your React app
2. Make sure Firebase is properly configured
3. Test reading data from the collections
4. Verify that your components can access the data

## 🎉 You're Done!

Your Firebase Firestore database is now set up with all the necessary collections and sample data for the Drishti project. The manual setup ensures compatibility with your current Node.js version and gives you full control over the data structure. 