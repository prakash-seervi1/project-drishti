const { onObjectFinalized } = require("firebase-functions/v2/storage");
const { logger } = require("firebase-functions");
const { Storage } = require("@google-cloud/storage");
const sharp = require("sharp");
const admin = require("firebase-admin");
const FieldValue = admin.firestore.FieldValue;

const storage = new Storage();

const waitOneMinute = () => new Promise(resolve => setTimeout(resolve, 60000));


module.exports = (db, geminiModel) =>
  onObjectFinalized(
    {
      bucket: "project-drishti-central1-bucket", // ✅ Ensure this is correct
      memory: "4GiB",
      timeoutSeconds: 540,
    },
    async (event) => {
      try {
        console.log("⏳ Waiting for 1 minute...");
        // await waitOneMinute();
        console.log("✅ Done waiting!");

        const object = event.data;
        const filePath = object.name;
        const bucketName = object.bucket;
        const mimeType = object.contentType;

        logger.log(`📦 New file uploaded: ${filePath}`);

        if (
          !mimeType ||
          (!mimeType.startsWith("image/jpeg") && !mimeType.startsWith("image/png"))
        ) {
          logger.log(`⚠️ Skipping unsupported file: ${filePath}`);
          return;
        }

        // 🔍 Find metadata in Firestore
        const mediaSnapshot = await db
          .collection("media")
          .where("objectPath", "==", filePath)
          .get();

        if (mediaSnapshot.empty) {
          logger.log(`⚠️ No Firestore doc found for ${filePath}`);
          return;
        }

        const mediaDoc = mediaSnapshot.docs[0];
        const mediaData = mediaDoc.data();
        const zoneId = mediaData.zone || "Unknown";
        const publicImageUrl = mediaData.fileUrl;

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

        // 🖼️ Download + resize image
        const file = storage.bucket(bucketName).file(filePath);
        const [originalBuffer] = await file.download();
        const resizedBuffer = await sharp(originalBuffer)
          .resize({ width: 512 })
          .jpeg({ quality: 80 })
          .toBuffer();
        const base64Image = resizedBuffer.toString("base64");

        // Improved Gemini prompt with risk/incident logic
        const prompt = `Analyze the image for the following and return ONLY this JSON:\n{
  "peopleCount": <number>,
  "crowdDensity": "low|moderate|high",
  "smokeDetected": <true|false>,
  "fireDetected": <true|false>,
  "medicalEmergency": <true|false>,
  "potentialRisk": <true|false>, // true if peopleCount > 75% of capacity or other risk detected
  "incidentRecommended": <true|false>, // true if an incident should be created
  "incidentType": "<string>", // e.g., crowd, fire, medical
  "suggestedAction": "<string>"
}\nThe capacity limit for this zone is ${zoneCapacity}.\nIf peopleCount is above 75% of capacity, set potentialRisk to true.\nIf peopleCount exceeds capacity, or if smoke/fire/medicalEmergency is detected, set incidentRecommended to true and specify the incidentType.`;

        logger.log("📨 Gemini Prompt:", prompt.substring(0, 200));

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

        let peopleCount = 0;
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
          peopleCount = json.peopleCount ?? 0;
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

        // Update media doc with analysis
        await mediaDoc.ref.update({
          peopleCount,
          crowdDensity,
          smokeDetected,
          fireDetected,
          medicalEmergency,
          potentialRisk,
          incidentRecommended,
          incidentType,
          suggestedAction,
          analyzedAt: FieldValue.serverTimestamp(),
        });

        // Decision logic: create incident only if incidentRecommended is true
        if (incidentRecommended && incidentType) {
          let incidentDesc = [];
          let tags = [];
          let priority = "medium";
          let severity = 3;
          if (incidentType === "crowd") {
            if (peopleCount > zoneCapacity) {
              incidentDesc.push(`Overcrowding detected: ${peopleCount} > capacity ${zoneCapacity}`);
              tags.push("overcrowding");
              priority = "high";
              severity = 4;
            } else if (potentialRisk) {
              incidentDesc.push(`Potential crowd risk: ${peopleCount} / ${zoneCapacity}`);
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
          const respondersSnap = await db.collection("responders")
            .where("status", "==", "available")
            .where("type", "in", [incidentType === "fire" ? "Fire Brigade" : incidentType === "medical" ? "Medical" : "Security"])
            .limit(1)
            .get();
          let assignedResponderId = null;
          if (!respondersSnap.empty) {
            const responderDoc = respondersSnap.docs[0];
            assignedResponderId = responderDoc.id;
            // Mark responder as assigned
            await responderDoc.ref.update({
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
            timestamp: FieldValue.serverTimestamp(),
            reportedBy: "system-gemini",
            assignedResponderId: assignedResponderId || null,
            assignmentTransactionId: null, // will update after assignment
            environmentalData: {},
            crowdData: {
              density: crowdDensity,
              peopleCount,
            },
            equipment: [],
            tags,
            media: {
              photos: [publicImageUrl],
            },
            lastUpdated: FieldValue.serverTimestamp(),
            resolvedAt: null,
            autoGenerated: true,
            source: "Gemini Vision",
          });

          // Create responder assignment if responder assigned
          if (assignedResponderId) {
            const assignmentRef = await db.collection("responderAssignments").add({
              incidentId: incidentRef.id,
              responderId: assignedResponderId,
              assignedAt: FieldValue.serverTimestamp(),
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
            await db.collection("responders").doc(assignedResponderId).update({ assignedIncident: incidentRef.id });
          }

          logger.log(`🚨 Incident created for ${zoneId} (type: ${incidentType})`);
        }

        logger.log(
          `✅ Crowd analysis complete: ${peopleCount} people, density=${crowdDensity}, smoke=${smokeDetected}, fire=${fireDetected}, medical=${medicalEmergency}`
        );
      } catch (err) {
        logger.error("❌ Gemini analysis failed", err);
      }
    }
  );
