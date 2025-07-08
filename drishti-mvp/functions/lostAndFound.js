const functions = require("firebase-functions")
const Busboy = require("busboy")
const { VertexAI } = require("@google-cloud/vertexai")

const project = "project-drishti-mvp-31f1b"
const location = "us-central1"

// Initialize Gemini model
const vertexAI = new VertexAI({ project, location })
const model = vertexAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  safetySettings: [],
  generationConfig: {
    temperature: 0.4,
    topK: 32,
    topP: 1,
    maxOutputTokens: 256,
  },
})
module.exports = (vertexAI, corsHandler) =>
  functions.https.onRequest((req, res) => {
    corsHandler(req, res, () => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed")
  }

  const busboy = Busboy({ headers: req.headers })
  let description = ""
  let imageBuffer = Buffer.alloc(0)

  busboy.on("field", (fieldname, val) => {
    if (fieldname === "description") {
      description = val
    }
  })

  busboy.on("file", (fieldname, file) => {
    file.on("data", (data) => {
      imageBuffer = Buffer.concat([imageBuffer, data])
    })
  })

  busboy.on("finish", async () => {
    try {
      if (!description) {
        return res.status(400).json({ message: "Missing description" })
      }

      // Construct prompt
      const prompt = `You are an AI assistant at a large event's lost and found desk.
A person uploaded a photo and described it as:
"${description}".

Should I alert security or dispatch help? Respond with match/no match and a short reason.`

      console.log("Prompt to Gemini:", prompt)

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      })

      const response = result.response
      const text =
        response?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "⚠️ No meaningful response from Gemini."

      console.log("Gemini response:", text)

      return res.status(200).json({ message: text })
    } catch (err) {
      console.error("Gemini error:", err)
      return res
        .status(500)
        .json({ message: "Internal server error from Gemini" })
    }
  })

  busboy.on("error", (err) => {
    console.error("Busboy Error:", err)
      return res
      .status(404)
      .json({ message: "Internal server error from Gemini" })
  });
  
  req.pipe(busboy)
})
})