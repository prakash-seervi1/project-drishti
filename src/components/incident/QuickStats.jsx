import { Timer, Users, TrendingUp, Target } from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "../../services/adkApi"

export default function QuickStats({ incident, liveData, zone }) {
  const [assignedUnits, setAssignedUnits] = useState(null);
  useEffect(() => {
    if (incident?.id) {
      api.getAssignedResponders(incident.id).then(res => {
        if (Array.isArray(res)) setAssignedUnits(res.length);
        else if (res && Array.isArray(res.responders)) setAssignedUnits(res.responders.length);
        else setAssignedUnits(0);
      }).catch(() => setAssignedUnits(0));
    }
  }, [incident?.id]);

  // Calculate crowd density from zone if available
  let crowdDensity = null;
  if (zone && zone.currentOccupancy != null && zone.capacity) {
    crowdDensity = Math.round((zone.currentOccupancy / zone.capacity) * 100);
  } else if (liveData && liveData.crowdDensity != null) {
    crowdDensity = liveData.crowdDensity;
  }
  const priority = incident?.priority
    ? incident.priority.charAt(0).toUpperCase() + incident.priority.slice(1)
    : 'Unknown';
  const stats = [
    {
      icon: Timer,
      label: "Response Time",
      value: liveData.responderETA,
      color: "text-blue-500"
    },
    {
      icon: Users,
      label: "Assigned Units",
      value: assignedUnits !== null ? assignedUnits : '...',
      color: "text-green-500"
    },
    {
      icon: TrendingUp,
      label: "Crowd Density",
      value: crowdDensity != null ? `${crowdDensity}%` : 'N/A%',
      color: "text-purple-500"
    },
    {
      icon: Target,
      label: "Priority",
      value: priority,
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