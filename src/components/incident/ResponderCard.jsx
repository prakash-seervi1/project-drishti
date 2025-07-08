import { Truck, Ambulance, Shield, Phone, Radio, MessageSquare, Target } from "lucide-react"

export default function ResponderCard({ responder }) {

  const getIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "fire":
        return <Truck className="w-5 h-5 text-red-600" />
      case "medical":
        return <Ambulance className="w-5 h-5 text-blue-600" />
      case "security":
        return <Shield className="w-5 h-5 text-yellow-600" />
      default:
        return <Truck className="w-5 h-5 text-gray-600" />
    }
  }

  const getBorderColor = (type) => {
    switch (type?.toLowerCase()) {
      case "fire":
        return "border-red-200 bg-red-50"
      case "medical":
        return "border-blue-200 bg-blue-50"
      case "security":
        return "border-yellow-200 bg-yellow-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  const getTextColor = (type) => {
    switch (type?.toLowerCase()) {
      case "fire":
        return "text-red-900"
      case "medical":
        return "text-blue-900"
      case "security":
        return "text-yellow-900"
      default:
        return "text-gray-900"
    }
  }

  const getSubTextColor = (type) => {
    switch (type?.toLowerCase()) {
      case "fire":
        return "text-red-700"
      case "medical":
        return "text-blue-700"
      case "security":
        return "text-yellow-700"
      default:
        return "text-gray-700"
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "en route":
        return "bg-blue-100 text-blue-800"
      case "standby":
        return "bg-yellow-100 text-yellow-800"
      case "on duty":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getButtonColor = (type) => {
    switch (type?.toLowerCase()) {
      case "fire":
        return "bg-red-600 hover:bg-red-700"
      case "medical":
        return "bg-blue-600 hover:bg-blue-700"
      case "security":
        return "bg-yellow-600 hover:bg-yellow-700"
      default:
        return "bg-gray-600 hover:bg-gray-700"
    }
  }

  return (
    <div className={`border rounded-lg p-4 ${getBorderColor(responder.type)}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getIcon(responder.type)}
          <div>
            <div className={`font-medium ${getTextColor(responder.type)}`}>{responder.name}</div>
            <div className={`text-sm ${getSubTextColor(responder.type)}`}>{responder.vehicle}</div>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(responder.status)}`}>
          {responder.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <div>
          <span className={getSubTextColor(responder.type)}>ETA:</span>
          <span className="font-medium ml-1">{responder.eta || "N/A"}</span>
        </div>
        <div>
          <span className={getSubTextColor(responder.type)}>Speed:</span>
          <span className="font-medium ml-1">{responder.speed || "N/A"}</span>
        </div>
        <div>
          <span className={getSubTextColor(responder.type)}>Battery:</span>
          <span className="font-medium ml-1">{responder.equipment?.batteryLevel ?? "N/A"}%</span>
        </div>
        <div>
          <span className={getSubTextColor(responder.type)}>Signal:</span>
          <span className="font-medium ml-1">{responder.equipment?.signalStrength ?? "N/A"}/5</span>
        </div>
        <div>
          <span className={getSubTextColor(responder.type)}>Medical Kit:</span>
          <span className="font-medium ml-1">{responder.equipment?.medicalKit ? "Yes" : "No"}</span>
        </div>
        <div>
          <span className={getSubTextColor(responder.type)}>Defibrillator:</span>
          <span className="font-medium ml-1">{responder.equipment?.defibrillator ? "Yes" : "No"}</span>
        </div>
      </div>

      {/* Contact Info */}
      <div className="mb-3">
        <div className={`text-xs ${getSubTextColor(responder.type)} mb-2`}>Contact:</div>
        <div className="flex flex-col gap-1 text-xs">
          <span>Phone: {responder.contact?.phone || "N/A"}</span>
          <span>Radio: {responder.contact?.radio || "N/A"}</span>
          <span>Email: {responder.contact?.email || "N/A"}</span>
        </div>
      </div>

      {/* Specializations */}
      {responder.specializations && (
        <div className="mb-3">
          <div className={`text-xs ${getSubTextColor(responder.type)} mb-2`}>Specializations:</div>
          <div className="flex flex-wrap gap-1">
            {responder.specializations.map((item, idx) => (
              <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Communication */}
      <div className="flex space-x-2">
        <button className={`flex-1 px-3 py-2 ${getButtonColor(responder.type)} text-white rounded-lg text-sm flex items-center justify-center`}>
          <Phone className="w-3 h-3 mr-1" />
          Call
        </button>
        <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center">
          <Radio className="w-3 h-3 mr-1" />
          Radio
        </button>
      </div>
    </div>
  )
} 