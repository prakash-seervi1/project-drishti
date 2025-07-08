import { X, Filter } from "lucide-react"

export default function MapFilters({ 
  showFilters, 
  filters, 
  setFilters, 
  onClose 
}) {
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      showIncidents: true,
      showResponders: true,
      showZones: true,
      incidentTypes: [],
      responderTypes: [],
      zoneStatuses: []
    })
  }

  if (!showFilters) return null

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 mb-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Map Filters
        </h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Layer Visibility */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Layer Visibility</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.showIncidents}
                onChange={(e) => handleFilterChange('showIncidents', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Show Incidents</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.showResponders}
                onChange={(e) => handleFilterChange('showResponders', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Show Responders</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.showZones}
                onChange={(e) => handleFilterChange('showZones', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Show Zones</span>
            </label>
          </div>
        </div>

        {/* Incident Types */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Incident Types</h4>
          <div className="space-y-2">
            {['Fire', 'Medical', 'Security', 'Panic', 'Structural'].map(type => (
              <label key={type} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.incidentTypes.includes(type)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleFilterChange('incidentTypes', [...filters.incidentTypes, type])
                    } else {
                      handleFilterChange('incidentTypes', filters.incidentTypes.filter(t => t !== type))
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Zone Statuses */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Zone Status</h4>
          <div className="space-y-2">
            {['critical', 'active', 'normal'].map(status => (
              <label key={status} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.zoneStatuses.includes(status)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleFilterChange('zoneStatuses', [...filters.zoneStatuses, status])
                    } else {
                      handleFilterChange('zoneStatuses', filters.zoneStatuses.filter(s => s !== status))
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm capitalize">{status}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={clearFilters}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
        >
          Clear All Filters
        </button>
        <div className="text-sm text-gray-500">
          {Object.values(filters).filter(v => Array.isArray(v) ? v.length > 0 : v).length} active filters
        </div>
      </div>
    </div>
  )
} 