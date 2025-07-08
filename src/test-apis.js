// Test script to verify all Firebase Functions APIs are working
// Run this in the browser console to test the APIs

import { 
  incidentsAPI, 
  zonesAPI, 
  respondersAPI, 
  emergencyContactsAPI, 
  systemAPI, 
  chatAPI, 
  uploadAPI, 
  geminiAPI 
} from './services/api.js'

// Test function to run all API tests
async function testAllAPIs() {
  console.log('🧪 Starting API Tests...\n')
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  }

  // Helper function to run a test
  const runTest = async (name, testFn) => {
    try {
      console.log(`Testing: ${name}`)
      const result = await testFn()
      console.log(`✅ ${name}: PASSED`)
      results.passed++
      results.tests.push({ name, status: 'PASSED', result })
      return true
    } catch (error) {
      console.log(`❌ ${name}: FAILED - ${error.message}`)
      results.failed++
      results.tests.push({ name, status: 'FAILED', error: error.message })
      return false
    }
  }

  // Test 1: System Health Check
  await runTest('System Health Check', async () => {
    const response = await systemAPI.healthCheck()
    if (!response.success) throw new Error('Health check failed')
    return response
  })

  // Test 2: Get System Status
  await runTest('Get System Status', async () => {
    const response = await systemAPI.getSystemStatus()
    if (!response.success) throw new Error('System status failed')
    return response
  })

  // Test 3: Get Incidents
  await runTest('Get Incidents', async () => {
    const response = await incidentsAPI.getIncidents({ limit: 5 })
    if (!response.success) throw new Error('Get incidents failed')
    return response
  })

  // Test 4: Get Zones
  await runTest('Get Zones', async () => {
    const response = await zonesAPI.getZones()
    if (!response.success) throw new Error('Get zones failed')
    return response
  })

  // Test 5: Get Responders
  await runTest('Get Responders', async () => {
    const response = await respondersAPI.getResponders()
    if (!response.success) throw new Error('Get responders failed')
    return response
  })

  // Test 6: Get Emergency Contacts
  await runTest('Get Emergency Contacts', async () => {
    const response = await emergencyContactsAPI.getEmergencyContacts()
    if (!response.success) throw new Error('Get emergency contacts failed')
    return response
  })

  // Test 7: Get Incident Analytics
  await runTest('Get Incident Analytics', async () => {
    const response = await incidentsAPI.getIncidentAnalytics()
    if (!response.success) throw new Error('Get incident analytics failed')
    return response
  })

  // Test 8: Get Responder Analytics
  await runTest('Get Responder Analytics', async () => {
    const response = await respondersAPI.getResponderAnalytics()
    if (!response.success) throw new Error('Get responder analytics failed')
    return response
  })

  // Test 9: Get System Analytics
  await runTest('Get System Analytics', async () => {
    const response = await systemAPI.getAnalytics()
    if (!response.success) throw new Error('Get system analytics failed')
    return response
  })

  // Test 10: Chat Agent
  await runTest('Chat Agent', async () => {
    const response = await chatAPI.enhancedChatAgent('Hello, can you give me a system overview?')
    if (!response.success) throw new Error('Chat agent failed')
    return response
  })

  // Test 11: Gemini Analysis
  await runTest('Gemini Analysis', async () => {
    const response = await geminiAPI.analyzeWithGemini({
      prompt: 'Give me a brief overview of the current system status',
      context: 'System overview request'
    })
    if (!response.success) throw new Error('Gemini analysis failed')
    return response
  })

  // Test 12: Get Signed Upload URL
  await runTest('Get Signed Upload URL', async () => {
    const response = await uploadAPI.getSignedUploadUrl({
      fileName: 'test.jpg',
      fileType: 'image/jpeg',
      folder: 'incidents'
    })
    if (!response.success) throw new Error('Get signed upload URL failed')
    return response
  })

  // Print summary
  console.log('\n📊 Test Results Summary:')
  console.log(`✅ Passed: ${results.passed}`)
  console.log(`❌ Failed: ${results.failed}`)
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`)
  
  if (results.failed > 0) {
    console.log('\n❌ Failed Tests:')
    results.tests
      .filter(test => test.status === 'FAILED')
      .forEach(test => {
        console.log(`  - ${test.name}: ${test.error}`)
      })
  }

  console.log('\n🎉 API Testing Complete!')
  return results
}

// Export for use in browser console
window.testAllAPIs = testAllAPIs

// Auto-run if this script is loaded directly
if (typeof window !== 'undefined') {
  console.log('🚀 API Test Suite Loaded!')
  console.log('Run testAllAPIs() in the console to test all APIs')
}

export { testAllAPIs } 