// functions/getSignedUploadUrl.js

const functions = require("firebase-functions");
const { Storage } = require("@google-cloud/storage");
const { v4: uuidv4 } = require("uuid");

const storage = new Storage();
const bucketName = "project-drishti-central1-bucket"; // Replace with your bucket name

module.exports = (db, corsHandler) =>
  functions.https.onRequest(async (req, res) => {
    corsHandler(req, res, async () => {
      try {
        const { filename, mimetype, zone, notes } = req.body;

        if (!filename || !mimetype || !zone) {
          return res.status(400).json({ error: "Missing required fields." });
        }

        const fileId = uuidv4();
        const objectPath = `uploads/${fileId}_${filename}`;

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
