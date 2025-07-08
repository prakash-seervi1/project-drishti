# Firebase Functions for Drishti Database Setup

This directory contains Firebase Cloud Functions to automatically set up your Firestore database with sample data.

## 🚀 Quick Start

### 1. Deploy Functions
```bash
# From project root
./deploy-functions.sh
```

### 2. Setup Database
After deployment, call the setup function:

**Option A: Using curl**
```bash
curl -X POST https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/setupDatabase
```

**Option B: Using browser**
Visit: `https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/setupDatabase`

**Option C: Using your existing deploy command**
```bash
firebase deploy --only functions:setupDatabase
```

## 📋 What Gets Created

### Collections:
- **system_config** - System settings and configuration
- **zones** - Zone information with boundaries and sensors
- **responders** - Emergency responders with real-time tracking
- **emergency_contacts** - Emergency contact information
- **incidents** - Incident reports with full details

### Subcollections:
- **incidents/{id}/notes** - Incident notes and updates
- **zones/{id}/sensors** - Zone sensor data

## 🔧 Available Functions

### `setupDatabase`
- **Purpose**: Creates all collections and sample data
- **Method**: POST
- **URL**: `https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/setupDatabase`
- **Response**: JSON with setup results

### `resetDatabase`
- **Purpose**: Deletes all data (use with caution!)
- **Method**: POST
- **URL**: `https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/resetDatabase`
- **Response**: JSON with reset results

## 📊 Sample Data Included

### Zones (3 zones)
- Zone A: Normal status, 750/1000 occupancy
- Zone B: Active status, 600/800 occupancy  
- Zone C: Critical status, 1100/1200 occupancy

### Responders (3 responders)
- John Smith: Fire Brigade (available)
- Sarah Johnson: Medical (en route)
- Mike Wilson: Security (on scene)

### Incidents (3 incidents)
- Incident 001: Fire emergency (critical)
- Incident 002: Medical emergency (high)
- Incident 003: Crowd control (medium)

### Emergency Contacts (3 contacts)
- Fire Department
- Medical Emergency
- Police Department

## 🛠️ Development

### Local Testing
```bash
cd functions
npm install
firebase emulators:start --only functions
```

### View Logs
```bash
firebase functions:log
```

## 🔒 Security

These functions are HTTP triggers and should be protected in production. Consider:
- Adding authentication
- Using Firebase Auth triggers instead
- Implementing rate limiting

## 📝 Customization

To modify the sample data:
1. Edit the `collectionsData` object in `index.js`
2. Redeploy the functions
3. Call the setup function again

## 🎯 Integration with Your App

After setup, your React app can read from these collections:

```javascript
// Example: Read zones
const zonesRef = db.collection('zones');
zonesRef.onSnapshot((snapshot) => {
  snapshot.forEach((doc) => {
    console.log('Zone:', doc.data());
  });
});

// Example: Read incidents
const incidentsRef = db.collection('incidents');
incidentsRef.onSnapshot((snapshot) => {
  snapshot.forEach((doc) => {
    console.log('Incident:', doc.data());
  });
});
``` 