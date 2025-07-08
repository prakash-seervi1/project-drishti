// Test file to demonstrate Gemini-powered query analysis
const { analyzeQueryWithGemini } = require('./enhanced-chat-agent');

// Test queries to demonstrate the enhanced analysis
const testQueries = [
  "What are the recent fire incidents?",
  "How many people are in Zone A?",
  "Are there any available medical responders?",
  "Show me critical incidents in the last hour",
  "What's the overall system status?",
  "Are there any security issues in Zone B?",
  "How many active incidents do we have?",
  "What's the occupancy level in Zone C?",
  "Are there any fire brigade units available?",
  "Show me incident statistics for today"
];

async function testGeminiAnalysis() {
  console.log('🧪 Testing Gemini-powered Query Analysis\n');
  
  for (const query of testQueries) {
    try {
      console.log(`📝 Query: "${query}"`);
      
      const analysis = await analyzeQueryWithGemini(query);
      
      if (analysis) {
        console.log('✅ Gemini Analysis Result:');
        console.log(`   Context Type: ${analysis.contextType}`);
        console.log(`   Intent: ${analysis.intent}`);
        console.log(`   Needs Incidents: ${analysis.needsIncidents}`);
        console.log(`   Needs Zones: ${analysis.needsZones}`);
        console.log(`   Needs Responders: ${analysis.needsResponders}`);
        console.log(`   Needs Analytics: ${analysis.needsAnalytics}`);
        
        if (analysis.specificFilters && Object.keys(analysis.specificFilters).length > 0) {
          console.log(`   Filters: ${JSON.stringify(analysis.specificFilters)}`);
        }
        
        if (analysis.suggestedSearches && analysis.suggestedSearches.length > 0) {
          console.log(`   Suggested Searches: ${analysis.suggestedSearches.join(', ')}`);
        }
      } else {
        console.log('⚠️  Gemini analysis failed, would fall back to manual analysis');
      }
      
      console.log(''); // Empty line for readability
      
    } catch (error) {
      console.error(`❌ Error analyzing query: ${error.message}`);
      console.log('');
    }
  }
}

// Example usage scenarios
const exampleScenarios = [
  {
    name: "Emergency Response Query",
    query: "There's a fire in Zone A, what responders are available?",
    expectedAnalysis: {
      contextType: "incidents",
      needsIncidents: true,
      needsResponders: true,
      specificFilters: { zone: "Zone A", type: "fire" },
      intent: "incident_analysis"
    }
  },
  {
    name: "Crowd Management Query", 
    query: "How crowded is Zone B right now?",
    expectedAnalysis: {
      contextType: "zones",
      needsZones: true,
      specificFilters: { zone: "Zone B" },
      intent: "zone_analysis"
    }
  },
  {
    name: "Analytics Query",
    query: "Show me today's incident summary",
    expectedAnalysis: {
      contextType: "analytics",
      needsAnalytics: true,
      intent: "analytics"
    }
  }
];

async function testSpecificScenarios() {
  console.log('🎯 Testing Specific Scenarios\n');
  
  for (const scenario of exampleScenarios) {
    console.log(`📋 Scenario: ${scenario.name}`);
    console.log(`   Query: "${scenario.query}"`);
    console.log(`   Expected: ${JSON.stringify(scenario.expectedAnalysis)}`);
    
    try {
      const analysis = await analyzeQueryWithGemini(scenario.query);
      
      if (analysis) {
        console.log(`   ✅ Actual: ${JSON.stringify(analysis)}`);
        
        // Check if analysis matches expectations
        const matches = Object.keys(scenario.expectedAnalysis).every(key => {
          if (key === 'specificFilters') {
            return JSON.stringify(analysis[key]) === JSON.stringify(scenario.expectedAnalysis[key]);
          }
          return analysis[key] === scenario.expectedAnalysis[key];
        });
        
        console.log(`   ${matches ? '✅' : '❌'} Analysis matches expectations: ${matches}`);
      } else {
        console.log('   ⚠️  Analysis failed');
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('');
  }
}

// Run tests
if (require.main === module) {
  console.log('🚀 Starting Gemini Query Analysis Tests\n');
  
  Promise.all([
    testGeminiAnalysis(),
    testSpecificScenarios()
  ]).then(() => {
    console.log('✅ All tests completed!');
  }).catch(error => {
    console.error('❌ Test suite failed:', error);
  });
}

module.exports = {
  testGeminiAnalysis,
  testSpecificScenarios
}; 