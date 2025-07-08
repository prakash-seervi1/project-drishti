export default function StatusOverview({ statusCounts, statusFilter, setStatusFilter }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      {Object.entries(statusCounts).map(([status, count]) => (
        <div
          key={status}
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
            statusFilter === status ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:bg-gray-50"
          }`}
          onClick={() => setStatusFilter(statusFilter === status ? "all" : status)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 capitalize">{status === "all" ? "Total" : status}</p>
              <p className="text-2xl font-bold text-gray-900">{count}</p>
            </div>
            <div
              className={`w-3 h-3 rounded-full ${
                status === "ongoing"
                  ? "bg-red-500 animate-pulse"
                  : status === "resolved"
                    ? "bg-green-500"
                    : status === "investigating"
                      ? "bg-yellow-500"
                      : status === "escalated"
                        ? "bg-purple-500"
                        : "bg-gray-500"
              }`}
            ></div>
          </div>
        </div>
      ))}
    </div>
  )
} 