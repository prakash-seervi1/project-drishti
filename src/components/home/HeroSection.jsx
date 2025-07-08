import { Shield, Eye, FileText } from "lucide-react"
import { Link } from "react-router-dom"

export default function HeroSection() {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4 mr-2" />
            AI-Powered Safety Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Intelligent Situational
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              {" "}
              Awareness
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            An AI-powered situational awareness platform to ensure safety at large-scale public events using real-time
            video analysis, intelligent summarization, and rapid incident response.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105">
              <Eye className="w-5 h-5 mr-2" />
              <Link to="/Dashboard">Live Dashboard</Link>
            </button>
            <button className="inline-flex items-center px-8 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-all duration-200 bg-white/70 backdrop-blur-sm">
              <FileText className="w-5 h-5 mr-2" />
              View Documentation
            </button>
          </div>
        </div>
      </div>
    </section>
  )
} 