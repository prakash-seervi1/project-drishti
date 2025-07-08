import { ArrowLeft, AlertTriangle, Download, Users } from "lucide-react"
import { Link } from "react-router-dom"

export default function IncidentHeader({ 
  viewMode, 
  setViewMode, 
  selectedIncidents, 
  handleBulkAction 
}) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Incident Command Center</h1>
            <p className="text-gray-600">Real-time incident monitoring and response coordination</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMode(viewMode === "cards" ? "table" : "cards")}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {viewMode === "cards" ? "Table View" : "Card View"}
          </button>
          {selectedIncidents?.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{selectedIncidents.length} selected</span>
              <button
                onClick={() => handleBulkAction("export")}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <Download className="w-4 h-4 mr-1 inline" />
                Export
              </button>
              <button
                onClick={() => handleBulkAction("assign")}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                <Users className="w-4 h-4 mr-1 inline" />
                Assign
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 