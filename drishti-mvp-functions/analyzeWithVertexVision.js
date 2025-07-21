const { onObjectFinalized } = require("firebase-functions/v2/storage");
const { logger } = require("firebase-functions");
const { db, admin, geminiModel } = require('./index.js').dependencies;
const { Storage } = require("@google-cloud/storage");
const vision = require("@google-cloud/vision").v1;

const storage = new Storage();
const client = new vision.ImageAnnotatorClient();

module.exports.analyzeWithVertexVision = onObjectFinalized(
  {
    bucket: "project-drishti-central1-bucket-vision",
    memory: "2GiB",
    timeoutSeconds: 300,
  },
  async (event) => {
    const object = event.data;
    const filePath = object.name;
    const bucketName = object.bucket;
    logger.log(`New image uploaded: ${filePath}`);

    try {
      // Lookup media doc to get zoneId
      const mediaSnapshot = await db
        .collection("media")
        .where("objectPath", "==", filePath)
        .get();
      if (mediaSnapshot.empty) {
        logger.log(`⚠️ No Firestore media doc found for ${filePath}`);
        return;
      }
      const mediaDoc = mediaSnapshot.docs[0];
      const mediaData = mediaDoc.data();
      const zoneId = mediaData.zone || "Unknown";
      const publicImageUrl = mediaData.fileUrl || `https://storage.googleapis.com/${bucketName}/${filePath}`;

      // Download the image
      const file = storage.bucket(bucketName).file(filePath);
      const [buffer] = await file.download();

      // Call Vertex AI Vision for object localization
      const [result] = await client.objectLocalization({
        image: { content: buffer },
      });
      const personCount = result.localizedObjectAnnotations.filter(obj => obj.name === 'Person').length;
      logger.log(`Detected ${personCount} people in ${filePath}`);

      // Prepare base64 image for Gemini
      const base64Image = buffer.toString("base64");
      const mimeType = object.contentType || "image/jpeg";

      // Compose Gemini prompt (same as analyzeWithGemini.js, but include personCount)
      const prompt = `Analyze the image for the following and return ONLY this JSON:\n{
  "peopleCount": <number>,
  "crowdDensity": "low|moderate|high",
  "smokeDetected": <true|false>,
  "fireDetected": <true|false>,
  "medicalEmergency": <true|false>,
  "potentialRisk": <true|false>,
  "incidentRecommended": <true|false>,
  "incidentType": "<string>",
  "suggestedAction": "<string>"
}\nThe person count detected by Vertex AI Vision is ${personCount}.\nIf peopleCount is above 75% of capacity, set potentialRisk to true.\nIf peopleCount exceeds capacity, or if smoke/fire/medicalEmergency is detected, set incidentRecommended to true and specify the incidentType.`;

      logger.log("📨 Gemini Prompt:", prompt.substring(0, 200));

      // Fetch zone data
      const zoneSnap = await db.collection("zones").doc(zoneId).get();
      if (!zoneSnap.exists) {
        logger.log(`⚠️ No zone doc found for ${zoneId}`);
        return;
      }
      const zoneData = zoneSnap.data();
      const zoneCapacity = zoneData.capacity || 100;
      const zoneLocation = zoneData.boundaries?.coordinates?.[0] || {};
      const zoneName = zoneData.name || zoneId;

      // Call Gemini
      const response = await geminiModel.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data: base64Image,
                },
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: null,
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      });

      logger.log("📨 Gemini raw response:", JSON.stringify(response));

      const text =
        response?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      let crowdDensity = "low";
      let smokeDetected = false;
      let fireDetected = false;
      let medicalEmergency = false;
      let potentialRisk = false;
      let incidentRecommended = false;
      let incidentType = null;
      let suggestedAction = "No action needed";
      try {
        const json = JSON.parse(text);
        crowdDensity = json.crowdDensity ?? "low";
        smokeDetected = json.smokeDetected ?? false;
        fireDetected = json.fireDetected ?? false;
        medicalEmergency = json.medicalEmergency ?? false;
        potentialRisk = json.potentialRisk ?? false;
        incidentRecommended = json.incidentRecommended ?? false;
        incidentType = json.incidentType ?? null;
        suggestedAction = json.suggestedAction ?? suggestedAction;
      } catch (err) {
        logger.error("⚠️ Failed to parse Gemini response JSON", err.message);
        return;
      }

      // Always update zone with latest crowd data and analysis
      await db.collection('zones').doc(zoneId).update({
        lastPersonCount: personCount,
        lastCrowdDensity: crowdDensity,
        lastAnalyzedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastSmokeDetected: smokeDetected,
        lastFireDetected: fireDetected,
        lastMedicalEmergency: medicalEmergency,
        lastPotentialRisk: potentialRisk,
        lastIncidentRecommended: incidentRecommended,
        lastIncidentType: incidentType,
        lastSuggestedAction: suggestedAction,
        lastImageUrl: publicImageUrl,
      });
      // Add to crowdHistory subcollection
      await db.collection('zones').doc(zoneId).collection('crowdHistory').add({
        peopleCount: personCount,
        crowdDensity,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        source: "Vertex Vision",
        imageUrl: publicImageUrl,
      });
      // Decision logic: create incident if Gemini recommends
      if (incidentRecommended && incidentType) {
        let incidentDesc = [];
        let tags = [];
        let priority = "medium";
        let severity = 3;
        if (incidentType === "crowd") {
          if (personCount > zoneCapacity) {
            incidentDesc.push(`Overcrowding detected: ${personCount} > capacity ${zoneCapacity}`);
            tags.push("overcrowding");
            priority = "high";
            severity = 4;
          } else if (potentialRisk) {
            incidentDesc.push(`Potential crowd risk: ${personCount} / ${zoneCapacity}`);
            tags.push("potential-crowd-risk");
            priority = "medium";
            severity = 3;
          }
        }
        if (incidentType === "fire") {
          if (fireDetected) {
            incidentDesc.push("Fire detected");
            tags.push("fire");
            priority = "critical";
            severity = 5;
          } else if (smokeDetected) {
            incidentDesc.push("Smoke detected");
            tags.push("smoke");
            priority = "critical";
            severity = 5;
          }
        }
        if (incidentType === "medical") {
          if (medicalEmergency) {
            incidentDesc.push("Medical emergency detected");
            tags.push("medical");
            priority = "high";
            severity = 4;
          }
        }

        // Find available responder for the zone/type
        let assignedResponderId = null;
        let assignedResponderDoc = null;
        let responderTypeQuery = (incidentType === "fire") ? "Fire Brigade" : (incidentType === "medical") ? "Medical" : "Security";
        let respondersSnap = await db.collection("responders")
          .where("status", "==", "available")
          .where("type", "==", responderTypeQuery)
          .get();
        let responderDocs = respondersSnap.docs;
        // If no match, fallback to any available responder
        if (responderDocs.length === 0) {
          respondersSnap = await db.collection("responders")
            .where("status", "==", "available")
            .get();
          responderDocs = respondersSnap.docs;
        }
        if (responderDocs.length > 0) {
          const randomIdx = Math.floor(Math.random() * responderDocs.length);
          assignedResponderDoc = responderDocs[randomIdx];
          assignedResponderId = assignedResponderDoc.id;
          // Mark responder as assigned
          await assignedResponderDoc.ref.update({
            status: "en_route",
            assignedIncident: null, // will update after incident creation
          });
        }
        // Create incident
        const incidentRef = await db.collection("incidents").add({
          type: incidentType,
          status: "active",
          priority,
          severity,
          zoneId,
          location: {
            lat: zoneLocation.lat || null,
            lng: zoneLocation.lng || null,
            address: zoneName,
          },
          description: incidentDesc.join("; ") || suggestedAction,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          reportedBy: "system-vertex-gemini",
          assignedResponderId: assignedResponderId || null,
          assignmentTransactionId: null, // will update after assignment
          environmentalData: {},
          crowdData: {
            density: crowdDensity,
            peopleCount: personCount,
          },
          equipment: [],
          tags,
          media: {
            photos: [publicImageUrl],
          },
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
          resolvedAt: null,
          autoGenerated: true,
          source: "Vertex+Gemini Vision",
        });
        // Update zone with latest crowd data and analysis
        // await db.collection('zones').doc(zoneId).update({
        //   lastPersonCount: personCount,
        //   lastCrowdDensity: crowdDensity,
        //   lastAnalyzedAt: admin.firestore.FieldValue.serverTimestamp(),
        //   lastSmokeDetected: smokeDetected,
        //   lastFireDetected: fireDetected,
        //   lastMedicalEmergency: medicalEmergency,
        //   lastPotentialRisk: potentialRisk,
        //   lastIncidentRecommended: incidentRecommended,
        //   lastIncidentType: incidentType,
        //   lastSuggestedAction: suggestedAction,
        //   lastImageUrl: publicImageUrl,
        // });
        // Create responder assignment if responder assigned
        if (assignedResponderId) {
          const assignmentRef = await db.collection("responderAssignments").add({
            incidentId: incidentRef.id,
            responderId: assignedResponderId,
            assignedAt: admin.firestore.FieldValue.serverTimestamp(),
            statusHistory: [
              { status: "en_route", timestamp: new Date().toISOString() },
            ],
            locationHistory: [
              { lat: zoneLocation.lat || null, lng: zoneLocation.lng || null, timestamp: new Date().toISOString() },
            ],
          });
          // Update incident with assignmentTransactionId
          await incidentRef.update({ assignmentTransactionId: assignmentRef.id });
          // Update responder with assignedIncident
          await assignedResponderDoc.ref.update({ assignedIncident: incidentRef.id });
        }

        logger.log(`🚨 Incident created for ${zoneId} (type: ${incidentType})`);
      }

      logger.log(
        `✅ Vertex+Gemini analysis complete: people=${personCount}, density=${crowdDensity}, smoke=${smokeDetected}, fire=${fireDetected}, medical=${medicalEmergency}`
      );
    } catch (err) {
      logger.error('Vertex+Gemini analysis failed', err);
    }
  }
); 