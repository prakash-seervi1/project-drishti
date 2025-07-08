const functions = require("firebase-functions");
const Busboy = require("busboy");
const { VertexAI } = require("@google-cloud/vertexai");

const project = "project-drishti-mvp-31f1b";
const location = "us-central1";

// Initialize Gemini model
const vertexAI = new VertexAI({ project, location });
const model = vertexAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  safetySettings: [],
  generationConfig: {
    temperature: 0.4,
    topK: 32,
    topP: 1,
    maxOutputTokens: 512,
  },
});

module.exports = (vertexAI, corsHandler) =>
  functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
      if (req.method !== "POST") {
        return res.status(405).json({
          success: false,
          error: "Method Not Allowed",
          timestamp: new Date().toISOString()
        });
      }

      const busboy = Busboy({ headers: req.headers });
      let description = "";
      let imageBuffer = Buffer.alloc(0);
      let zone = "";
      let contactInfo = "";
      let itemType = "";

      busboy.on("field", (fieldname, val) => {
        switch (fieldname) {
          case "description":
            description = val;
            break;
          case "zone":
            zone = val;
            break;
          case "contactInfo":
            contactInfo = val;
            break;
          case "itemType":
            itemType = val;
            break;
        }
      });

      busboy.on("file", (fieldname, file) => {
        file.on("data", (data) => {
          imageBuffer = Buffer.concat([imageBuffer, data]);
        });
      });

      busboy.on("finish", async () => {
        try {
          console.log("Enhanced Lost and Found Request:", {
            hasImage: imageBuffer.length > 0,
            description,
            zone,
            itemType
          });

          if (!description && imageBuffer.length === 0) {
            return res.status(400).json({
              success: false,
              error: "Either description or image is required",
              timestamp: new Date().toISOString()
            });
          }

          // Analyze the item using AI
          const analysis = await analyzeLostItem(description, imageBuffer, zone, itemType);

          // Check for potential matches in existing items
          const matches = await findPotentialMatches(description, itemType, zone);

          // Create lost item record
          const itemRecord = await createItemRecord({
            description,
            zone,
            contactInfo,
            itemType,
            analysis,
            imageBuffer,
            timestamp: new Date()
          });

          // Determine if security alert is needed
          const securityAlert = await determineSecurityAlert(analysis, description);

          const response = {
            success: true,
            analysis: {
              category: analysis.category,
              confidence: analysis.confidence,
              securityRisk: analysis.securityRisk,
              estimatedValue: analysis.estimatedValue
            },
            matches: matches.slice(0, 3), // Top 3 matches
            itemId: itemRecord.id,
            securityAlert,
            recommendations: generateRecommendations(analysis, matches),
            timestamp: new Date().toISOString()
          };

          console.log("Enhanced Lost and Found Response:", response);
          return res.status(200).json(response);

        } catch (err) {
          console.error("Enhanced Lost and Found error:", err);
          return res.status(500).json({
            success: false,
            error: "Internal server error",
            details: err.message,
            timestamp: new Date().toISOString()
          });
        }
      });

      busboy.on("error", (err) => {
        console.error("Busboy Error:", err);
        return res.status(500).json({
          success: false,
          error: "File upload error",
          details: err.message,
          timestamp: new Date().toISOString()
        });
      });

      req.pipe(busboy);
    });
  });

// Analyze lost item using AI
async function analyzeLostItem(description, imageBuffer, zone, itemType) {
  try {
    let prompt = `Analyze this lost item and provide detailed information.

Description: "${description}"
Zone: ${zone}
Item Type: ${itemType}

Please analyze and return ONLY this JSON format:
{
  "category": "electronics|clothing|jewelry|documents|other",
  "confidence": 0.95,
  "securityRisk": "low|medium|high",
  "estimatedValue": "low|medium|high",
  "keyFeatures": ["feature1", "feature2"],
  "urgency": "low|medium|high",
  "recommendedActions": ["action1", "action2"]
}

Consider:
- Item value and security implications
- Whether it contains personal/sensitive information
- Appropriate urgency level
- Recommended next steps`;

    let parts = [{ text: prompt }];

    // Add image analysis if available
    if (imageBuffer.length > 0) {
      const base64Image = imageBuffer.toString('base64');
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image,
        },
      });
      
      prompt += "\n\nImage analysis: Please also analyze the uploaded image to provide more accurate categorization and assessment.";
    }

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    });

    const text = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    
    let analysis;
    try {
      analysis = JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      analysis = {
        category: "other",
        confidence: 0.5,
        securityRisk: "low",
        estimatedValue: "low",
        keyFeatures: [],
        urgency: "low",
        recommendedActions: ["Contact lost and found desk"]
      };
    }

    return analysis;

  } catch (error) {
    console.error("Error analyzing lost item:", error);
    return {
      category: "other",
      confidence: 0.5,
      securityRisk: "low",
      estimatedValue: "low",
      keyFeatures: [],
      urgency: "low",
      recommendedActions: ["Contact lost and found desk"]
    };
  }
}

