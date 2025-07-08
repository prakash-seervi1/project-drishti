import { useState } from "react"
import { MessageCircle, Sparkles, AlertTriangle, Plus, X } from "lucide-react"
import ReportModal from "./ReportModal"
import AIAssistant from "./AIAssistant"
import CameraCapture from "./CameraCapture"
import { Camera } from "lucide-react"

export default function FloatingActionBar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false)
  const [isCameraOpen, setIsCameraOpen] = useState(false)

  const handleReportClick = () => {
    setIsReportModalOpen(true)
    setIsExpanded(false)
  }

  const handleAIClick = () => {
    setIsAIAssistantOpen(true)
    setIsExpanded(false)
  }

  const handleCameraClick = () => {
    setIsCameraOpen(true)
    setIsExpanded(false)
  }

  return (
    <>
      {/* Floating Action Bar */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* AI Assistant Button */}
        <div 
          className={`transition-all duration-300 ease-in-out ${
            isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0 pointer-events-none'
          }`}
          style={{ transitionDelay: isExpanded ? '0ms' : '150ms' }}
        >
          <button
            onClick={handleAIClick}
            className="w-14 h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center group mb-3"
            title="AI Assistant"
          >
            <div className="relative">
              <MessageCircle className="w-6 h-6" />
              <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300 group-hover:animate-pulse" />
            </div>
          </button>
        </div>

        {/* Camera Button */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0 pointer-events-none'
          }`}
          style={{ transitionDelay: isExpanded ? '50ms' : '100ms' }}
        >
          <button
            onClick={handleCameraClick}
            className="w-14 h-14 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center group mb-3"
            title="Capture Image"
          >
            <Camera className="w-6 h-6" />
          </button>
        </div>

        {/* Report Button */}
        <div 
          className={`transition-all duration-300 ease-in-out ${
            isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0 pointer-events-none'
          }`}
          style={{ transitionDelay: isExpanded ? '100ms' : '50ms' }}
        >
          <button
            onClick={handleReportClick}
            className="w-14 h-14 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center group mb-3"
            title="Report Incident"
          >
            <AlertTriangle className="w-6 h-6 group-hover:animate-pulse" />
          </button>
        </div>

        {/* Main Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center group"
          title={isExpanded ? "Close Actions" : "Quick Actions"}
        >
          <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-45' : 'rotate-0'}`}>
            {isExpanded ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
          </div>
        </button>
      </div>

      {/* Modals */}
      <ReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} />
      <AIAssistant isOpen={isAIAssistantOpen} onClose={() => setIsAIAssistantOpen(false)} />
      <CameraCapture isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} />
    </>
  )
} 