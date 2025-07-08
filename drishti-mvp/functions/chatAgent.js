const functions = require("firebase-functions");

module.exports = (db, vertexAI, corsHandler) =>
  functions.https.onRequest(async (req, res) => {
    corsHandler(req, res, async () => {
      const userQuery = req.query.query || "What's happening in Zone A?";
      console.log("User asked:", userQuery);

      try {
        // 1. Fetch recent incidents (limit for now)
        const snapshot = await db.collection("incidents").orderBy("timestamp", "desc").limit(30).get();

        if (snapshot.empty) {
          return res.status(200).send("No incidents found.");
        }

        // 2. Format as data summary
        let incidentData = "";
        snapshot.forEach((doc) => {
          const d = doc.data();
          incidentData += `- Zone: ${d.zone}, Type: ${d.type}, Status: ${d.status}\n`;
        });

        // 3. Build the instruction prompt
        const prompt = `
You are an intelligent event safety assistant.
Your task is to answer the user's query based on the incident logs provided below.

User Query:
"${userQuery}"

Incident Logs:
${incidentData}

Respond in a clear, concise way. If no relevant info exists, say so.
`;

        const model = vertexAI.getGenerativeModel({
          model: "gemini-2.5-flash",
        });

        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        const output =
          result.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "No relevant information.";

        res.status(200).send(output);
      } catch (error) {
        console.error("Agentic error:", error);
        res.status(500).send("Internal Server Error: " + error.message);
      }
    });
  });
