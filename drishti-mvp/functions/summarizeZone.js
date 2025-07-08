// functions/summarizeZone.js

const functions = require("firebase-functions");

module.exports = (db, vertexAI, corsHandler) =>
  functions.https.onRequest(async (req, res) => {
    corsHandler(req, res, async () => {
      const zone = req.query.zone || "Zone A";
      console.log(`Requested zone: ${zone}`);

      try {
        const snapshot = await db.collection("incidents").where("zone", "==", zone).get();

        if (snapshot.empty) {
          return res.status(200).send(`No incidents found in ${zone}.`);
        }

        let prompt = `Summarize the following incident reports for ${zone}:\n`;
        snapshot.forEach((doc) => {
          const data = doc.data();
          prompt += `- Type: ${data.type}, Status: ${data.status}\n`;
        });

        const model = vertexAI.getGenerativeModel({
          model: "gemini-2.5-flash",
        });

        const result = await model.generateContent({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
        });

        const output =
          result.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "No summary generated.";
        res.status(200).send(output);
      } catch (error) {
        console.error("Function error:", error);
        res.status(500).send("Internal Server Error: " + error.message);
      }
    });
  });
