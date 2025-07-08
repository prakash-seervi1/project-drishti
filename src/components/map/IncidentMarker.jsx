import { useState } from "react"
import { InfoWindowF, MarkerF } from "@react-google-maps/api"
import { AlertTriangle, Clock, MapPin, Phone, Users } from "lucide-react"

export default function IncidentMarker({ incident, getIncidentMarkerIcon, getStatusColor, timeAgo }) {
  const [showInfo, setShowInfo] = useState(false)

  const markerIcon = getIncidentMarkerIcon(incident)

  return (
    <>
      <MarkerF
        position={{ lat: incident.lat || 12.9716, lng: incident.lng || 77.5946 }}
        icon={markerIcon}
        onClick={() => setShowInfo(true)}
        title={incident.type}
      />
      
      {showInfo && (
        <InfoWindowF
          position={{ lat: incident.lat || 12.9716, lng: incident.lng || 77.5946 }}
          onCloseClick={() => setShowInfo(false)}
        >
          <div className="p-2 max-w-xs">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">{markerIcon.url}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">{incident.type} Incident</h3>
                <p className="text-xs text-gray-600 mb-2">{incident.description}</p>
                
                <div className="space-y-1 text-xs">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-gray-500" />
                    <span>{incident.zone}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-gray-500" />
                    <span>{timeAgo(incident.timestamp)}</span>
                  </div>
                  {incident.assignedResponder && (
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3 text-gray-500" />
                      <span>{incident.assignedResponder.name}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 mt-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                    {incident.status}
                  </span>
                  {incident.assignedResponder && (
                    <button className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200">
                      <Phone className="w-3 h-3" />
                      <span>Call</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </InfoWindowF>
      )}
    </>
  )
} 