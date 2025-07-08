import { Activity, Users, AlertTriangle, Clock } from "lucide-react"

export default function MapStats({ stats }) {
  const statItems = [
    {
      icon: AlertTriangle,
      label: "Active Incidents",
      value: stats.activeIncidents,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      icon: Users,
      label: "Responders",
      value: stats.responders,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: Activity,
      label: "Critical Zones",
      value: stats.criticalZones,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      icon: Clock,
      label: "Avg Response",
      value: `${stats.avgResponseTime}m`,
      color: "text-green-600",
      bgColor: "bg-green-50"
    }
  ]

  return (
    <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-4 border border-gray-200">
      <h3 className="font-semibold text-gray-900 text-sm mb-3">Live Stats</h3>
      
      <div className="space-y-3">
        {statItems.map((item, index) => {
          const Icon = item.icon
          return (
            <div key={index} className="flex items-center space-x-3">
              <div className={`w-8 h-8 ${item.bgColor} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-600">{item.label}</div>
                <div className={`text-lg font-semibold ${item.color}`}>{item.value}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
} 