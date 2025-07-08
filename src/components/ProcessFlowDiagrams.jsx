"use client"

import { useState } from "react"
import { WireframeBox, FlowArrow, GoogleAIBadge, AIProcessingNode } from "./WireframeComponents"
import {
  AlertTriangle,
  Brain,
  Zap,
  Users,
  Phone,
  Clock,
  ArrowRight,
  Camera,
  Send,
  Shield,
  Navigation,
  TrendingUp,
  Database,
} from "lucide-react"

export default function ProcessFlowDiagrams() {
  const [activeFlow, setActiveFlow] = useState("incident")

  const IncidentDetectionFlow = () => (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-center mb-6">AI-Powered Incident Detection & Response</h3>

      {/* Input Stage */}
      <div className="flex items-center justify-center space-x-4">
        <WireframeBox width="w-48" className="relative">
          <div className="text-center">
            <Camera className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="font-medium">Multi-Source Input</div>
            <div className="text-xs text-gray-500">CCTV, Reports, Social Media</div>
          </div>
        </WireframeBox>

        <FlowArrow direction="right" label="Real-time Data" color="blue" />

        <AIProcessingNode
          title="Gemini Analysis"
          description="Multimodal processing of video, audio, text"
          aiService="Gemini"
          status="processing"
        />
      </div>

      {/* AI Processing Stage */}
      <div className="flex justify-center">
        <FlowArrow direction="down" label="AI Processing" color="purple" />
      </div>

      <div className="flex items-center justify-center space-x-4">
        <AIProcessingNode
          title="Anomaly Detection"
          description="Fire, smoke, crowd surge identification"
          aiService="Vision AI"
          status="active"
        />

        <FlowArrow direction="right" label="Classification" color="green" />

        <AIProcessingNode
          title="Risk Assessment"
          description="Severity scoring and priority ranking"
          aiService="Vertex AI"
          status="active"
        />

        <FlowArrow direction="right" label="Decision" color="red" />

        <WireframeBox width="w-48" className="relative">
          <div className="text-center">
            <Zap className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <div className="font-medium">Auto Dispatch</div>
            <div className="text-xs text-gray-500">Intelligent resource allocation</div>
          </div>
          <GoogleAIBadge service="Cloud Functions" className="absolute top-2 right-2" />
        </WireframeBox>
      </div>

      {/* Response Stage */}
      <div className="flex justify-center">
        <FlowArrow direction="down" label="Response Coordination" color="green" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <WireframeBox className="relative">
          <div className="text-center">
            <Phone className="w-8 h-8 mx-auto mb-2 text-red-600" />
            <div className="font-medium">Emergency Teams</div>
            <div className="text-xs text-gray-500">Automated alerts & routing</div>
          </div>
          <GoogleAIBadge service="Google Maps" className="absolute top-2 right-2" />
        </WireframeBox>

        <WireframeBox>
          <div className="text-center">
            <Shield className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="font-medium">Security Officers</div>
            <div className="text-xs text-gray-500">Mobile app notifications</div>
          </div>
        </WireframeBox>

        <WireframeBox>
          <div className="text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="font-medium">Crowd Management</div>
            <div className="text-xs text-gray-500">Proactive crowd control</div>
          </div>
        </WireframeBox>
      </div>
    </div>
  )

  const PredictiveAnalysisFlow = () => (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-center mb-6">Predictive Bottleneck Analysis Pipeline</h3>

      {/* Data Collection */}
      <div className="grid grid-cols-4 gap-4">
        <WireframeBox className="relative">
          <div className="text-center">
            <Users className="w-6 h-6 mx-auto mb-1 text-blue-600" />
            <div className="text-sm font-medium">Crowd Density</div>
            <div className="text-xs text-gray-500">Real-time counting</div>
          </div>
        </WireframeBox>

        <WireframeBox className="relative">
          <div className="text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-1 text-green-600" />
            <div className="text-sm font-medium">Flow Patterns</div>
            <div className="text-xs text-gray-500">Movement analysis</div>
          </div>
        </WireframeBox>

        <WireframeBox className="relative">
          <div className="text-center">
            <Database className="w-6 h-6 mx-auto mb-1 text-purple-600" />
            <div className="text-sm font-medium">Historical Data</div>
            <div className="text-xs text-gray-500">Pattern learning</div>
          </div>
        </WireframeBox>

        <WireframeBox className="relative">
          <div className="text-center">
            <Clock className="w-6 h-6 mx-auto mb-1 text-orange-600" />
            <div className="text-sm font-medium">Event Schedule</div>
            <div className="text-xs text-gray-500">Timeline correlation</div>
          </div>
        </WireframeBox>
      </div>

      <div className="flex justify-center">
        <FlowArrow direction="down" label="Data Fusion" color="blue" />
      </div>

      {/* AI Processing */}
      <div className="flex items-center justify-center space-x-6">
        <AIProcessingNode
          title="Vertex AI Forecasting"
          description="15-20 minute bottleneck prediction using ML models"
          aiService="Vertex AI"
          status="processing"
        />

        <FlowArrow direction="right" label="Prediction" color="purple" />

        <WireframeBox width="w-64" className="relative">
          <div className="text-center">
            <Brain className="w-10 h-10 mx-auto mb-2 text-purple-600" />
            <div className="font-medium">Bottleneck Forecast</div>
            <div className="text-sm text-gray-600 mt-2">
              <div className="bg-red-100 text-red-800 p-1 rounded text-xs mb-1">Gate 5: 18 min (High Risk)</div>
              <div className="bg-yellow-100 text-yellow-800 p-1 rounded text-xs mb-1">Plaza: 32 min (Medium Risk)</div>
              <div className="bg-green-100 text-green-800 p-1 rounded text-xs">Gate 1: 45 min (Low Risk)</div>
            </div>
          </div>
        </WireframeBox>
      </div>

      <div className="flex justify-center">
        <FlowArrow direction="down" label="Proactive Response" color="green" />
      </div>

      {/* Automated Actions */}
      <div className="grid grid-cols-3 gap-4">
        <WireframeBox className="relative">
          <div className="text-center">
            <Navigation className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="font-medium">Route Optimization</div>
            <div className="text-xs text-gray-500">Redirect crowd flow</div>
          </div>
          <GoogleAIBadge service="Google Maps" className="absolute top-2 right-2" />
        </WireframeBox>

        <WireframeBox className="relative">
          <div className="text-center">
            <Shield className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="font-medium">Staff Deployment</div>
            <div className="text-xs text-gray-500">Pre-position resources</div>
          </div>
          <GoogleAIBadge service="Cloud Functions" className="absolute top-2 right-2" />
        </WireframeBox>

        <WireframeBox>
          <div className="text-center">
            <Send className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <div className="font-medium">Public Alerts</div>
            <div className="text-xs text-gray-500">Crowd guidance messages</div>
          </div>
        </WireframeBox>
      </div>
    </div>
  )

  const UserJourneyFlow = () => (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-center mb-6">User Journey Mapping</h3>

      {/* Security Officer Journey */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h4 className="font-semibold mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-blue-600" />
          Security Officer Journey
        </h4>

        <div className="flex items-center space-x-4 overflow-x-auto">
          <WireframeBox width="w-40" height="h-24">
            <div className="text-center">
              <div className="text-sm font-medium">Patrol Route</div>
              <div className="text-xs text-gray-500">AI-optimized path</div>
            </div>
          </WireframeBox>

          <ArrowRight className="w-4 h-4 text-blue-600 flex-shrink-0" />

          <WireframeBox width="w-40" height="h-24">
            <div className="text-center">
              <div className="text-sm font-medium">Incident Alert</div>
              <div className="text-xs text-gray-500">AI detection</div>
            </div>
          </WireframeBox>

          <ArrowRight className="w-4 h-4 text-blue-600 flex-shrink-0" />

          <WireframeBox width="w-40" height="h-24">
            <div className="text-center">
              <div className="text-sm font-medium">Voice Report</div>
              <div className="text-xs text-gray-500">Hands-free logging</div>
            </div>
          </WireframeBox>

          <ArrowRight className="w-4 h-4 text-blue-600 flex-shrink-0" />

          <WireframeBox width="w-40" height="h-24">
            <div className="text-center">
              <div className="text-sm font-medium">AI Assistance</div>
              <div className="text-xs text-gray-500">Guided response</div>
            </div>
          </WireframeBox>

          <ArrowRight className="w-4 h-4 text-blue-600 flex-shrink-0" />

          <WireframeBox width="w-40" height="h-24">
            <div className="text-center">
              <div className="text-sm font-medium">Resolution</div>
              <div className="text-xs text-gray-500">Auto-documentation</div>
            </div>
          </WireframeBox>
        </div>
      </div>

      {/* Visitor Journey */}
      <div className="bg-green-50 p-6 rounded-lg">
        <h4 className="font-semibold mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-green-600" />
          Visitor Lost & Found Journey
        </h4>

        <div className="flex items-center space-x-4 overflow-x-auto">
          <WireframeBox width="w-40" height="h-24">
            <div className="text-center">
              <div className="text-sm font-medium">Item Lost</div>
              <div className="text-xs text-gray-500">Visitor realizes loss</div>
            </div>
          </WireframeBox>

          <ArrowRight className="w-4 h-4 text-green-600 flex-shrink-0" />

          <WireframeBox width="w-40" height="h-24">
            <div className="text-center">
              <div className="text-sm font-medium">Photo Upload</div>
              <div className="text-xs text-gray-500">AI visual search</div>
            </div>
          </WireframeBox>

          <ArrowRight className="w-4 h-4 text-green-600 flex-shrink-0" />

          <WireframeBox width="w-40" height="h-24">
            <div className="text-center">
              <div className="text-sm font-medium">AI Matching</div>
              <div className="text-xs text-gray-500">95% confidence</div>
            </div>
          </WireframeBox>

          <ArrowRight className="w-4 h-4 text-green-600 flex-shrink-0" />

          <WireframeBox width="w-40" height="h-24">
            <div className="text-center">
              <div className="text-sm font-medium">Location Found</div>
              <div className="text-xs text-gray-500">GPS coordinates</div>
            </div>
          </WireframeBox>

          <ArrowRight className="w-4 h-4 text-green-600 flex-shrink-0" />

          <WireframeBox width="w-40" height="h-24">
            <div className="text-center">
              <div className="text-sm font-medium">Retrieval</div>
              <div className="text-xs text-gray-500">Guided pickup</div>
            </div>
          </WireframeBox>
        </div>
      </div>

      {/* Command Center Journey */}
      <div className="bg-purple-50 p-6 rounded-lg">
        <h4 className="font-semibold mb-4 flex items-center">
          <Brain className="w-5 h-5 mr-2 text-purple-600" />
          Command Center AI Decision Tree
        </h4>

        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <WireframeBox width="w-48" className="relative">
              <div className="text-center">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-600" />
                <div className="font-medium">Incident Detected</div>
                <div className="text-xs text-gray-500">AI anomaly detection</div>
              </div>
              <GoogleAIBadge service="Vertex AI" className="absolute top-2 right-2" />
            </WireframeBox>
          </div>

          <div className="flex justify-center">
            <FlowArrow direction="down" label="Risk Assessment" color="purple" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <WireframeBox className="bg-red-50 border-red-300">
              <div className="text-center">
                <div className="font-medium text-red-800">High Risk</div>
                <div className="text-xs text-red-600">Auto-dispatch emergency</div>
              </div>
            </WireframeBox>

            <WireframeBox className="bg-yellow-50 border-yellow-300">
              <div className="text-center">
                <div className="font-medium text-yellow-800">Medium Risk</div>
                <div className="text-xs text-yellow-600">Alert security team</div>
              </div>
            </WireframeBox>

            <WireframeBox className="bg-green-50 border-green-300">
              <div className="text-center">
                <div className="font-medium text-green-800">Low Risk</div>
                <div className="text-xs text-green-600">Monitor & log</div>
              </div>
            </WireframeBox>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Project Drishti - Process Flow Diagrams</h1>

        {/* Flow Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setActiveFlow("incident")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeFlow === "incident" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Incident Detection
            </button>
            <button
              onClick={() => setActiveFlow("predictive")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeFlow === "predictive" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Predictive Analysis
            </button>
            <button
              onClick={() => setActiveFlow("journey")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeFlow === "journey" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              User Journeys
            </button>
          </div>
        </div>

        {/* Flow Display */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          {activeFlow === "incident" && <IncidentDetectionFlow />}
          {activeFlow === "predictive" && <PredictiveAnalysisFlow />}
          {activeFlow === "journey" && <UserJourneyFlow />}
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Expected Performance Metrics</h3>
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">85%</div>
              <div className="text-sm text-gray-600">Faster Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">70%</div>
              <div className="text-sm text-gray-600">Improved Flow Efficiency</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">95%</div>
              <div className="text-sm text-gray-600">Incident Prediction Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">60%</div>
              <div className="text-sm text-gray-600">Reduced Manual Workload</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
