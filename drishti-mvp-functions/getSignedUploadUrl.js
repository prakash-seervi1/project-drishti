// functions/getSignedUploadUrl.js

const functions = require("firebase-functions");
const { Storage } = require("@google-cloud/storage");
const { v4: uuidv4 } = require("uuid");

// Get centralized dependencies from index.js
const { db } = require('./index.js').dependencies;

const storage = new Storage();
const defaultBucket = "project-drishti-central1-bucket";
const venueBucket = "project-drishti-central1-bucket-venues";

// CORS handler utility
const corsHandler = (req, res, callback) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  callback();
};

module.exports = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    try {
      const { filename, mimetype, zone, notes, type, bucket } = req.body;

      if (!filename || !mimetype || !zone) {
        return res.status(400).json({ error: "Missing required fields." });
      }

      const fileId = uuidv4();
      const objectPath = `uploads/${fileId}_${filename}`;

      // Choose bucket based on request
      let bucketName;
      if (bucket) {
        bucketName = bucket;
      } else if (type === "venue") {
        bucketName = venueBucket;
      } else {
        bucketName = defaultBucket;
      }

      const options = {
        version: "v4",
        action: "write",
        expires: Date.now() + 5 * 60 * 1000, // 5 minutes
        contentType: mimetype,
      };

      const [url] = await storage
        .bucket(bucketName)
        .file(objectPath)
        .getSignedUrl(options);

      // Store metadata
      await db.collection("media").add({
        zone,
        notes: notes || "",
        fileUrl: `https://storage.googleapis.com/${bucketName}/${objectPath}`,
        objectPath,
        type: mimetype.startsWith("image") ? "image" : "video",
        timestamp: new Date(),
      });

      res.status(200).json({ url, objectPath });
    } catch (err) {
      console.error("Error generating signed URL:", err);
      res.status(500).json({ error: `Failed to generate signed URL: ${err.message}` });
    }
  });
});
