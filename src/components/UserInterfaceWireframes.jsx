"use client"

import { useState } from "react"
import html2canvas from "html2canvas"
import { DeviceFrame, WireframeBox, GoogleAIBadge, Annotation } from "./WireframeComponents"
import {
  Search,
  Bell,
  Menu,
  User,
  MapPin,
  Camera,
  Mic,
  AlertTriangle,
  TrendingUp,
  Zap,
  Brain,
  Eye,
  Shield,
  Phone,
  Navigation,
  Video,
  Users,
} from "lucide-react"

export default function UserInterfaceWireframes() {
  const [activeDevice, setActiveDevice] = useState("desktop")

  const DesktopDashboard = () => (
    <DeviceFrame type="desktop">
      {/* Download Screenshot Button and Dashboard Container */}
      <div id="dashboard-capture-area" className="relative">
        <div className="flex justify-end mb-2">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 font-semibold text-sm"
            onClick={async () => {
              const dashboard = document.getElementById("dashboard-capture-area");
              if (!dashboard) return;
              // Hide overlays (e.g., AI Assistant modal overlay) before screenshot
              const overlays = document.querySelectorAll('.fixed.inset-0.z-40');
              overlays.forEach(el => el.style.display = 'none');
              const canvas = await html2canvas(dashboard, { useCORS: true, logging: false });
              overlays.forEach(el => el.style.display = '');
              const link = document.createElement("a");
              link.download = "drishti-dashboard-screenshot.png";
              link.href = canvas.toDataURL("image/png");
              link.click();
            }}
          >
            Download Screenshot
          </button>
        </div>
        <div className="h-full flex flex-col relative">
          {/* Header */}
          <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-blue-400" />
              <h1 className="text-xl font-bold">Project Drishti Command Center</h1>
              <GoogleAIBadge service="Vertex AI" />
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  className="bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg w-64"
                  placeholder="Ask Gemini: 'Show me crowd density at Gate 5'"
                />
              </div>
              <Bell className="w-6 h-6 text-yellow-400" />
              <User className="w-6 h-6" />
            </div>
          </div>

          <div className="flex-1 flex relative">
            {/* Sidebar */}
            <div className="w-64 bg-gray-100 p-4">
              <nav className="space-y-2">
                <div className="font-semibold text-gray-700 mb-4">AI Modules</div>
                <div className="flex items-center space-x-2 p-2 bg-blue-100 rounded">
                  <Brain className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Predictive Analytics</span>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-green-100 rounded">
                  <Eye className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Vision Monitoring</span>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-purple-100 rounded">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">Crowd Analysis</span>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-orange-100 rounded">
                  <Zap className="w-4 h-4 text-orange-600" />
                  <span className="text-sm">Auto Dispatch</span>
                </div>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 relative">
              {/* Zone Selector & Quick Stats */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-4">
                  <span className="font-semibold text-gray-700">Zone:</span>
                  <select className="border border-gray-300 rounded px-3 py-1 text-sm">
                    <option>Main Plaza</option>
                    <option>Gate 5</option>
                    <option>Sector 7</option>
                  </select>
                  <span className="text-gray-500">Capacity: 500</span>
                  <span className="text-gray-500">Current: 320 (High)</span>
                </div>
                <div className="flex space-x-2">
                  <div className="bg-white rounded-lg px-4 py-2 shadow text-sm text-gray-700 flex items-center">
                    <AlertTriangle className="w-4 h-4 text-red-500 mr-1" /> 5 Incidents
                  </div>
                  <div className="bg-white rounded-lg px-4 py-2 shadow text-sm text-gray-700 flex items-center">
                    <Users className="w-4 h-4 text-indigo-500 mr-1" /> 85% Density
                  </div>
                  <div className="bg-white rounded-lg px-4 py-2 shadow text-sm text-gray-700 flex items-center">
                    <User className="w-4 h-4 text-blue-500 mr-1" /> 12 Responders
                  </div>
                </div>
              </div>

              {/* Top Row: Alerts, Analytics, Teams */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <WireframeBox className="h-40 flex flex-col justify-between">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                    <span className="font-semibold">Critical Alerts</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>Fire detected - Sector 7</div>
                    <div className="flex items-center"><span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>Crowd surge - Gate 3</div>
                    <div className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>All clear - Sector 1</div>
                  </div>
                </WireframeBox>
                <WireframeBox className="h-40 flex flex-col justify-between">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="font-semibold">Incident Analytics</span>
                  </div>
                  <div className="text-xs text-gray-600">Bar/line charts for incident types, trends, and stats</div>
                </WireframeBox>
                <WireframeBox className="h-40 flex flex-col justify-between">
                  <div className="flex items-center mb-2">
                    <Users className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-semibold">Responder Teams</span>
                  </div>
                  <div className="text-xs text-gray-600">Status, availability, and quick dispatch</div>
                </WireframeBox>
              </div>

              {/* Crowd Forecast Analytics */}
              <WireframeBox className="h-40 mb-3 relative">
                <div className="absolute top-4 left-4">
                  <GoogleAIBadge service="Vertex AI" />
                </div>
                <div className="flex items-center mb-2">
                  <TrendingUp className="w-5 h-5 text-orange-500 mr-2" />
                  <span className="font-semibold">Crowd Forecast Analytics</span>
                </div>
                <div className="text-xs text-gray-600 mb-2">Line chart: history + forecast, with alert if capacity exceeded</div>
                <div className="bg-orange-50 border-l-4 border-orange-400 p-2 rounded text-xs text-orange-700 mb-2">⚠️ Forecasted crowd exceeds safe limit at 18:30!</div>
                <div className="h-24 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">[Line Chart Placeholder]</div>
              </WireframeBox>

              {/* Middle Row: Live Feed, Zone Status, Action Center */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <WireframeBox className="h-48 flex flex-col justify-between">
                  <div className="flex items-center mb-2">
                    <Video className="w-5 h-5 text-blue-500 mr-2" />
                    <span className="font-semibold">Live Command Feed</span>
                  </div>
                  <div className="text-xs text-gray-600">Live video, zone selection, controls</div>
                </WireframeBox>
                <WireframeBox className="h-48 flex flex-col justify-between">
                  <div className="flex items-center mb-2">
                    <Eye className="w-5 h-5 text-purple-500 mr-2" />
                    <span className="font-semibold">Zone Status</span>
                  </div>
                  <div className="text-xs text-gray-600">Overview of all zones, quick status, camera online/offline</div>
                </WireframeBox>
                <WireframeBox className="h-48 flex flex-col justify-between">
                  <div className="flex items-center mb-2">
                    <Zap className="w-5 h-5 text-yellow-500 mr-2" />
                    <span className="font-semibold">Action Center</span>
                  </div>
                  <div className="text-xs text-gray-600">Quick actions: dispatch, alert, route, AI analysis</div>
                </WireframeBox>
              </div>
     {/* Predictive Analytics */}
     <WireframeBox className="h-24 mb-3 flex flex-col justify-between">
                <div className="flex items-center mb-2">
                  <Brain className="w-5 h-5 text-green-600 mr-2" />
                  <span className="font-semibold">Predictive Analytics</span>
                </div>
                <div className="text-xs text-gray-600">Forecast table/chart, proactive alerts for predicted risks</div>
              </WireframeBox>

                 {/* Incident Management */}
                 <WireframeBox className="h-32 mb-3 flex flex-col justify-between">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="font-semibold">Incident Management</span>
                </div>
                <div className="text-xs text-gray-600">Incident list, details, timeline, map view, responder assignment</div>
              </WireframeBox>

              {/* Emergency Contacts */}
              <WireframeBox className="h-24 mb-3 flex flex-col justify-between">
                <div className="flex items-center mb-2">
                  <Phone className="w-5 h-5 text-red-500 mr-2" />
                  <span className="font-semibold">Emergency Contacts</span>
                </div>
                <div className="text-xs text-gray-600">Quick-call, status, ETA for emergency services</div>
              </WireframeBox>

              {/* Camera Upload & AI Analysis */}
              <WireframeBox className="h-24 mb-3 flex flex-col justify-between">
                <div className="flex items-center mb-2">
                  <Camera className="w-5 h-5 text-purple-600 mr-2" />
                  <span className="font-semibold">Camera Upload & AI Analysis</span>
                </div>
                <div className="text-xs text-gray-600">Floating action bar, camera modal, AI results, incident creation</div>
              </WireframeBox>

           
         

              {/* AI Assistant Floating Button */}
              <div className="fixed bottom-10 right-10 z-50 flex flex-col items-end">
                <button className="w-14 h-14 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl">
                  <Brain className="w-7 h-7" />
                </button>
                <span className="bg-white text-green-700 px-2 py-1 rounded shadow mt-2 text-xs">AI Assistant</span>
              </div>
            </div>
          </div>
        </div>
        {/* Agentic AI Slide-Out Panel */}
        {/* <div className="fixed top-24 right-0 h-[80vh] w-96 bg-white border-l-4 border-green-400 shadow-2xl z-50 flex flex-col p-6 animate-slide-in" style={{ minWidth: 320 }}>
          <h2 className="text-xl font-bold text-green-700 mb-2 flex items-center">
            <Brain className="w-6 h-6 mr-2 text-green-500" /> Agentic AI System
          </h2>
          <p className="text-gray-700 mb-4 text-sm">
            <b>Agentic AI</b> powers the Drishti platform with perception, reasoning, and autonomous action. It continuously monitors, analyzes, and responds to real-world events using Google AI, Gemini, and Vertex AI.
          </p>
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800 mb-1 text-sm">How It Works:</h3>
            <ul className="list-decimal pl-5 text-gray-700 text-sm space-y-1">
              <li><b>Perception:</b> Ingests live video, sensor, and report data</li>
              <li><b>Reasoning:</b> Uses Gemini & Vertex AI for analysis, forecasting, and recommendations</li>
              <li><b>Action:</b> Dispatches responders, sends alerts, updates dashboard in real time</li>
              <li><b>Feedback:</b> Learns from outcomes, operator input, and incident resolution</li>
            </ul>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800 mb-1 text-sm">Agentic Workflow:</h3>
            <div className="flex flex-col items-center">
              <div className="flex items-center space-x-2 mb-2">
                <Eye className="w-5 h-5 text-blue-500" />
                <span className="text-xs">Perception</span>
                <span className="text-gray-400">→</span>
                <Brain className="w-5 h-5 text-purple-500" />
                <span className="text-xs">Reasoning</span>
                <span className="text-gray-400">→</span>
                <Zap className="w-5 h-5 text-orange-500" />
                <span className="text-xs">Action</span>
                <span className="text-gray-400">→</span>
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-xs">Feedback</span>
              </div>
              <div className="text-xs text-gray-500">(Continuous, autonomous event safety loop)</div>
            </div>
          </div>
          <div className="mb-2">
            <h3 className="font-semibold text-gray-800 mb-1 text-sm">Key Capabilities:</h3>
            <ul className="list-disc pl-5 text-gray-700 text-xs space-y-1">
              <li>Conversational AI Assistant for analytics & help</li>
              <li>Real-time incident detection & auto-dispatch</li>
              <li>Predictive crowd analytics & proactive alerts</li>
              <li>Continuous learning from operator feedback</li>
            </ul>
          </div>
          <div className="mt-auto pt-2">
            <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Always On</span>
          </div>
        </div> */}
      </div>
    </DeviceFrame>
  )

  const TabletInterface = () => (
    <DeviceFrame type="tablet">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6" />
            <span className="font-semibold">Field Command</span>
            <GoogleAIBadge service="Vertex AI" />
          </div>
          <div className="flex items-center space-x-3">
            <Mic className="w-6 h-6 text-yellow-300" />
            <Bell className="w-6 h-6" />
            <Menu className="w-6 h-6" />
          </div>
        </div>

        <div className="flex-1 p-4">
          {/* Voice Command Interface */}
          <WireframeBox className="mb-4 relative">
            <div className="flex items-center justify-center space-x-4">
              <Mic className="w-8 h-8 text-blue-600 animate-pulse" />
              <div className="text-center">
                <div className="font-semibold">Voice Command Active</div>
                <div className="text-sm text-gray-600">"Deploy team to Gate 5 bottleneck"</div>
              </div>
            </div>
            <Annotation text="AI-powered voice commands" position="top" color="blue" />
          </WireframeBox>

          <div className="grid grid-cols-2 gap-4">
            {/* Quick Actions */}
            <WireframeBox>
              <div className="w-full">
                <h3 className="font-semibold mb-3">Quick Deploy</h3>
                <div className="space-y-2">
                  <button className="w-full p-2 bg-red-100 text-red-800 rounded text-sm">Emergency Response</button>
                  <button className="w-full p-2 bg-yellow-100 text-yellow-800 rounded text-sm">Crowd Control</button>
                  <button className="w-full p-2 bg-green-100 text-green-800 rounded text-sm">Medical Team</button>
                </div>
              </div>
            </WireframeBox>

            {/* AI Predictions */}
            <WireframeBox className="relative">
              <div className="absolute top-2 right-2">
                <GoogleAIBadge service="Vertex AI" />
              </div>
              <div className="w-full">
                <h3 className="font-semibold mb-3">AI Predictions</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Gate 5 Bottleneck</span>
                    <span className="text-red-600">16 min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Parking Lot Full</span>
                    <span className="text-yellow-600">32 min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Food Court Peak</span>
                    <span className="text-green-600">45 min</span>
                  </div>
                </div>
              </div>
            </WireframeBox>
          </div>
        </div>
      </div>
    </DeviceFrame>
  )

  const MobileApps = () => (
    <div className="grid grid-cols-3 gap-8">
      {/* Security Officer App */}
      <DeviceFrame type="mobile">
        <div className="h-full flex flex-col">
          <div className="bg-blue-600 text-white p-3 text-center">
            <Shield className="w-6 h-6 mx-auto mb-1" />
            <div className="font-semibold text-sm">Security Officer</div>
            <GoogleAIBadge service="Gemini" className="mt-1" />
          </div>

          <div className="flex-1 p-4">
            <WireframeBox className="mb-4 h-32">
              <div className="text-center">
                <Camera className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-sm font-medium">AI Photo Report</div>
                <div className="text-xs text-gray-500">Tap to capture & analyze</div>
              </div>
            </WireframeBox>

            <WireframeBox className="mb-4 h-24">
              <div className="flex items-center space-x-3">
                <Mic className="w-6 h-6 text-red-500 animate-pulse" />
                <div className="text-sm">Voice recording active...</div>
              </div>
            </WireframeBox>

            <WireframeBox className="h-32">
              <div className="w-full">
                <div className="text-sm font-medium mb-2">Quick Actions</div>
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-2 bg-red-100 text-red-800 rounded text-xs">Emergency</button>
                  <button className="p-2 bg-yellow-100 text-yellow-800 rounded text-xs">Incident</button>
                  <button className="p-2 bg-blue-100 text-blue-800 rounded text-xs">Lost Item</button>
                  <button className="p-2 bg-green-100 text-green-800 rounded text-xs">All Clear</button>
                </div>
              </div>
            </WireframeBox>
          </div>
        </div>
      </DeviceFrame>

      {/* Lost & Found App */}
      <DeviceFrame type="mobile">
        <div className="h-full flex flex-col">
          <div className="bg-green-600 text-white p-3 text-center">
            <Search className="w-6 h-6 mx-auto mb-1" />
            <div className="font-semibold text-sm">Lost & Found</div>
            <GoogleAIBadge service="Vision AI" className="mt-1" />
          </div>

          <div className="flex-1 p-4">
            <WireframeBox className="mb-4 h-40">
              <div className="text-center">
                <Eye className="w-10 h-10 mx-auto mb-2 text-green-600" />
                <div className="text-sm font-medium">AI Photo Match</div>
                <div className="text-xs text-gray-500 mb-2">Upload photo to find matches</div>
                <div className="text-xs bg-green-100 text-green-800 p-1 rounded">95% match confidence</div>
              </div>
            </WireframeBox>

            <WireframeBox className="mb-4 h-24">
              <div className="text-center">
                <MapPin className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                <div className="text-sm">Last seen: Gate 3</div>
                <div className="text-xs text-gray-500">2 hours ago</div>
              </div>
            </WireframeBox>

            <WireframeBox className="h-20">
              <button className="w-full bg-green-600 text-white p-3 rounded font-medium">Report Found Item</button>
            </WireframeBox>
          </div>
        </div>
      </DeviceFrame>

      {/* Emergency Dispatch App */}
      <DeviceFrame type="mobile">
        <div className="h-full flex flex-col">
          <div className="bg-red-600 text-white p-3 text-center">
            <Phone className="w-6 h-6 mx-auto mb-1" />
            <div className="font-semibold text-sm">Emergency Dispatch</div>
            <GoogleAIBadge service="Google Maps" className="mt-1" />
          </div>

          <div className="flex-1 p-4">
            <WireframeBox className="mb-4 h-32 relative">
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <div className="text-center">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-600" />
                <div className="text-sm font-medium">Active Emergency</div>
                <div className="text-xs text-gray-600">Fire detected - Sector 7</div>
                <div className="text-xs text-red-600 font-medium">ETA: 3 minutes</div>
              </div>
            </WireframeBox>

            <WireframeBox className="mb-4 h-24">
              <div className="flex items-center space-x-3">
                <Navigation className="w-6 h-6 text-blue-600" />
                <div>
                  <div className="text-sm font-medium">Optimal Route</div>
                  <div className="text-xs text-gray-500">AI-calculated fastest path</div>
                </div>
              </div>
            </WireframeBox>

            <WireframeBox className="h-24">
              <div className="grid grid-cols-2 gap-2">
                <button className="p-2 bg-green-600 text-white rounded text-sm">Arrived</button>
                <button className="p-2 bg-yellow-600 text-white rounded text-sm">Need Backup</button>
              </div>
            </WireframeBox>
          </div>
        </div>
      </DeviceFrame>
    </div>
  )

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Project Drishti - User Interface Wireframes
        </h1>

        {/* Device Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setActiveDevice("desktop")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeDevice === "desktop" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Desktop Dashboard
            </button>
            <button
              onClick={() => setActiveDevice("tablet")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeDevice === "tablet" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Tablet Interface
            </button>
            <button
              onClick={() => setActiveDevice("mobile")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeDevice === "mobile" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Mobile Apps
            </button>
          </div>
        </div>

        {/* Wireframe Display */}
        <div className="mb-8">
          {activeDevice === "desktop" && <DesktopDashboard />}
          {activeDevice === "tablet" && <TabletInterface />}
          {activeDevice === "mobile" && <MobileApps />}
        </div>

        {/* Feature Highlights */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">AI-Powered Interface Features</h3>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-2 flex items-center">
                <Brain className="w-4 h-4 mr-2 text-purple-600" />
                Natural Language Interface
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Gemini-powered search queries</li>
                <li>• Voice command processing</li>
                <li>• Conversational AI assistance</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center">
                <Eye className="w-4 h-4 mr-2 text-green-600" />
                Computer Vision Integration
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Real-time photo analysis</li>
                <li>• Lost & Found AI matching</li>
                <li>• Anomaly detection alerts</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center">
                <Zap className="w-4 h-4 mr-2 text-blue-600" />
                Predictive Intelligence
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 15-20 minute forecasting</li>
                <li>• Automated resource dispatch</li>
                <li>• Proactive bottleneck prevention</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
