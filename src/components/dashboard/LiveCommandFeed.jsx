import { Video, Maximize2, Camera, Play, Volume2, Eye } from 'lucide-react'

export default function LiveCommandFeed({ selectedZone, setSelectedZone, zoneFeeds, currentTime }) {
  return (
    <div className="md:col-span-2 bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Video className="w-6 h-6 mr-2 text-blue-500" />
          Live Command Feed
        </h2>
        <div className="flex items-center space-x-2">
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            {zoneFeeds.map((zone) => (
              <option key={zone.zone} value={zone.zone}>
                {zone.zone}
              </option>
            ))}
          </select>
          <button className="p-2 text-gray-600 hover:text-gray-900">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: "16/9" }}>
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="text-center">
            <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <div className="text-lg font-medium">Live Feed - {selectedZone}</div>
            <div className="text-sm opacity-75">Camera Online • Recording</div>
          </div>
        </div>
        <div className="absolute top-4 left-4 flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-white text-sm font-medium">LIVE</span>
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button className="p-2 bg-black/50 rounded-lg text-white hover:bg-black/70">
              <Play className="w-4 h-4" />
            </button>
            <button className="p-2 bg-black/50 rounded-lg text-white hover:bg-black/70">
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
          <div className="text-white text-sm">{currentTime.toLocaleTimeString()}</div>
        </div>
      </div>
    </div>
  )
} 