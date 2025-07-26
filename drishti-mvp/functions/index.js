// functions/index.js

const functions = require("firebase-functions");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const cors = require("cors");
const { VertexAI } = require("@google-cloud/vertexai");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// 🔧 Initialize Firebase Admin (only once)
initializeApp();
const db = getFirestore();

// 🌐 Setup CORS (shared)
const corsHandler = cors({ origin: true });

// ⚙️ Vertex AI client & Gemini Pro Vision model (shared)
const vertexAI = new VertexAI({
  project: process.env.GCLOUD_PROJECT || "project-drishti-mvp-31f1b",
  location: "us-central1",
});



const geminiModel = vertexAI.getGenerativeModel({
  model: "gemini-2.5-pro",
  // generationConfig: { temperature: 0.4 },
});

// ✅ Import modular function logic
const summarizeZone = require("./summarizeZone");
const lostAndFound = require("./lostAndFound");
const chatAgent = require("./chatAgent");
const dispatchResponder = require("./dispatchResponder");
const autoIncidentSimulator = require("./autoIncidentSimulator");
const uploadMedia = require("./uploadMedia");
const getSignedUploadUrl = require("./getSignedUploadUrl");
const analyzeWithGemini = require("./analyzeWithGemini");

// ✅ Export functions
exports.summarizeZone = summarizeZone(db, vertexAI, corsHandler);
exports.lostAndFound2 = lostAndFound(vertexAI, corsHandler);
exports.chatAgent = chatAgent(db, vertexAI, corsHandler);
exports.dispatchResponder = dispatchResponder(db, corsHandler);
exports.autoIncidentSimulator = autoIncidentSimulator(db, corsHandler);
// exports.uploadMedia = uploadMedia;
exports.getSignedUploadUrl = getSignedUploadUrl(db, corsHandler);

// 🧠 Gemini-based crowd analysis
exports.analyzeWithGemini = analyzeWithGemini(db,geminiModel);
