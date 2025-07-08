import { Navigation, Maximize2, Route } from "lucide-react"

export default function LiveTrackingMap({ incident }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900 flex items-center">
          <Navigation className="w-5 h-5 mr-2 text-green-500" />
          Live Responder Locations
        </h4>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-xs text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live Tracking Active</span>
          </div>
          <button className="p-2 text-gray-600 hover:text-gray-900">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Map Container */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: "16/10" }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Navigation className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <div className="text-lg font-medium text-gray-700">Live Tracking Map</div>
            <div className="text-sm text-gray-500 mt-2">
              Showing {incident.zone} and responder positions
            </div>
          </div>
        </div>

        {/* Map Overlays */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="text-xs font-medium text-gray-900 mb-2">Active Responders</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Fire Team Alpha - 0.2km away</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Medical Team Beta - 0.5km away</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Security Team Gamma - 0.3km away</span>
            </div>
          </div>
        </div>

        {/* Route Information */}
        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Route className="w-4 h-4 text-blue-500" />
              <span className="font-medium">Optimal Route Active</span>
            </div>
            <div className="text-blue-600 font-medium">ETA: 2-4 minutes</div>
          </div>
        </div>

        {/* Live Updates Indicator */}
        <div className="absolute top-4 right-4 flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live Updates</span>
        </div>
      </div>

      {/* Map Controls */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Fire Brigade</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Medical</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Security</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
            Center Map
          </button>
          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm">
            Follow Responders
          </button>
        </div>
      </div>
    </div>
  )
} 