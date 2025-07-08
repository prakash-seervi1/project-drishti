import { useState } from "react"
import { PolygonF, InfoWindowF } from "@react-google-maps/api"
import { Users, AlertTriangle, Activity } from "lucide-react"

export default function ZonePolygon({ zone, getZoneColor, getStatusColor }) {
  const [showInfo, setShowInfo] = useState(false)

  const zoneColor = getZoneColor(zone.status)
  const statusColor = getStatusColor(zone.status)

  return (
    <>
      <PolygonF
        paths={zone.coordinates}
        options={{
          fillColor: zoneColor.fill,
          fillOpacity: 0.3,
          strokeColor: zoneColor.stroke,
          strokeWeight: 2,
        }}
        onClick={() => setShowInfo(true)}
      />
      
      {showInfo && (
        <InfoWindowF
          position={zone.coordinates[0]}
          onCloseClick={() => setShowInfo(false)}
        >
          <div className="p-2 max-w-xs">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">🏢</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">{zone.name}</h3>
                
                <div className="space-y-1 text-xs mt-2">
                  <div className="flex items-center space-x-1">
                    <Activity className="w-3 h-3 text-gray-500" />
                    <span>Status: {zone.status}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3 text-gray-500" />
                    <span>Incidents: {zone.incidents}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3 text-gray-500" />
                    <span>Crowd: {zone.crowdDensity}%</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                    {zone.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {zone.responders} responders
                  </span>
                </div>
              </div>
            </div>
          </div>
        </InfoWindowF>
      )}
    </>
  )
} 