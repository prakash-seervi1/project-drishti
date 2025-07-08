const { onRequest } = require("firebase-functions/v2/https");

// 🌍 Helper: Haversine formula to calculate distance between two geo points
function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = deg => deg * (Math.PI / 180);
  const R = 6371; // Radius of Earth in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 🚨 Main function
module.exports = (db, corsHandler) =>
  onRequest(async (req, res) => {
    corsHandler(req, res, async () => {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
      }

      const { incidentId, lat, lon, incidentType } = req.body;

      if (!incidentId || lat === undefined || lon === undefined || !incidentType) {
        return res.status(400).json({ error: "Missing parameters" });
      }

      try {
        // 1. Get all available responders of the required type
        const snapshot = await db
          .collection("responders")
          .where("available", "==", true)
          .where("type", "==", incidentType.toLowerCase())
          .get();

        if (snapshot.empty) {
          return res.status(200).json({ success: false, message: "No available responders found." });
        }

        // 2. Find the closest one
        let closest = null;
        let minDistance = Infinity;

        snapshot.forEach(doc => {
          const data = doc.data();
          const distance = haversineDistance(lat, lon, data.lat, data.lon);

          if (distance < minDistance) {
            minDistance = distance;
            closest = { id: doc.id, ...data, distance };
          }
        });

        if (!closest) {
          return res.status(200).json({ success: false, message: "No responder matched." });
        }

        // 3. Mark responder as unavailable
        await db.collection("responders").doc(closest.id).update({
          available: false,
          assignedAt: new Date().toISOString(),
        });

        // 4. Update the incident with responder assignment
        await db.collection("incidents").doc(incidentId).update({
          responderId: closest.id,
          responderName: closest.name,
          responderType: closest.type,
          dispatchTime: new Date().toISOString(),
        });

        return res.status(200).json({
          success: true,
          responder: {
            id: closest.id,
            name: closest.name,
            type: closest.type,
            distance: `${minDistance.toFixed(2)} km`,
          },
        });

      } catch (err) {
        console.error("Dispatch error:", err);
        return res.status(500).json({ error: "Internal server error." });
      }
    });
  });
