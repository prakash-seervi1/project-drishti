import { Timer, Users, TrendingUp, Target } from "lucide-react"

export default function QuickStats({ liveData }) {
  const stats = [
    {
      icon: Timer,
      label: "Response Time",
      value: liveData.responderETA,
      color: "text-blue-500"
    },
    {
      icon: Users,
      label: "Nearby Units",
      value: liveData.nearbyUnits,
      color: "text-green-500"
    },
    {
      icon: TrendingUp,
      label: "Crowd Density",
      value: `${liveData.crowdDensity}%`,
      color: "text-purple-500"
    },
    {
      icon: Target,
      label: "Priority",
      value: "High",
      color: "text-orange-500"
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2 mb-1">
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
            <span className="text-sm text-gray-600">{stat.label}</span>
          </div>
          <div className="text-xl font-bold text-gray-900">{stat.value}</div>
        </div>
      ))}
    </div>
  )
} 