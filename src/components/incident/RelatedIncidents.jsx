import { Activity } from "lucide-react"
import { Link } from "react-router-dom"

export default function RelatedIncidents({ relatedIncidents, timeAgo }) {
  if (relatedIncidents.length === 0) return null

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Activity className="w-5 h-5 mr-2 text-purple-500" />
        Related Incidents
      </h3>
      <div className="space-y-2">
        {relatedIncidents.map((related) => (
          <Link
            key={related.id}
            to={`/incident/${related.id}`}
            className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{related.type}</div>
                <div className="text-sm text-gray-600">{related.zone}</div>
              </div>
              <div className="text-xs text-gray-500">{timeAgo(related.timestamp)}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
} 