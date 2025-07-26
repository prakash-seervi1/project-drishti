import { Eye, Phone, Radio, Zap, Siren } from "lucide-react"
import { Link } from "react-router-dom"

export default function IncidentActions({ incident }) {
  const accesscode = parseInt(localStorage.getItem('accesscode') || '0');
  const isAdmin = accesscode === 127;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Link
          to={`/incident/${incident.id}`}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </Link>
        {incident.assignedResponder && (
          <>
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Phone className="w-4 h-4 mr-2" />
              Call Responder
            </button>
            <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <Radio className="w-4 h-4 mr-2" />
              Radio
            </button>
          </>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {incident.status !== "resolved" && isAdmin && (
          <>
            <button className="flex items-center px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm">
              <Zap className="w-4 h-4 mr-1" />
              Escalate
            </button>
            <button className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
              <Siren className="w-4 h-4 mr-1" />
              Emergency
            </button>
          </>
        )}
      </div>
    </div>
  )
} 