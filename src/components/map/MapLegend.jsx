import { Shield, Target, Route, AlertTriangle } from "lucide-react"

export default function MapLegend({ showLegend }) {
  if (!showLegend) return null

  return (
    <div className="absolute bottom-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-4 border border-gray-200 max-w-xs">
      <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center">
        <Shield className="w-4 h-4 mr-2" />
        Map Legend
      </h3>
      
      <div className="space-y-3">
        {/* Incidents */}
        <div>
          <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
            <Target className="w-3 h-3 mr-1" />
            Incidents
          </h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Critical</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>High Priority</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Medium Priority</span>
            </div>
          </div>
        </div>

        {/* Responders */}
        <div>
          <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
            <Route className="w-3 h-3 mr-1" />
            Responders
          </h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Fire Brigade</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Medical</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Security</span>
            </div>
          </div>
        </div>

        {/* Zones */}
        <div>
          <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Zones
          </h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Critical</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Normal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 