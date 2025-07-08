"use client"

import { useState } from "react"
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
} from "lucide-react"

export default function UserInterfaceWireframes() {
  const [activeDevice, setActiveDevice] = useState("desktop")

  const DesktopDashboard = () => (
    <DeviceFrame type="desktop">
      <div className="h-full flex flex-col">
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

        <div className="flex-1 flex">
          {/* Sidebar */}
          <div className="w-64 bg-gray-100 p-4">
            <nav className="space-y-2">
              <div className="font-semibold text-gray-700 mb-4">AI Modules</div>
              <div className="flex items-center space-x-2 p-2 bg-blue-100 rounded">
                <Brain className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Predictive Analytics</span>
              </div>
              <div className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded">
                <Eye className="w-4 h-4 text-green-600" />
                <span className="text-sm">Vision Monitoring</span>
              </div>
              <div className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-sm">Crowd Analysis</span>
              </div>
              <div className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded">
                <Zap className="w-4 h-4 text-orange-600" />
                <span className="text-sm">Auto Dispatch</span>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            <div className="grid grid-cols-3 gap-6 mb-6">
              {/* AI Insights Panel */}
              <div className="col-span-2">
                <WireframeBox className="h-64 relative">
                  <div className="absolute top-4 left-4">
                    <GoogleAIBadge service="Gemini" />
                  </div>
                  <div className="text-center">
                    <Brain className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                    <h3 className="font-semibold mb-2">AI Situational Summary</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>"Predicted bottleneck at Gate 5 in 18 minutes"</p>
                      <p>"Crowd density: 85% capacity at Main Plaza"</p>
                      <p>"3 security officers dispatched automatically"</p>
                    </div>
                  </div>
                  <Annotation text="Natural language AI insights" position="top" color="purple" />
                </WireframeBox>
              </div>

              {/* Live Alerts */}
              <div>
                <WireframeBox className="h-64">
                  <div className="w-full">
                    <h3 className="font-semibold mb-4 flex items-center">
                      <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                      Live Alerts
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 p-2 bg-red-50 rounded">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-xs">Fire detected - Sector 7</span>
                      </div>
                      <div className="flex items-center space-x-2 p-2 bg-yellow-50 rounded">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-xs">Crowd surge - Gate 3</span>
                      </div>
                      <div className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs">All clear - Sector 1</span>
                      </div>
                    </div>
                  </div>
                </WireframeBox>
              </div>
            </div>

            {/* Interactive Map */}
            <WireframeBox className="h-80 relative">
              <div className="absolute top-4 left-4">
                <GoogleAIBadge service="Google Maps" />
              </div>
              <div className="text-center">
                <MapPin className="w-16 h-16 mx-auto mb-4 text-green-600" />
                <h3 className="font-semibold mb-2">Real-time Venue Map</h3>
                <div className="text-sm text-gray-600">
                  Interactive map with AI-powered heat zones and predictive overlays
                </div>
              </div>
              <Annotation text="AI-enhanced mapping with predictive zones" position="top" color="green" />
            </WireframeBox>
          </div>
        </div>
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
