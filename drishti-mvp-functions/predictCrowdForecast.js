const functions = require('firebase-functions');
const { db } = require('./index.js').dependencies;
const { PredictionServiceClient } = require('@google-cloud/aiplatform').v1;

// TODO: Fill in your actual values after deployment
const project = 'YOUR_PROJECT_ID';
const location = 'YOUR_REGION'; // e.g., 'us-central1'
const endpointId = 'YOUR_ENDPOINT_ID';

const client = new PredictionServiceClient();

module.exports = functions.https.onRequest(async (req, res) => {
  try {
    const { zoneId, timestamp } = req.body;
    if (!zoneId) {
      return res.status(400).json({ error: 'zoneId is required' });
    }
    // Use provided timestamp or current time
    const predictTime = timestamp || new Date().toISOString();
    // Prepare instance for prediction (add more features if needed)
    const instance = {
      zoneId,
      timestamp: predictTime,
      // crowdDensity, source, imageUrl: can be omitted or set to null if not available
    };
    const endpoint = `projects/${project}/locations/${location}/endpoints/${endpointId}`;
    const [response] = await client.predict({
      endpoint,
      instances: [instance],
    });
    // Extract prediction result
    const prediction = response?.predictions?.[0] || null;
    // Store in Firestore under zones/{zoneId}/crowdForecast
    await db.collection('zones').doc(zoneId).collection('crowdForecast').add({
      timestamp: predictTime,
      prediction,
      createdAt: new Date(),
    });
    res.status(200).json({ success: true, prediction });
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: error.message });
  }
}); 