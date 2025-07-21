"use client"

import { useState } from "react"
import { api } from "../services/adkApi";
import { ArrowLeft, Brain, FileText, Send, CheckCircle, XCircle } from "lucide-react"
import { Link } from "react-router-dom"

export default function Report() {
  const [formData, setFormData] = useState({ 
    zone: "", 
    type: "", 
    status: "ongoing",
    description: "",
    priority: "medium",
    severity: 3
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("")

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setMessage("")
    setMessageType("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    setMessageType("")

    try {
      const incidentData = {
        ...formData,
        timestamp: new Date(),
        priority: formData.priority || "medium",
        severity: parseInt(formData.severity) || 3,
        status: formData.status || "ongoing",
        description: formData.description || `Incident reported in ${formData.zone}`,
        reportedBy: "User", // This could be enhanced with actual user info
        location: {
          zone: formData.zone,
          coordinates: null // Could be enhanced with GPS coordinates
        }
      }

      const response = await api.createIncident(incidentData)
      
      if (response.success) {
        setMessage("Incident reported successfully! Response team has been notified.")
        setMessageType("success")
        setFormData({ 
          zone: "", 
          type: "", 
          status: "ongoing",
          description: "",
          priority: "medium",
          severity: 3
        })
      } else {
        throw new Error(response.error || 'Failed to report incident')
      }
    } catch (err) {
      console.error("Error reporting incident:", err)
      setMessage(`Failed to report incident: ${err.message}`)
      setMessageType("error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Report an Incident</h1>
              <p className="text-gray-600">Submit detailed incident information for immediate response</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="zone" className="block text-sm font-medium text-gray-700 mb-2">
                Zone Location *
              </label>
              <input
                type="text"
                id="zone"
                name="zone"
                placeholder="e.g., Zone A, Main Entrance, Food Court"
                value={formData.zone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Incident Type *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Select incident type</option>
                <option value="Fire">Fire Emergency</option>
                <option value="Medical">Medical Emergency</option>
                <option value="Panic">Crowd Panic</option>
                <option value="Security">Security Breach</option>
                <option value="Structural">Structural Issue</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Provide detailed description of the incident..."
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-2">
                  Severity (1-5)
                </label>
                <select
                  id="severity"
                  name="severity"
                  value={formData.severity}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value={1}>1 - Minor</option>
                  <option value={2}>2 - Low</option>
                  <option value={3}>3 - Moderate</option>
                  <option value={4}>4 - High</option>
                  <option value={5}>5 - Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Current Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="ongoing">Ongoing</option>
                <option value="investigating">Under Investigation</option>
                <option value="resolved">Resolved</option>
                <option value="escalated">Escalated</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Submit Incident Report
                </>
              )}
            </button>
          </form>

          {message && (
            <div
              className={`mt-6 p-4 rounded-lg flex items-center space-x-3 ${
                messageType === "success" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
              }`}
            >
              {messageType === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <p className={`font-medium ${messageType === "success" ? "text-green-800" : "text-red-800"}`}>
                {message}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
