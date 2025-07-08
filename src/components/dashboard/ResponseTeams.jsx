import { Users } from 'lucide-react'

export default function ResponseTeams({ responderTeams, handleDispatchResponder }) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <Users className="w-6 h-6 mr-2 text-green-500" />
        Response Teams
      </h2>
      <div className="space-y-3">
        {responderTeams.map((team) => (
          <div key={team.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">{team.name}</div>
              <div className="text-sm text-gray-600">
                {team.available}/{team.total} available
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  team.status === "Ready"
                    ? "bg-green-100 text-green-800"
                    : team.status === "Busy"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {team.status}
              </span>
              <button
                onClick={() => handleDispatchResponder(team.name)}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700"
              >
                Dispatch
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 