const fetch = require('node-fetch');

async function callToolbox(toolName, parameters) {
  const response = await fetch('http://localhost:8080/v1/toolsets/drishti_toolset/invoke', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tool: toolName,
      parameters: parameters
    })
  });
  return await response.json();
}

// Example usage: get an incident by ID
(async () => {
  const incidentId = 'INCIDENT_ID'; // Replace with a real ID
  const result = await callToolbox('get-incident-by-id', { id: incidentId });
  console.log('Toolbox result:', result);
})(); 