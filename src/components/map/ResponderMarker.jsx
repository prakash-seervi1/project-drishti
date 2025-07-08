import { useState } from "react"
import { InfoWindowF, MarkerF } from "@react-google-maps/api"
import { Phone, Radio, Battery, Signal, Clock, Navigation } from "lucide-react"

export default function ResponderMarker({ 
  responder, 
  getResponderMarkerIcon, 
  getResponderStatusColor
}) {
  const [showInfo, setShowInfo] = useState(false)

  const markerIcon = getResponderMarkerIcon(responder)

  return (
    <>
      <MarkerF
        position={responder.position}
        icon={markerIcon}
        onClick={() => setShowInfo(true)}
        title={responder.name}
      />
      
      {showInfo && (
        <InfoWindowF
          position={responder.position}
          onCloseClick={() => setShowInfo(false)}
        >
          <div className="p-2 max-w-xs">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">{markerIcon.url}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">{responder.name}</h3>
                <p className="text-xs text-gray-600 mb-2">{responder.type}</p>
                
                <div className="space-y-1 text-xs">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-gray-500" />
                    <span>ETA: {responder.eta}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Navigation className="w-3 h-3 text-gray-500" />
                    <span>Speed: {responder.speed}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Battery className="w-3 h-3 text-gray-500" />
                    <span>Battery: {responder.batteryLevel}%</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Signal className="w-3 h-3 text-gray-500" />
                    <span>Signal: {responder.signalStrength}/5</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getResponderStatusColor(responder.status)}`}>
                    {responder.status}
                  </span>
                  <button className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200">
                    <Phone className="w-3 h-3" />
                    <span>Call</span>
                  </button>
                  <button className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200">
                    <Radio className="w-3 h-3" />
                    <span>Radio</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </InfoWindowF>
      )}
    </>
  )
} 