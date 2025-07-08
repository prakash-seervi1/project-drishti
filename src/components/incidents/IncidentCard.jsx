import { 
  MapPin, 
  Clock, 
  Calendar, 
  Users, 
  Timer, 
  Thermometer, 
  Camera,
  ChevronDown,
  ChevronUp,
  Share2,
  MoreVertical,
  Eye,
  Phone,
  Radio,
  Zap,
  Siren,
  Star
} from "lucide-react"
import { Link } from "react-router-dom"
import IncidentQuickStats from "./IncidentQuickStats"
import IncidentTags from "./IncidentTags"
import IncidentActions from "./IncidentActions"
import IncidentExpandedDetails from "./IncidentExpandedDetails"

export default function IncidentCard({ 
  incident, 
  typeInfo, 
  getStatusColor, 
  getPriorityColor, 
  getResponderIcon, 
  timeAgo,
  selectedIncidents,
  setSelectedIncidents,
  expandedCard,
  setExpandedCard,
  zoneMap
}) {
  const isExpanded = expandedCard === incident.id
  const zone = zoneMap?.[incident.zoneId] || null

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300">
      {/* Main Card Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedIncidents.includes(incident.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedIncidents([...selectedIncidents, incident.id])
                  } else {
                    setSelectedIncidents(selectedIncidents.filter((id) => id !== incident.id))
                  }
                }}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="text-3xl">{typeInfo.icon}</div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900">{incident.type} Incident</h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(incident.status)}`}
                >
                  {incident.status}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-bold ${getPriorityColor(incident.priority)}`}
                >
                  {incident.priority?.toUpperCase()}
                </span>
                {incident.severity && (
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < incident.severity ? "text-red-500 fill-current" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">{zone?.name || 'Unknown Zone'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{timeAgo(incident.timestamp)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(incident.timestamp?.seconds * 1000).toLocaleDateString()}</span>
                </div>
                {incident.assignedResponder && (
                  <div className="flex items-center space-x-1">
                    {getResponderIcon(incident.assignedResponder.type)}
                    <span>{incident.assignedResponder.name}</span>
                  </div>
                )}
              </div>

              <p className="text-gray-700 leading-relaxed mb-4">{incident.description}</p>

              <IncidentQuickStats incident={incident} />
              <IncidentTags tags={incident.tags} />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setExpandedCard(isExpanded ? null : incident.id)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        <IncidentActions incident={incident} />
      </div>

      {/* Expanded Details */}
      {isExpanded && <IncidentExpandedDetails incident={incident} />}
    </div>
  )
} 