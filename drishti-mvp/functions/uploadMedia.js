// functions/uploadMedia.js

const functions = require("firebase-functions");
const { Storage } = require("@google-cloud/storage");
const multer = require("multer");
const os = require("os");
const path = require("path");
const fs = require("fs");

const storage = new Storage();
const bucket = storage.bucket("project-drishti-mvp-4354"); // ✅ Replace with your actual bucket

const upload = multer({ storage: multer.memoryStorage() });

module.exports = functions.https.onRequest((req, res) => {
  const cors = require("cors")({ origin: true });
  cors(req, res, () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    upload.single("image")(req, res, async (err) => {
      if (err) {
        console.error("Multer error:", err);
        return res.status(500).send("Multer error");
      }

      const file = req.file;
      const { zone, notes } = req.body;

      if (!file) {
        return res.status(400).send("No file uploaded.");
      }

      try {
        const filename = `uploads/${Date.now()}_${file.originalname}`;
        const filepath = path.join(os.tmpdir(), filename);

        fs.writeFileSync(filepath, file.buffer);

        await bucket.upload(filepath, {
          destination: filename,
          contentType: file.mimetype,
        });

        const fileUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

        // ❗ Get Firestore from already initialized admin app
        const { getFirestore } = require("firebase-admin/firestore");
        const db = getFirestore();

        await db.collection("media").add({
          zone: zone || "Unknown",
          notes: notes || "",
          type: file.mimetype.startsWith("image") ? "image" : "video",
          fileUrl,
          timestamp: require("firebase-admin").firestore.Timestamp.now(),
        });

        res.status(200).json({ message: "Upload successful", fileUrl });
      } catch (uploadErr) {
        console.error("Upload error:", uploadErr);
        res.status(500).send("Upload failed.");
      }
    });
  });
});
