import { Users, Timer, Thermometer, Camera } from "lucide-react"

export default function IncidentQuickStats({ incident, zone }) {
  // Prefer zone data for crowd density and evacuated count
  const crowdDensity = zone && zone.currentOccupancy != null && zone.capacity ? Math.round((zone.currentOccupancy / zone.capacity) * 100) : (incident.crowdData?.density ?? null);
  const evacuated = zone && typeof zone.evacuated === 'number' ? zone.evacuated : (incident.crowdData?.evacuated ?? null);
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      {(crowdDensity != null || evacuated != null) && (
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Users className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Crowd Density</span>
          </div>
          <div className="text-lg font-bold text-purple-900">{crowdDensity != null ? `${crowdDensity}%` : 'N/A'}</div>
          {evacuated != null && (
            <div className="text-xs text-purple-700">
              {evacuated} evacuated
            </div>
          )}
        </div>
      )}

      {incident.assignedResponder && (
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Timer className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Response ETA</span>
          </div>
          <div className="text-lg font-bold text-blue-900">
            {incident.assignedResponder.eta}
          </div>
          <div className="text-xs text-blue-700">{incident.assignedResponder.status}</div>
        </div>
      )}

      {incident.environmentalData && (
        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Thermometer className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-900">Environment</span>
          </div>
          <div className="text-lg font-bold text-green-900">
            {incident.environmentalData.temperature}
          </div>
          <div className="text-xs text-green-700">{incident.environmentalData.visibility}</div>
        </div>
      )}

      {incident.media && (
        <div className="bg-orange-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Camera className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-900">Media</span>
          </div>
          <div className="text-lg font-bold text-orange-900">{incident.media.cameras}</div>
          <div className="text-xs text-orange-700">cameras active</div>
        </div>
      )}
    </div>
  )
} 