import { BarChart2 } from 'lucide-react'

export default function IncidentAnalytics({ incidentTypes }) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <BarChart2 className="w-6 h-6 mr-2 text-indigo-500" />
        Incident Analytics
      </h2>
      <div className="space-y-4">
        {incidentTypes.map((incident) => (
          <div key={incident.type} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${incident.color}`}></div>
              <span className="font-medium text-gray-900">{incident.type}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900">{incident.count}</span>
              <span
                className={`text-sm px-2 py-1 rounded-full ${
                  incident.trend.startsWith("+")
                    ? "bg-red-100 text-red-800"
                    : incident.trend.startsWith("-")
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {incident.trend}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 