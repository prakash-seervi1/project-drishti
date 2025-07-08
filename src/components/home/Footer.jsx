import { Brain } from "lucide-react"

export default function Footer() {
  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900">
      <div className="max-w-7xl mx-auto text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Project Drishti</span>
        </div>
        <p className="text-gray-400 mb-4">Made with ❤️ for Hack2Skill AI Day</p>
        <p className="text-sm text-gray-500">Powered by Google Cloud & Gemini AI</p>
      </div>
    </footer>
  )
} 