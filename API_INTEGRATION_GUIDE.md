# API Integration Guide

## Overview

All Firebase Functions APIs are now live and integrated into the Drishti UI application. The APIs are accessible at:
`https://us-central1-project-drishti-mvp-31f1b.cloudfunctions.net/`

## API Service Structure

The application uses a centralized API service located at `src/services/api.js` that provides:

### 1. Incidents API (`incidentsAPI`)
- `getIncidents(params)` - Get all incidents with filtering
- `getIncidentById(id)` - Get single incident details
- `createIncident(data)` - Create new incident
- `updateIncident(id, data)` - Update incident
- `deleteIncident(id)` - Delete incident
- `getIncidentNotes(id)` - Get incident notes
- `addIncidentNote(id, note)` - Add note to incident
- `bulkUpdateIncidents(updates)` - Bulk update incidents
- `getIncidentAnalytics(params)` - Get incident analytics

### 2. Zones API (`zonesAPI`)
- `getZones(params)` - Get all zones
- `getZoneById(id)` - Get single zone details
- `updateZone(id, data)` - Update zone
- `getZoneSensors(id)` - Get zone sensors
- `addSensorReading(id, reading)` - Add sensor reading
- `getZoneAnalytics(id)` - Get zone analytics
- `bulkUpdateZones(updates)` - Bulk update zones

### 3. Responders API (`respondersAPI`)
- `getResponders(params)` - Get all responders
- `getResponderById(id)` - Get single responder details
- `updateResponder(id, data)` - Update responder
- `assignResponderToIncident(responderId, incidentId)` - Assign responder
- `unassignResponder(responderId)` - Unassign responder
- `getAvailableResponders(params)` - Get available responders
- `updateResponderPosition(id, position)` - Update responder position
- `getResponderAnalytics(params)` - Get responder analytics

### 4. Emergency Contacts API (`emergencyContactsAPI`)
- `getEmergencyContacts(params)` - Get all emergency contacts
- `getEmergencyContactById(id)` - Get single contact details
- `createEmergencyContact(data)` - Create new contact
- `updateEmergencyContact(id, data)` - Update contact
- `deleteEmergencyContact(id)` - Delete contact
- `getContactsByIncidentType(type)` - Get contacts by type
- `toggleContactStatus(id)` - Toggle contact status
- `getContactAnalytics(params)` - Get contact analytics

### 5. System API (`systemAPI`)
- `getSystemStatus()` - Get system status
- `getAnalytics(params)` - Get system analytics
- `healthCheck()` - Health check endpoint

### 6. Chat API (`chatAPI`)
- `enhancedChatAgent(query)` - Enhanced AI chat agent

### 7. Upload API (`uploadAPI`)
- `getSignedUploadUrl(data)` - Get signed upload URL

### 8. Gemini API (`geminiAPI`)
- `analyzeWithGemini(data)` - AI analysis with Gemini

## Updated Components

### Pages Updated:
1. **Incidents Page** (`src/pages/Incidents.jsx`)
   - Uses real incident data from Firebase
   - Real-time filtering and sorting
   - Bulk operations
   - Status updates

2. **Incident Detail Page** (`src/pages/IncidentDetail.jsx`)
   - Real incident details
   - Live notes and updates
   - Responder assignment
   - Related incidents

3. **Map Page** (`src/pages/Map.jsx`)
   - Real-time incident markers
   - Live responder positions
   - Zone status updates
   - Auto-refresh functionality

4. **Dashboard Page** (`src/pages/Dashboard.jsx`)
   - Real-time analytics
   - Live system status
   - Current incident counts
   - Responder availability

5. **Report Page** (`src/pages/Report.jsx`)
   - Enhanced incident reporting
   - Priority and severity levels
   - Real-time submission

6. **Summary Page** (`src/pages/Summary.jsx`)
   - AI-powered zone analysis
   - Gemini integration

### Components Updated:
1. **AIAssistant** (`src/components/AIAssistant.jsx`)
   - Enhanced chat agent integration
   - Real-time data access
   - Better error handling

## Key Features

### Real-time Data
- All pages now fetch live data from Firebase
- Auto-refresh functionality where appropriate
- Real-time updates for critical information

### Error Handling
- Comprehensive error handling for all API calls
- User-friendly error messages
- Retry mechanisms for failed requests

### Loading States
- Loading indicators for all async operations
- Skeleton loading for better UX
- Progressive loading for large datasets

### Data Validation
- Input validation on forms
- API response validation
- Fallback data handling

## Testing

To test all APIs, you can run the test suite:

```javascript
// In browser console
import('./test-apis.js').then(({ testAllAPIs }) => {
  testAllAPIs()
})
```

Or manually test individual endpoints:

```javascript
import { incidentsAPI } from './services/api'

// Test getting incidents
const response = await incidentsAPI.getIncidents({ limit: 10 })
console.log(response)
```

## Environment Variables

Make sure these environment variables are set:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GOOGLE_MAPS_API_KEY=your_maps_api_key
```

## API Response Format

All APIs follow a consistent response format:

```javascript
{
  success: boolean,
  data: object | array,
  error?: string,
  message?: string
}
```

## Error Codes

Common error codes and their meanings:
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (missing/invalid credentials)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error (server issue)

## Performance Considerations

- API calls are cached where appropriate
- Pagination is implemented for large datasets
- Debounced search and filtering
- Optimistic updates for better UX

## Security

- All API calls use HTTPS
- Input sanitization on all forms
- Rate limiting on API endpoints
- Proper error handling to prevent data leakage

## Monitoring

- Console logging for debugging
- Error tracking for failed requests
- Performance monitoring for API calls
- User activity tracking

## Future Enhancements

1. **Real-time WebSocket connections** for live updates
2. **Offline support** with local caching
3. **Advanced analytics** with historical data
4. **Multi-language support** for international users
5. **Mobile app** with push notifications

## Support

For API issues or questions:
1. Check the Firebase Functions logs
2. Review the API documentation
3. Test individual endpoints
4. Contact the development team

---

**Note**: All mock data has been removed and replaced with real Firebase Functions API calls. The application now provides a fully functional, real-time safety management system. 