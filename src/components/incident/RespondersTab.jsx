import { Users, Radio } from "lucide-react"
import ResponderCard from "./ResponderCard"
import LiveTrackingMap from "./LiveTrackingMap"
import TeamCoordination from "./TeamCoordination"
import LiveDataStream from "./LiveDataStream"

export default function RespondersTab({ incident, responders = [], assignedResponder, assignment, zone }) {
  // Filter responders for this zone (if needed)
  const zoneResponders = zone && responders?.responders?.length > 0
    ? responders?.responders?.filter(r => r.position && r.position.lat && r.position.lng)
    : responders;

  return (
    <div className="space-y-6">
      {/* Responder Command Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Users className="w-5 h-5 mr-2 text-blue-500" />
          Live Responder Tracking & Coordination
        </h3>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center">
            <Radio className="w-4 h-4 mr-2" />
            Broadcast All
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Dispatch Team
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Live Tracking Map */}
        <div className="lg:col-span-2">
          <LiveTrackingMap incident={incident} responders={zoneResponders} zone={zone} />
        </div>

        {/* Responder Details Panel */}
        <div className="space-y-6">
          {/* Assigned Responder (if any) */}
          {assignedResponder && (
            <div className="bg-white rounded-xl border border-blue-200 p-6">
              <h4 className="font-semibold text-blue-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-500" />
                Assigned Responder
              </h4>
              <ResponderCard responder={assignedResponder} assignment={assignment} />
            </div>
          )}

          {/* Active Responders */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-green-500" />
              All Responders
            </h4>

            <div className="space-y-4">
              {zoneResponders.map((responder) => (
                <ResponderCard key={responder.id} responder={responder} />
              ))}
            </div>
          </div>

          {/* Team Coordination */}
          <TeamCoordination />
        </div>
      </div>

      {/* Live Data Stream */}
      <LiveDataStream />
    </div>
  )
} 