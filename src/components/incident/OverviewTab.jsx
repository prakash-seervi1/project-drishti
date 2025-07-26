import IncidentDetails from "./IncidentDetails"
import EnvironmentalConditions from "./EnvironmentalConditions"
import AIRecommendations from "./AIRecommendations"
import AssignedResponder from "./AssignedResponder"
import RelatedIncidents from "./RelatedIncidents"

export default function OverviewTab({ 
  incident, 
  timeAgo, 
  liveData, 
  responders, 
  assignResponder, 
  relatedIncidents ,
  zone,
  assignedResponder,
  assignment,
  showEnvironmentalConditions
}) {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <IncidentDetails incident={incident} timeAgo={timeAgo} zone={zone}/>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
          <p className="text-gray-700 leading-relaxed">
            {incident.description || "No detailed description provided for this incident."}
          </p>
        </div>

        {showEnvironmentalConditions && <EnvironmentalConditions liveData={liveData} />}
      </div>

      <div className="space-y-6">
        <AIRecommendations incident={incident} />
        <AssignedResponder 
          assignedResponder={assignedResponder}
          assignment={assignment}
          responders={responders}
          assignResponder={assignResponder}
          liveData={liveData}
        />
        <RelatedIncidents relatedIncidents={relatedIncidents} timeAgo={timeAgo} />
      </div>
    </div>
  )
} 