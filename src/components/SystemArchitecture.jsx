import { WireframeBox, FlowArrow, GoogleAIBadge, AIProcessingNode, Annotation } from "./WireframeComponents"
import { Database, Cloud, Smartphone, Monitor, Zap, Brain, Eye, Map } from "lucide-react"

export default function SystemArchitecture() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Project Drishti - Agentic AI Safety Platform Architecture
        </h1>

        {/* Input Sources Layer */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-6 text-center text-gray-700">Input Sources</h2>
          <div className="grid grid-cols-5 gap-4">
            <WireframeBox className="relative">
              <div className="text-center">
                <Smartphone className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-sm font-medium">Manual Reports</div>
                <div className="text-xs text-gray-500">Security Officers</div>
              </div>
              <Annotation text="Real-time incident reporting" position="top" color="blue" />
            </WireframeBox>

            <WireframeBox className="relative">
              <div className="text-center">
                <Monitor className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <div className="text-sm font-medium">Social Media</div>
                <div className="text-xs text-gray-500">Trend Analysis</div>
              </div>
              <Annotation text="Sentiment & crowd analysis" position="top" color="purple" />
            </WireframeBox>

            <WireframeBox className="relative">
              <div className="text-center">
                <Eye className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <div className="text-sm font-medium">Video Feeds</div>
                <div className="text-xs text-gray-500">CCTV & Drones</div>
              </div>
              <Annotation text="Computer vision analysis" position="top" color="green" />
            </WireframeBox>

            <WireframeBox className="relative">
              <div className="text-center">
                <Map className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                <div className="text-sm font-medium">Transit Data</div>
                <div className="text-xs text-gray-500">Real-time Flow</div>
              </div>
              <Annotation text="Crowd flow prediction" position="top" color="yellow" />
            </WireframeBox>

            <WireframeBox className="relative">
              <div className="text-center">
                <Database className="w-8 h-8 mx-auto mb-2 text-red-600" />
                <div className="text-sm font-medium">Ticket Sales</div>
                <div className="text-xs text-gray-500">Attendance Data</div>
              </div>
              <Annotation text="Predictive capacity planning" position="top" color="red" />
            </WireframeBox>
          </div>
        </div>

        {/* Flow Arrows */}
        <div className="flex justify-center mb-8">
          <FlowArrow direction="down" label="Data Ingestion" color="blue" size="lg" />
        </div>

        {/* AI Processing Layer */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-6 text-center text-gray-700">AI Processing Layer</h2>
          <div className="grid grid-cols-4 gap-6">
            <AIProcessingNode
              title="Multimodal Analysis"
              description="Video, audio, and text processing for anomaly detection"
              aiService="Gemini"
              status="active"
            />

            <AIProcessingNode
              title="Computer Vision"
              description="Crowd monitoring, fire/smoke detection, object recognition"
              aiService="Vision AI"
              status="processing"
            />

            <AIProcessingNode
              title="Predictive Analytics"
              description="15-20 min bottleneck forecasting and capacity planning"
              aiService="Vertex AI"
              status="active"
            />

            <AIProcessingNode
              title="Agent Orchestration"
              description="Intelligent decision making and autonomous response coordination"
              aiService="Vertex AI"
              status="active"
            />
          </div>
        </div>

        {/* Flow Arrows */}
        <div className="flex justify-center mb-8">
          <FlowArrow direction="down" label="AI Decision Making" color="purple" size="lg" />
        </div>

        {/* Decision & Orchestration Layer */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-6 text-center text-gray-700">Decision & Orchestration</h2>
          <div className="grid grid-cols-4 gap-4">
            <WireframeBox className="relative">
              <div className="text-center">
                <Map className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <div className="text-sm font-medium">Route Optimization</div>
                <GoogleAIBadge service="Google Maps" className="mt-2" />
              </div>
              <Annotation text="Optimal resource dispatch" position="bottom" color="green" />
            </WireframeBox>

            <WireframeBox className="relative">
              <div className="text-center">
                <Cloud className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-sm font-medium">Serverless Logic</div>
                <GoogleAIBadge service="Cloud Functions" className="mt-2" />
              </div>
              <Annotation text="Scalable processing" position="bottom" color="blue" />
            </WireframeBox>

            <WireframeBox className="relative">
              <div className="text-center">
                <Brain className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <div className="text-sm font-medium">Tool Calling</div>
                <GoogleAIBadge service="Vertex AI" className="mt-2" />
              </div>
              <Annotation text="Autonomous actions" position="bottom" color="purple" />
            </WireframeBox>

            <WireframeBox className="relative">
              <div className="text-center">
                <Zap className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                <div className="text-sm font-medium">Drone Control</div>
                <div className="text-xs text-gray-500 mt-1">API Integration</div>
              </div>
              <Annotation text="Automated surveillance" position="bottom" color="yellow" />
            </WireframeBox>
          </div>
        </div>

        {/* Flow Arrows */}
        <div className="flex justify-center mb-8">
          <FlowArrow direction="down" label="Real-time Updates" color="green" size="lg" />
        </div>

        {/* Storage & Interface Layer */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6 text-center text-gray-700">Storage & User Interface</h2>
          <div className="grid grid-cols-3 gap-6">
            <WireframeBox className="relative">
              <div className="text-center">
                <Database className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                <div className="text-sm font-medium">Real-time Database</div>
                <GoogleAIBadge service="Firebase" className="mt-2" />
                <div className="text-xs text-gray-500 mt-2">Firestore & Realtime DB</div>
              </div>
              <Annotation text="Live data synchronization" position="bottom" color="red" />
            </WireframeBox>

            <WireframeBox className="relative">
              <div className="text-center">
                <Monitor className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-sm font-medium">Command Dashboard</div>
                <GoogleAIBadge service="Firebase" className="mt-2" />
                <div className="text-xs text-gray-500 mt-2">Web & Mobile Apps</div>
              </div>
              <Annotation text="Multi-platform interface" position="bottom" color="blue" />
            </WireframeBox>

            <WireframeBox className="relative">
              <div className="text-center">
                <Smartphone className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <div className="text-sm font-medium">Push Notifications</div>
                <GoogleAIBadge service="Firebase" className="mt-2" />
                <div className="text-xs text-gray-500 mt-2">Cloud Messaging</div>
              </div>
              <Annotation text="Instant alerts & updates" position="bottom" color="green" />
            </WireframeBox>
          </div>
        </div>

        {/* Key Features Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Key Agentic AI Capabilities</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">15-20 minute predictive bottleneck analysis</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm">Natural language situational summaries</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Autonomous resource dispatch</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm">Multimodal anomaly detection</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">AI-powered Lost & Found matching</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <span className="text-sm">Real-time crowd sentiment analysis</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
