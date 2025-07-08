# Firebase Firestore Setup for Drishti Project

This guide provides multiple ways to set up the Firebase Firestore collections for your Drishti emergency management system.

## 📋 Collections Overview

```
📄 Firebase Firestore Collections:
├── 📄 incidents          // Emergency incidents
├── 📄 responders         // Emergency responders  
├── 📄 zones             // Physical zones
├── 📄 emergency_contacts // Emergency services
├── 📄 system_config     // System settings
└── 📄 subcollections    // Related data
    ├── incidents/{id}/notes
    ├── incidents/{id}/media
    └── zones/{id}/sensors
```

## 🚀 Setup Methods

### Method 1: Google Cloud Console CLI (Recommended)

1. **Install Google Cloud CLI** (if not already installed):
   ```bash
   # For macOS
   brew install google-cloud-sdk
   
   # For Windows
   # Download from: https://cloud.google.com/sdk/docs/install
   ```

2. **Authenticate and set project**:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

3. **Run the setup script**:
   ```bash
   # Make the script executable
   chmod +x gcp-firebase-setup-commands.sh
   
   # Run the script
   ./gcp-firebase-setup-commands.sh
   ```

### Method 2: Firebase Console (Manual)

1. **Go to Firebase Console**:
   - Visit: https://console.firebase.google.com
   - Select your project

2. **Navigate to Firestore Database**:
   - Click on "Firestore Database" in the left sidebar
   - Click "Start collection" or "Add document"

3. **Create Collections Manually**:
   - Create each collection and add documents using the JSON data from `firebase-collections.json`

### Method 3: Firebase Admin SDK (Programmatic)

1. **Use the Node.js script**:
   ```bash
   # Install dependencies
   npm install firebase-admin
   
   # Run the setup script
   node firebase-setup-script.js
   ```

## 📊 Collection Details

### 1. System Configuration (`system_config`)
- **Purpose**: Global system settings and configuration
- **Documents**: 1 (system)
- **Key Fields**: version, settings, zones, incidentTypes, responderTypes

### 2. Zones (`zones`)
- **Purpose**: Physical areas with monitoring capabilities
- **Documents**: 3 (zone_a, zone_b, zone_c)
- **Key Fields**: name, status, boundaries, capacity, sensors, emergencyExits

### 3. Responders (`responders`)
- **Purpose**: Emergency personnel and their real-time status
- **Documents**: 3 (responder_001, responder_002, responder_003)
- **Key Fields**: name, type, status, position, contact, equipment, assignedIncident

### 4. Emergency Contacts (`emergency_contacts`)
- **Purpose**: External emergency services contact information
- **Documents**: 3 (contact_001, contact_002, contact_003)
- **Key Fields**: name, type, contact, priority, responseTime, specializations

### 5. Incidents (`incidents`)
- **Purpose**: Emergency incidents and their details
- **Documents**: 3 (incident_001, incident_002, incident_003)
- **Key Fields**: type, status, priority, severity, zone, location, description, assignedResponder

## 🔐 Security Rules

After creating the collections, set up security rules in Firebase Console:

```javascript
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
  }
}
```

## 📝 Subcollections Setup

### Incident Notes
```bash
# Create notes for incident_001
gcloud firestore documents create incidents/incident_001/notes/note_001 --data='{
  "content": "Fire alarm activated, evacuation in progress",
  "author": {"id": "user_001", "name": "System Operator", "role": "operator"},
  "timestamp": "2024-01-15T10:22:00Z",
  "type": "status_update"
}'
```

### Zone Sensors
```bash
# Create sensors for zone_a
gcloud firestore documents create zones/zone_a/sensors/sensor_001 --data='{
  "type": "temperature",
  "value": "26°C",
  "timestamp": "2024-01-15T10:30:00Z",
  "status": "active"
}'
```

## 🔧 Verification

After setup, verify the collections:

1. **Check Firebase Console**:
   - Go to Firestore Database
   - Verify all collections are created
   - Check document counts

2. **Test with your application**:
   - Update your Firebase config
   - Test reading from collections
   - Verify data structure matches your app

## 📈 Data Structure Benefits

- **Scalable**: Supports thousands of incidents and responders
- **Queryable**: Optimized for complex queries across collections
- **Secure**: Role-based access control
- **Real-time**: Supports real-time updates and subscriptions
- **Organized**: Logical separation of concerns

## 🚨 Troubleshooting

### Common Issues:

1. **Permission Denied**:
   - Check if you're authenticated with gcloud
   - Verify project ID is correct
   - Ensure Firestore is enabled in your project

2. **Collection Not Found**:
   - Check if Firestore is in the correct mode (Native vs Datastore)
   - Verify collection names match exactly

3. **Data Import Errors**:
   - Check JSON syntax
   - Verify field names match your application
   - Ensure timestamps are in correct format

### Support:
- Firebase Documentation: https://firebase.google.com/docs/firestore
- Google Cloud CLI: https://cloud.google.com/sdk/docs
- Firestore Security Rules: https://firebase.google.com/docs/firestore/security

## ✅ Success Checklist

- [ ] All collections created
- [ ] Sample data imported
- [ ] Security rules configured
- [ ] Application can read data
- [ ] Real-time updates working
- [ ] Subcollections created (if needed)

---

**Note**: Replace `YOUR_PROJECT_ID` with your actual Firebase project ID in all commands. 