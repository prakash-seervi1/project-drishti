import { Zap, Users, Video, Brain, Bell, Navigation } from 'lucide-react'
import ActionButton from './ActionButton'

export default function ActionCenter() {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <Zap className="w-6 h-6 mr-2 text-yellow-500" />
        Action Center
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <ActionButton
          icon={<Zap className="w-5 h-5" />}
          label="Dispatch Team"
          color="bg-blue-600 hover:bg-blue-700"
          onClick={() => alert("Dispatch interface opened")}
        />
        <ActionButton
          icon={<Users className="w-5 h-5" />}
          label="Crowd Alert"
          color="bg-green-600 hover:bg-green-700"
          onClick={() => alert("Crowd alert sent")}
        />
        <ActionButton
          icon={<Video className="w-5 h-5" />}
          label="Zoom Camera"
          color="bg-purple-600 hover:bg-purple-700"
          onClick={() => alert("Camera zoom activated")}
        />
        <ActionButton
          icon={<Brain className="w-5 h-5" />}
          label="AI Analysis"
          color="bg-indigo-600 hover:bg-indigo-700"
          onClick={() => alert("AI Assistant available via floating button")}
        />
        <ActionButton
          icon={<Bell className="w-5 h-5" />}
          label="Send Alert"
          color="bg-orange-600 hover:bg-orange-700"
          onClick={() => alert("Alert broadcast sent")}
        />
        <ActionButton
          icon={<Navigation className="w-5 h-5" />}
          label="Route Traffic"
          color="bg-teal-600 hover:bg-teal-700"
          onClick={() => alert("Traffic routing activated")}
        />
      </div>
    </div>
  )
} 