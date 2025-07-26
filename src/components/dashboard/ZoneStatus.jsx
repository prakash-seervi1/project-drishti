import { Eye } from 'lucide-react'

export default function ZoneStatus({ selectedZone, setSelectedZone, zoneFeeds }) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <Eye className="w-6 h-6 mr-2 text-purple-500" />
        Zone Status
      </h2>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {zoneFeeds.map((zone) => (
          <div
            key={zone.id || zone.zone}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              selectedZone === zone.id || selectedZone === zone.zone
                ? "border-blue-500 bg-blue-50"
                : zone.status === "Critical"
                  ? "border-red-300 bg-red-50"
                  : zone.status === "Active"
                    ? "border-yellow-300 bg-yellow-50"
                    : "border-gray-300 bg-gray-50"
            }`}
            onClick={() => setSelectedZone(zone.id || zone.zone)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-gray-900">{zone.name || zone.zone}</div>
              <div
                className={`w-2 h-2 rounded-full ${
                  zone.camera === "Online" ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>Status: {zone.status}</div>
              <div>Incidents: {zone.incidents}</div>
              <div>Crowd: {zone.crowd}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 