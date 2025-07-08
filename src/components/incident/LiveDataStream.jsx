import { Activity, Thermometer, Phone } from "lucide-react"

export default function LiveDataStream() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
        <Activity className="w-5 h-5 mr-2 text-blue-500" />
        Live Data Stream
      </h4>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Real-time Updates */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="font-medium text-blue-900">Live Updates</span>
          </div>
          <div className="space-y-2 text-sm text-blue-800">
            <div>• Fire Team Alpha: 200m from incident</div>
            <div>• Medical Team Beta: Standing by</div>
            <div>• Security perimeter established</div>
            <div>• All equipment operational</div>
          </div>
        </div>

        {/* Environmental Data */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Thermometer className="w-4 h-4 text-green-600" />
            <span className="font-medium text-green-900">Environmental</span>
          </div>
          <div className="space-y-2 text-sm text-green-800">
            <div className="flex justify-between">
              <span>Temperature:</span>
              <span>24°C</span>
            </div>
            <div className="flex justify-between">
              <span>Wind Speed:</span>
              <span>12 km/h</span>
            </div>
            <div className="flex justify-between">
              <span>Visibility:</span>
              <span>Good</span>
            </div>
            <div className="flex justify-between">
              <span>Air Quality:</span>
              <span>Normal</span>
            </div>
          </div>
        </div>

        {/* Mobile Integration */}
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Phone className="w-4 h-4 text-purple-600" />
            <span className="font-medium text-purple-900">Mobile Integration</span>
          </div>
          <div className="space-y-2 text-sm text-purple-800">
            <div>• Body cameras: 3/3 active</div>
            <div>• GPS tracking: Real-time</div>
            <div>• Voice commands: Enabled</div>
            <div>• Emergency alerts: Active</div>
          </div>
        </div>
      </div>
    </div>
  )
} 