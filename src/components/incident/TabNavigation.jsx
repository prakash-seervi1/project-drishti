import { Activity, Clock, Users, Video, LineChart } from "lucide-react"

export default function TabNavigation({ activeTab, setActiveTab }) {
  const accesscode = parseInt(localStorage.getItem('accesscode') || '0');
  const isAdmin = accesscode === 127;

  const allTabs = [
    { id: "overview", label: "Overview", icon: <Activity className="w-4 h-4" /> },
    { id: "timeline", label: "Timeline", icon: <Clock className="w-4 h-4" /> },
    { id: "responders", label: "Responders", icon: <Users className="w-4 h-4" /> },
    { id: "media", label: "Media", icon: <Video className="w-4 h-4" /> },
    { id: "analytics", label: "Analytics", icon: <LineChart className="w-4 h-4" /> },
  ]

  // Filter tabs based on user role
  const tabs = isAdmin ? allTabs : allTabs.filter(tab => tab.id === "overview");

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl mb-1">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
} 