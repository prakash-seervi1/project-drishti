const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

// Helper to call the MCP toolbox server
async function callToolbox(toolName, parameters) {
  const toolboxUrl = process.env.TOOLBOX_URL || 'http://localhost:8080/v1/toolsets/drishti_toolset/invoke';
  const response = await fetch(toolboxUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tool: toolName,
      parameters: parameters
    })
  });
  return await response.json();
}

// Example endpoint: Get incident by ID
app.get('/incident/:id', async (req, res) => {
  try {
    const result = await callToolbox('get-incident-by-id', { id: req.params.id });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Example endpoint: List active incidents
app.get('/incidents/active', async (req, res) => {
  try {
    const result = await callToolbox('list-active-incidents', {});
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Example endpoint: List all zones
app.get('/zones', async (req, res) => {
  try {
    const result = await callToolbox('list-zones', {});
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Example endpoint: List available responders
app.get('/responders/available', async (req, res) => {
  try {
    const result = await callToolbox('list-available-responders', {});
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Chatbot-style endpoint: Accepts a user message and returns an agentic response
app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Missing message in request body.' });
    }

    // Simple intent detection (expand as needed)
    const lower = message.toLowerCase();
    let result, reply;

    if (lower.includes('available responder')) {
      result = await callToolbox('list-available-responders', {});
      reply = `Available responders: ${Array.isArray(result) ? result.length : 0}`;
    } else if (lower.includes('incident') && lower.includes('active')) {
      result = await callToolbox('list-active-incidents', {});
      reply = `Active incidents: ${Array.isArray(result) ? result.length : 0}`;
    } else if (lower.includes('zone')) {
      result = await callToolbox('list-zones', {});
      reply = `Zones: ${Array.isArray(result) ? result.length : 0}`;
    } else if (lower.match(/incident\s+id\s*:?\s*(\w+)/)) {
      // e.g. "incident id: 1234"
      const id = lower.match(/incident\s+id\s*:?\s*(\w+)/)[1];
      result = await callToolbox('get-incident-by-id', { id });
      reply = result ? `Incident ${id}: ${JSON.stringify(result)}` : `No incident found for ID ${id}`;
    } else if (lower.match(/responder\s+id\s*:?\s*(\w+)/)) {
      // e.g. "responder id: 5678"
      const id = lower.match(/responder\s+id\s*:?\s*(\w+)/)[1];
      result = await callToolbox('get-responder-by-id', { id });
      reply = result ? `Responder ${id}: ${JSON.stringify(result)}` : `No responder found for ID ${id}`;
    } else {
      reply = "Sorry, I didn't understand your request. Try asking about available responders, active incidents, or zones.";
    }

    res.json({ reply, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MCP chat agent running on port ${PORT}`);
}); 