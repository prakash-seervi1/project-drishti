import { Siren } from 'lucide-react'
import { formatTimestamp } from '../../utils/timestamp'

export default function CriticalAlerts({ criticalAlerts }) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Siren className="w-6 h-6 mr-2 text-red-500" />
          Critical Alerts
        </h2>
        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
          {criticalAlerts.length} Active
        </span>
      </div>
      <div className="space-y-3">
        {criticalAlerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <div>
                <div className="font-medium text-red-900">{alert.type}</div>
                <div className="text-sm text-red-700">{alert.zone}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-red-600">{formatTimestamp(alert.time)}</div>
              <div className="text-xs font-medium text-red-800">{alert.severity}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 