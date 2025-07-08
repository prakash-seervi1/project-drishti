"use client"

import { useState } from "react"
import { ArrowLeft, Brain, Search, Sparkles, MapPin, Clock, Loader2 } from "lucide-react"
import { Link } from "react-router-dom"
import { geminiAPI } from "../services/api"

export default function Summary() {
  const [zone, setZone] = useState("Zone A")
  const [summary, setSummary] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSummary("")
    setError("")

    try {
      const response = await geminiAPI.analyzeWithGemini({
        prompt: `Generate a comprehensive summary for ${zone}. Include current status, incidents, crowd density, responder availability, and safety recommendations.`,
        context: `Zone: ${zone}`
      })

      if (response.success) {
        setSummary(response.analysis || response.response || "No summary available.")
      } else {
        throw new Error(response.error || 'Failed to generate summary')
      }
    } catch (err) {
      setError(`Failed to get summary: ${err.message}`)
      console.error("Summary error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
  </Link>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Zone Summary</h1>
              <p className="text-gray-600">AI-generated briefings for comprehensive zone analysis</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="zone" className="block text-sm font-medium text-gray-700 mb-2">
                  Zone Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="zone"
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    placeholder="Enter zone name (e.g., Zone A, Main Hall)"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              <div className="sm:pt-7">
                <button
                  type="submit"
                  disabled={loading || !zone.trim()}
                  className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Summary
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">⚠️ {error}</p>
            </div>
          )}

          {summary && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 animate-fade-in">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-blue-900">
                  AI Summary for: <span className="text-blue-700">{zone}</span>
                </h2>
              </div>
              <div className="flex items-center space-x-2 mb-4 text-sm text-blue-600">
                <Clock className="w-4 h-4" />
                <span>Generated at {new Date().toLocaleString()}</span>
              </div>
              <div className="prose prose-blue max-w-none">
                <p className="text-gray-800 whitespace-pre-line leading-relaxed">{summary}</p>
              </div>
            </div>
          )}

          {!summary && !loading && !error && (
            <div className="text-center py-12 text-gray-500">
              <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Enter a zone name and click "Generate Summary" to get AI-powered insights</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
