import { Activity, Loader2 } from "lucide-react"
import IncidentCard from "./IncidentCard"
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export default function IncidentList({
  loading,
  filteredIncidents,
  searchTerm,
  statusFilter,
  typeFilter,
  priorityFilter,
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
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} height={180} className="rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (filteredIncidents?.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No incidents found</h3>
        <p className="text-gray-600">
          {searchTerm || statusFilter !== "all" || typeFilter !== "all" || priorityFilter !== "all"
            ? "Try adjusting your filters"
            : "All zones are currently secure"}
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      {filteredIncidents?.map((incident) => (
        <IncidentCard
          key={incident.id}
          incident={incident}
          typeInfo={typeInfo(incident.type)}
          getStatusColor={getStatusColor}
          getPriorityColor={getPriorityColor}
          getResponderIcon={getResponderIcon}
          timeAgo={timeAgo}
          selectedIncidents={selectedIncidents}
          setSelectedIncidents={setSelectedIncidents}
          expandedCard={expandedCard}
          setExpandedCard={setExpandedCard}
          zoneMap={zoneMap}
        />
      ))}
    </div>
  )
} 