"use client"

import { useState } from "react"
import SystemArchitecture from "../components/SystemArchitecture"
import UserInterfaceWireframes from "../components/UserInterfaceWireframes"
import ProcessFlowDiagrams from "../components/ProcessFlowDiagrams"
import { Download, Copy, FileText, Presentation, Code, Zap, Brain, Eye, Shield, Users, TrendingUp } from "lucide-react"

export default function WireframesPage() {
  const [activeTab, setActiveTab] = useState("architecture")
  const [showPresentationData, setShowPresentationData] = useState(false)

  const presentationData = {
    executiveSummary: {
      title: "Project Drishti: Agentic AI Safety Platform",
      subtitle: "Revolutionizing Event Safety with Google AI Technologies",
      keyPoints: [
        "15-20 minute predictive bottleneck analysis using Vertex AI Forecasting",
        "Autonomous incident detection and response with Gemini multimodal AI",
        "85% faster emergency response times through intelligent automation",
        "70% improvement in crowd flow efficiency with predictive analytics",
        "95% accuracy in Lost & Found AI matching using Vision AI",
      ],
    },
    technicalSpecs: {
      aiTechnologies: [
        "Vertex AI Agent Builder - Intelligent decision orchestration",
        "Gemini Multimodal - Natural language processing and anomaly detection",
        "Vertex AI Vision - Real-time video analysis and crowd monitoring",
        "Vertex AI Forecasting - Predictive bottleneck analysis (15-20 min horizon)",
        "Firebase Realtime Database - Live data synchronization",
        "Google Maps API - Optimal routing and navigation",
        "Google Cloud Functions - Serverless AI processing",
      ],
      capabilities: [
        "Multimodal anomaly detection (fire, smoke, crowd surges)",
        "Natural language situational summaries",
        "Autonomous resource dispatch and routing",
        "AI-powered Lost & Found with photo matching",
        "Real-time crowd sentiment analysis",
        "Predictive capacity planning and bottleneck prevention",
      ],
    },
    businessImpact: {
      metrics: [
        {
          metric: "Response Time Improvement",
          value: "85%",
          description: "Faster emergency response through AI automation",
        },
        {
          metric: "Flow Efficiency Gain",
          value: "70%",
          description: "Optimized crowd movement with predictive analytics",
        },
        {
          metric: "Incident Prediction Accuracy",
          value: "95%",
          description: "Proactive bottleneck detection and prevention",
        },
        { metric: "Manual Workload Reduction", value: "60%", description: "Automated reporting and decision making" },
        {
          metric: "Lost Item Recovery Rate",
          value: "90%",
          description: "AI-powered photo matching and location tracking",
        },
      ],
      roi: "Expected 300% ROI within 18 months through reduced incidents, improved efficiency, and enhanced visitor satisfaction",
    },
    implementationRoadmap: [
      {
        phase: "Phase 1 (Months 1-3)",
        items: ["Core AI infrastructure setup", "Vertex AI model training", "Basic incident detection"],
      },
      {
        phase: "Phase 2 (Months 4-6)",
        items: ["Predictive analytics deployment", "Mobile app development", "Staff training"],
      },
      { phase: "Phase 3 (Months 7-9)", items: ["Advanced AI features", "Lost & Found AI", "Full automation"] },
      {
        phase: "Phase 4 (Months 10-12)",
        items: ["Performance optimization", "Scale deployment", "Advanced analytics"],
      },
    ],
  }

  const speakerNotes = `
SLIDE 1: Project Drishti Overview
- Introduce the agentic AI safety platform concept
- Emphasize Google AI technology integration
- Highlight the 15-20 minute predictive capability

SLIDE 2: System Architecture
- Walk through the data flow from input sources to AI processing
- Explain how Vertex AI, Gemini, and Firebase work together
- Demonstrate the autonomous decision-making capabilities

SLIDE 3: User Interface Design
- Show the multi-platform approach (desktop, tablet, mobile)
- Highlight the natural language interface powered by Gemini
- Demonstrate the AI-powered features in each interface

SLIDE 4: Process Flows
- Explain the incident detection and response workflow
- Detail the predictive bottleneck analysis pipeline
- Show user journey mapping for different stakeholders

SLIDE 5: Business Impact
- Present the key performance metrics and ROI projections
- Emphasize the safety and efficiency improvements
- Discuss the competitive advantages of AI automation

SLIDE 6: Implementation Roadmap
- Outline the phased deployment approach
- Highlight quick wins and long-term benefits
- Address potential challenges and mitigation strategies

KEY TALKING POINTS:
- "Project Drishti represents the future of event safety management"
- "Our agentic AI can predict and prevent incidents before they occur"
- "Google AI technologies provide unmatched accuracy and reliability"
- "The platform pays for itself through improved efficiency and reduced incidents"
- "We're not just detecting problems - we're preventing them"
  `

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Project Drishti Wireframes</h1>
              <p className="text-gray-600">Comprehensive design documentation for the agentic AI safety platform</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowPresentationData(!showPresentationData)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Presentation className="w-4 h-4" />
                <span>PPT Data</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("architecture")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "architecture"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              System Architecture
            </button>
            <button
              onClick={() => setActiveTab("interfaces")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "interfaces"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              User Interfaces
            </button>
            <button
              onClick={() => setActiveTab("processes")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "processes"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Process Flows
            </button>
            <button
              onClick={() => setActiveTab("enhanced-dashboard")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "enhanced-dashboard"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Enhanced Dashboard
            </button>
          </nav>
        </div>
      </div>

      {/* Presentation Data Panel */}
      {showPresentationData && (
        <div className="bg-blue-50 border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Presentation-Ready Content</h2>
                <button onClick={() => setShowPresentationData(false)} className="text-gray-400 hover:text-gray-600">
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Executive Summary */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 flex items-center">
                    <Presentation className="w-4 h-4 mr-2" />
                    Executive Summary
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium">{presentationData.executiveSummary.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{presentationData.executiveSummary.subtitle}</p>
                    <ul className="text-sm space-y-1">
                      {presentationData.executiveSummary.keyPoints.map((point, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(presentationData.executiveSummary, null, 2))}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Executive Summary</span>
                  </button>
                </div>

                {/* Business Impact */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Business Impact
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {presentationData.businessImpact.metrics.map((item, index) => (
                        <div key={index} className="text-center">
                          <div className="text-lg font-bold text-blue-600">{item.value}</div>
                          <div className="text-xs text-gray-600">{item.metric}</div>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-700">{presentationData.businessImpact.roi}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(presentationData.businessImpact, null, 2))}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Business Impact</span>
                  </button>
                </div>

                {/* Technical Specifications */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 flex items-center">
                    <Code className="w-4 h-4 mr-2" />
                    Technical Specifications
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">AI Technologies:</h4>
                    <ul className="text-sm space-y-1 mb-3">
                      {presentationData.technicalSpecs.aiTechnologies.map((tech, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-600 mr-2">•</span>
                          {tech}
                        </li>
                      ))}
                    </ul>
                    <h4 className="font-medium mb-2">Key Capabilities:</h4>
                    <ul className="text-sm space-y-1">
                      {presentationData.technicalSpecs.capabilities.map((cap, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-purple-600 mr-2">•</span>
                          {cap}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(presentationData.technicalSpecs, null, 2))}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Technical Specs</span>
                  </button>
                </div>

                {/* Speaker Notes */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Speaker Notes
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                      {speakerNotes.substring(0, 500)}...
                    </pre>
                  </div>
                  <button
                    onClick={() => copyToClipboard(speakerNotes)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Full Speaker Notes</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === "architecture" && <SystemArchitecture />}
        {activeTab === "interfaces" && <UserInterfaceWireframes />}
        {activeTab === "processes" && <ProcessFlowDiagrams />}
        {activeTab === "enhanced-dashboard" && (
          <div>
            <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center">
              <span className="mr-2">🧠</span> Enhanced Dashboard Overview
            </h2>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <pre className="overflow-x-auto text-xs md:text-sm" style={{ fontFamily: 'monospace' }}>{`
---------------------------------------------------------------+
| [Logo]  Event Safety Dashboard         [User/Settings Icon]   |
+---------------------------------------------------------------+
| Zone: [Dropdown ▼]  |  Capacity: 500  |  Current: 320 (High)  |
+---------------------------------------------------------------+
| [Critical Alerts]   | [Incident Analytics] | [Responder Teams]|
+---------------------+---------------------+-------------------+
| [Crowd Forecast Analytics]                                   |
|  ---------------------------------------------------------   |
| |  [Line Chart: History + Forecast]                      |   |
| |  [Alert: "Forecasted crowd exceeds safe limit!"]       |   |
|  ---------------------------------------------------------   |
+---------------------------------------------------------------+
| [Live Command Feed] | [Zone Status] | [Action Center]         |
+---------------------+---------------+-------------------------+
| [Emergency Contacts]                                         |
+---------------------------------------------------------------+
| [Camera Upload & AI Analysis]                                |
|  - Floating Action Bar, Camera Modal, AI Results, Incident   |
+---------------------------------------------------------------+
| [Incident Management]                                        |
|  - Incident List, Details, Map View                          |
+---------------------------------------------------------------+
| [Predictive Analytics]                                       |
|  - Forecast Table/Chart, Proactive Alerts                    |
+---------------------------------------------------------------+
| [AI Assistant] (Floating Button, Chat, Contextual Help)      |
+---------------------------------------------------------------+
`}</pre>
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Key Features</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li><b>Crowd Forecast Analytics:</b> <span className="text-gray-600">Live and forecasted crowd data per zone, with alerting if capacity is exceeded. (Component: <code>CrowdForecastChart</code>)</span></li>
                  <li><b>Camera Upload & AI Analysis:</b> <span className="text-gray-600">Capture images or live stream, upload to backend, and trigger AI analysis for incidents. (Components: <code>CameraCapture</code>, <code>FloatingActionBar</code>)</span></li>
                  <li><b>AI Assistant:</b> <span className="text-gray-600">Conversational assistant for analytics, incident queries, and operator help. (Component: <code>AIAssistant</code>)</span></li>
                  <li><b>Incident Management:</b> <span className="text-gray-600">Incident list, details, timeline, map, and responder assignment. (See <code>IncidentDetail</code> and <code>incidents/</code> components)</span></li>
                  <li><b>Live Command Feed:</b> <span className="text-gray-600">Live video and command interface for each zone. (Component: <code>LiveCommandFeed</code>)</span></li>
                  <li><b>Zone Status:</b> <span className="text-gray-600">Overview and quick status for all zones. (Component: <code>ZoneStatus</code>)</span></li>
                  <li><b>Action Center:</b> <span className="text-gray-600">Quick actions for dispatch, alerts, and routing. (Component: <code>ActionCenter</code>)</span></li>
                  <li><b>Emergency Contacts:</b> <span className="text-gray-600">Quick-call and status for emergency services. (Component: <code>EmergencyContacts</code>)</span></li>
                  <li><b>Critical Alerts & Analytics:</b> <span className="text-gray-600">Real-time alerts and incident analytics. (Components: <code>Alerts</code>, <code>IncidentAnalytics</code>)</span></li>
                  <li><b>AI Situation Summary:</b> <span className="text-gray-600">AI-powered summary and recommendations. (Component: <code>AISituationSummary</code>)</span></li>
                </ul>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">How It Works</h3>
                <ol className="list-decimal pl-6 space-y-1 text-gray-700">
                  <li>Operators monitor the dashboard for real-time crowd, incident, and alert data.</li>
                  <li>AI Assistant is available at all times for queries, analytics, and help.</li>
                  <li>Camera uploads and live streams are analyzed by AI for incident detection and crowd analytics.</li>
                  <li>Forecasting and analytics widgets provide proactive warnings and recommendations.</li>
                  <li>All features are modular and extensible, matching the actual implementation.</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Key Features Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h3 className="text-lg font-semibold mb-6 text-center text-gray-800">
            Project Drishti: Agentic AI Capabilities
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <Brain className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <div className="text-sm font-medium">Predictive AI</div>
              <div className="text-xs text-gray-500">15-20 min forecasting</div>
            </div>
            <div className="text-center">
              <Eye className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="text-sm font-medium">Computer Vision</div>
              <div className="text-xs text-gray-500">Real-time monitoring</div>
            </div>
            <div className="text-center">
              <Zap className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-sm font-medium">Auto Dispatch</div>
              <div className="text-xs text-gray-500">Intelligent routing</div>
            </div>
            <div className="text-center">
              <Shield className="w-8 h-8 mx-auto mb-2 text-red-600" />
              <div className="text-sm font-medium">Safety First</div>
              <div className="text-xs text-gray-500">Proactive protection</div>
            </div>
            <div className="text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <div className="text-sm font-medium">Crowd Analysis</div>
              <div className="text-xs text-gray-500">Sentiment tracking</div>
            </div>
            <div className="text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-indigo-600" />
              <div className="text-sm font-medium">Performance</div>
              <div className="text-xs text-gray-500">85% faster response</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
