import { Video, Camera, Play, Pause, Volume2, Maximize2, Navigation, Globe } from "lucide-react"

export default function MediaTab({ incident, isVideoPlaying, setIsVideoPlaying,zone }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Live Feed */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Video className="w-5 h-5 mr-2 text-red-500" />
          Live Camera Feed
        </h3>
        <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: "16/9" }}>
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center">
              <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <div className="text-lg font-medium">Zone {incident.zone} - Camera 1</div>
              <div className="text-sm opacity-75">Live Feed Active</div>
            </div>
          </div>
          <div className="absolute top-4 left-4 flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-white text-sm font-medium">LIVE</span>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                className="p-2 bg-black/50 rounded-lg text-white hover:bg-black/70"
              >
                {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button className="p-2 bg-black/50 rounded-lg text-white hover:bg-black/70">
                <Volume2 className="w-4 h-4" />
              </button>
              <button className="p-2 bg-black/50 rounded-lg text-white hover:bg-black/70">
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
            <div className="text-white text-sm">{new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      {/* Location Map */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Navigation className="w-5 h-5 mr-2 text-blue-500" />
          Incident Location
        </h3>
        <div className="bg-gray-100 rounded-lg p-8 text-center" style={{ aspectRatio: "16/9" }}>
          <Globe className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <div className="text-gray-600">Interactive Map</div>
          <div className="text-sm text-gray-500 mt-2">
            Showing {incident.zone} and nearby responder locations
          </div>
        </div>
      </div>
    </div>
  )
} 