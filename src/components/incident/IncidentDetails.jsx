import { FileText, Activity, Eye, CheckCircle } from "lucide-react"
import TimeAgo from '../TimeAgo'

export default function IncidentDetails({ incident, zone }) {
  const getStatusIconComponent = (status) => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "ongoing":
        return <Activity className="w-5 h-5 text-red-600" />
      case "investigating":
        return <Eye className="w-5 h-5 text-yellow-600" />
      default:
        return <Activity className="w-5 h-5 text-gray-600" />
    }
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <FileText className="w-5 h-5 mr-2 text-blue-500" />
        Incident Details
      </h3>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Type:</span>
          <span className="font-medium text-gray-900">{incident.type}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Zone:</span>
          <span className="font-medium text-gray-900">{zone?.name || 'Unknown Zone'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Status:</span>
          <div className="flex items-center space-x-2">
            {getStatusIconComponent(incident.status)}
            <span className="font-medium text-gray-900">{incident.status}</span>
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Reported:</span>
          <TimeAgo timestamp={incident.timestamp} className="font-medium text-gray-900" />
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Priority:</span>
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">{incident.priority || 'High'}</span>
        </div>
        {zone && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-600">Capacity:</span>
              <span className="font-medium text-gray-900">{zone.capacity?.currentOccupancy || 'N/A'} / {zone.capacity?.maxOccupancy || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Crowd Density:</span>
              <span className="font-medium text-gray-900">{zone.capacity?.crowdDensity || 'N/A'}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sensors:</span>
              <span className="font-medium text-gray-900">Cameras: {zone.sensors?.cameras || 0}, Temp: {zone.sensors?.temperature || 0}, Air: {zone.sensors?.airQuality || 0}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
} 