// Find potential matches in existing items
async function findPotentialMatches(description, itemType, zone) {
  try {
    // This would typically query a database of found items
    // For now, return mock data
    const mockMatches = [
      {
        id: "found_001",
        description: "Black iPhone 13",
        foundAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        foundZone: zone,
        matchScore: 0.85,
        status: "unclaimed"
      },
      {
        id: "found_002", 
        description: "Silver laptop",
        foundAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        foundZone: "Zone B",
        matchScore: 0.65,
        status: "unclaimed"
      }
    ];

    // Filter and sort by relevance
    return mockMatches
      .filter(match => {
        const descriptionMatch = match.description.toLowerCase().includes(description.toLowerCase()) ||
                                description.toLowerCase().includes(match.description.toLowerCase());
        const typeMatch = !itemType || match.description.toLowerCase().includes(itemType.toLowerCase());
        const zoneMatch = !zone || match.foundZone === zone;
        
        return descriptionMatch && typeMatch && zoneMatch;
      })
      .sort((a, b) => b.matchScore - a.matchScore);

  } catch (error) {
    console.error("Error finding matches:", error);
    return [];
  }
}

// Create item record in database
async function createItemRecord(itemData) {
  try {
    // This would typically save to Firestore
    // For now, return mock record
    const record = {
      id: `lost_${Date.now()}`,
      description: itemData.description,
      zone: itemData.zone,
      contactInfo: itemData.contactInfo,
      itemType: itemData.itemType,
      analysis: itemData.analysis,
      status: "reported",
      timestamp: itemData.timestamp,
      imageUrl: itemData.imageBuffer.length > 0 ? "uploaded" : null
    };

    console.log("Created item record:", record.id);
    return record;

  } catch (error) {
    console.error("Error creating item record:", error);
    throw error;
  }
}

// Determine if security alert is needed
async function determineSecurityAlert(analysis, description) {
  try {
    const securityKeywords = [
      'phone', 'laptop', 'wallet', 'purse', 'keys', 'id', 'passport', 
      'credit card', 'money', 'jewelry', 'electronics'
    ];

    const hasSecurityKeywords = securityKeywords.some(keyword => 
      description.toLowerCase().includes(keyword)
    );

    const securityAlert = {
      needed: analysis.securityRisk === 'high' || hasSecurityKeywords,
      level: analysis.securityRisk,
      reason: analysis.securityRisk === 'high' ? 'High-value item reported' : 
              hasSecurityKeywords ? 'Contains sensitive items' : 'Standard procedure',
      actions: analysis.securityRisk === 'high' ? 
        ['Notify security immediately', 'Monitor for suspicious activity'] :
        ['Standard lost and found procedure']
    };

    return securityAlert;

  } catch (error) {
    console.error("Error determining security alert:", error);
    return {
      needed: false,
      level: 'low',
      reason: 'Standard procedure',
      actions: ['Standard lost and found procedure']
    };
  }
}

// Generate recommendations based on analysis and matches
function generateRecommendations(analysis, matches) {
  const recommendations = [];

  // Add AI-generated recommendations
  if (analysis.recommendedActions) {
    recommendations.push(...analysis.recommendedActions);
  }

  // Add match-based recommendations
  if (matches.length > 0) {
    recommendations.push(`Found ${matches.length} similar items - check with lost and found desk`);
  }

  // Add urgency-based recommendations
  if (analysis.urgency === 'high') {
    recommendations.push('Report to security immediately');
    recommendations.push('Check nearby areas thoroughly');
  }

  // Add category-based recommendations
  switch (analysis.category) {
    case 'electronics':
      recommendations.push('Check if device has tracking enabled');
      recommendations.push('Monitor for device activation');
      break;
    case 'documents':
      recommendations.push('Check for personal identification');
      recommendations.push('Notify relevant authorities if needed');
      break;
    case 'jewelry':
      recommendations.push('Document detailed description');
      recommendations.push('Check security cameras');
      break;
  }

  // Add general recommendations
  recommendations.push('Leave contact information with lost and found');
  recommendations.push('Check back periodically');

  return recommendations.slice(0, 5); // Limit to top 5 recommendations
} 