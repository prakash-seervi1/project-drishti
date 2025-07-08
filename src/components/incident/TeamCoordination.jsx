import { Users, Siren, Bell } from "lucide-react"

export default function TeamCoordination() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
        <Users className="w-5 h-5 mr-2 text-purple-500" />
        Team Coordination
      </h4>

      <div className="space-y-4">
        {/* Communication Hub */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-gray-900">Communication Hub</span>
            <div className="flex items-center space-x-1 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs">Active</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              Group Call
            </button>
            <button className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
              Broadcast
            </button>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="font-medium text-gray-900 mb-3">Performance Metrics</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Response Time:</span>
              <span className="font-medium text-green-600">2.5 min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Team Efficiency:</span>
              <span className="font-medium text-blue-600">94%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Equipment Status:</span>
              <span className="font-medium text-green-600">All Ready</span>
            </div>
          </div>
        </div>

        {/* Emergency Actions */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="font-medium text-red-900 mb-3">Emergency Actions</div>
          <div className="space-y-2">
            <button className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex items-center justify-center">
              <Siren className="w-4 h-4 mr-2" />
              Emergency Dispatch
            </button>
            <button className="w-full px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm flex items-center justify-center">
              <Bell className="w-4 h-4 mr-2" />
              Alert All Teams
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 