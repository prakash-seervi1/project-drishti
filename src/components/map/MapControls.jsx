import { Layers, Target, Route, Shield, Truck, Ambulance, Car, Radio, Battery, Signal } from "lucide-react"

export default function MapControls({ 
  selectedLayer, 
  setSelectedLayer, 
  showLegend, 
  setShowLegend 
}) {
  const layers = [
    { id: 'all', name: 'All Layers', icon: Layers },
    { id: 'incidents', name: 'Incidents', icon: Target },
    { id: 'responders', name: 'Responders', icon: Route },
    { id: 'zones', name: 'Zones', icon: Shield }
  ]

  return (
    <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-4 border border-gray-200">
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900 text-sm">Map Layers</h3>
        
        {layers.map(layer => {
          const Icon = layer.icon
          return (
            <button
              key={layer.id}
              onClick={() => setSelectedLayer(layer.id)}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedLayer === layer.id
                  ? "bg-blue-100 text-blue-700"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{layer.name}</span>
            </button>
          )
        })}

        <div className="border-t border-gray-200 pt-3">
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm hover:bg-gray-100 text-gray-700 transition-colors"
          >
            <Shield className="w-4 h-4" />
            <span>{showLegend ? 'Hide' : 'Show'} Legend</span>
          </button>
        </div>
      </div>
    </div>
  )
} 