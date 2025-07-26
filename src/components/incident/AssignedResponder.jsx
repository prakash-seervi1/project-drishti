import { User, Phone, MessageSquare } from "lucide-react"

export default function AssignedResponder({ assignedResponder, assignment, responders, assignResponder, liveData }) {
  const accesscode = parseInt(localStorage.getItem('accesscode') || '0');
  const isAdmin = accesscode === 127;

  // Hide the entire component for responders
  if (!isAdmin) {
    return null;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <User className="w-5 h-5 mr-2 text-blue-500" />
        Assigned Responder
      </h3>
      {assignedResponder ? (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-medium text-gray-900">{assignedResponder?.name}</div>
              <div className="text-sm text-gray-600">{assignedResponder?.type}</div>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Phone className="w-4 h-4" />
              </button>
              <button className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <div>ETA: {assignedResponder?.eta || liveData?.responderETA}</div>
            <div>Status: {assignment?.statusHistory?.length > 0 ? assignment.statusHistory[assignment.statusHistory.length-1].status : 'N/A'}</div>
            <div>Contact: {assignedResponder?.contact?.phone || assignedResponder.contact || "N/A"}</div>
          </div>
          {assignment?.statusHistory?.length > 0 && (
            <div className="mt-4">
              <div className="font-semibold text-gray-800 mb-2">Status History</div>
              <ul className="text-xs text-gray-700 space-y-1">
                {assignment?.statusHistory?.map((entry, idx) => (
                  <li key={idx}>
                    <span className="font-medium">{entry.status}</span> &mdash; {new Date(entry.timestamp).toLocaleString()}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-600 mb-3">No responder assigned</p>
          <select
            onChange={(e) => e.target.value && assignResponder(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select responder...</option>
            {responders?.map((responder) => (
              <option key={responder?.id} value={responder?.id}>
                {responder?.name} - {responder?.type}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
} 