const functions = require('firebase-functions/v1');
const cors = require('cors')({ origin: true });
const { Storage } = require('@google-cloud/storage');
const sharp = require('sharp');

const storage = new Storage();

module.exports.createVenue = ({ db, admin, geminiModel }) =>
  functions
    .runWith({ timeoutSeconds: 300, memory: '2GB' })
    .https.onRequest(async (req, res) => {
      cors(req, res, async () => {
        if (req.method === 'OPTIONS') {
          res.status(204).send('');
          return;
        }
        if (req.method !== 'POST') {
          res.status(405).json({ error: 'Method not allowed' });
          return;
        }
        try {
          console.log('Received createVenue request:', JSON.stringify(req.body, null, 2));
          const { eventName, venueType, venueArea, entryGates, crowdType, autoZone, createdBy, zones, imageUrl } = req.body;
          if (!eventName || !venueType || !venueArea || !entryGates || !crowdType) {
            console.log('Missing required fields.');
            return res.status(400).json({ error: 'Missing required fields.' });
          }
          // Generate a venueId (slug + timestamp)
          const venueId = eventName.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
          let finalZones = zones;
          // If autoZone is true and imageUrl is provided, use Gemini Vision to suggest zones
          if (autoZone && imageUrl && geminiModel) {
            console.log('AutoZone enabled. Starting Gemini Vision analysis...');
            const gcsMatch = imageUrl.match(/https:\/\/storage.googleapis.com\/([^/]+)\/(.+)/);
            if (!gcsMatch) {
              console.log('Invalid imageUrl format for GCS:', imageUrl);
              return res.status(400).json({ error: 'Invalid imageUrl format for GCS.' });
            }
            const bucketName = gcsMatch[1];
            const filePath = gcsMatch[2];
            console.log(`Downloading image from bucket: ${bucketName}, file: ${filePath}`);
            const file = storage.bucket(bucketName).file(filePath);
            const [originalBuffer] = await file.download();
            console.log('Image downloaded. Resizing...');
            const resizedBuffer = await sharp(originalBuffer)
              .resize({ width: 512 })
              .jpeg({ quality: 80 })
              .toBuffer();
            const base64Image = resizedBuffer.toString('base64');
            // Smart Gemini prompt for venue/zone suggestion
            const prompt = `Given a venue of type '${venueType}' with area ${venueArea} sq.ft, ${entryGates} entry gates, and crowd type '${crowdType}', analyze the uploaded layout image and suggest an optimal division into safety zones. For each zone, return a JSON array with: zoneId, area (sq.ft), capacity (standing: 5 sq.ft/person, seating: 10 sq.ft/person), assignedGates (array of gate indices), and risk (none, cascading, overcrowding, etc). Example:\n[\n  {\"zoneId\": \"zone-1\", \"area\": 2500, \"capacity\": 500, \"assignedGates\": [0], \"risk\": \"none\"},\n  ...\n]\nReturn ONLY the JSON array.`;
            console.log('Sending prompt to Gemini:', prompt.substring(0, 200));
            const response = await geminiModel.generateContent({
              contents: [
                {
                  role: 'user',
                  parts: [
                    { text: prompt },
                    {
                      inlineData: {
                        mimeType: 'image/jpeg',
                        data: base64Image,
                      },
                    },
                  ],
                },
              ],
              generationConfig: {
                maxOutputTokens: null,
                temperature: 0.2,
                responseMimeType: 'application/json',
              },
            });
            const text = response?.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            console.log('Gemini raw response:', text);
            try {
              finalZones = JSON.parse(text);
              console.log('Parsed zones from Gemini:', finalZones);
            } catch (err) {
              console.error('Failed to parse Gemini response JSON:', text, err);
              return res.status(500).json({ error: 'Failed to parse Gemini response', geminiRaw: text });
            }
          }
          // Venue data (schema: zones as array, layoutImageUrl, no geminiAnalysis)
          const venueData = {
            eventName,
            venueType,
            venueArea,
            entryGates,
            crowdType,
            autoZone: !!autoZone,
            layoutImageUrl: imageUrl || null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: createdBy || null,
            zones: Array.isArray(finalZones) ? finalZones : [],
          };
          console.log('Saving venue to Firestore:', JSON.stringify(venueData, null, 2));
          // Create venue doc (with zones array)
          await db.collection('venues').doc(venueId).set(venueData);
          console.log('Venue created successfully:', venueId);
          // Also create each zone as a subcollection doc
          if (Array.isArray(finalZones) && finalZones.length > 0) {
            const zonesCol = db.collection('venues').doc(venueId).collection('zones');
            for (const zone of finalZones) {
              if (!zone.zoneId) {
                zone.zoneId = 'zone-' + Math.random().toString(36).substr(2, 6);
              }
              await zonesCol.doc(zone.zoneId).set(zone);
              console.log(`Zone created in subcollection: ${zone.zoneId}`);
            }
          }
          res.status(201).json({ message: 'Venue and zones created', venueId, zones: venueData.zones });
        } catch (error) {
          console.error('Error creating venue:', error);
          res.status(500).json({ error: 'Failed to create venue' });
        }
      });
    }); 