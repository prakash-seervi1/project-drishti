import { LineChart, TrendingUp } from "lucide-react"

export default function AnalyticsTab() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4 flex items-center">
          <LineChart className="w-5 h-5 mr-2 text-blue-500" />
          Response Time Analysis
        </h4>
        <div className="h-48 flex items-center justify-center text-gray-500">
          Chart showing response time trends
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
          Crowd Density Over Time
        </h4>
        <div className="h-48 flex items-center justify-center text-gray-500">
          Real-time crowd density visualization
        </div>
      </div>
    </div>
  )
} 