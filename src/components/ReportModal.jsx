import { useState, useEffect } from "react"
import { collection, addDoc, Timestamp } from "firebase/firestore"
import { db } from "../firebase"
import { X, Send, CheckCircle, XCircle, AlertTriangle, MapPin } from "lucide-react"

export default function ReportModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({ zone: "", type: "", status: "" })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("")
  const [location, setLocation] = useState({ lat: null, lng: null })
  const [locationError, setLocationError] = useState("")

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({ zone: "", type: "", status: "" })
      setMessage("")
      setMessageType("")
      setLocationError("")
      getUserLocation()
    }
  }, [isOpen])

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) onClose()
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setMessage("")
    setMessageType("")
  }

  const getUserLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          })
        },
        (err) => {
          console.warn("Location error:", err)
          setLocationError("⚠️ Unable to fetch location. Please allow location access.")
        },
        { enableHighAccuracy: true }
      )
    } else {
      setLocationError("⚠️ Geolocation not supported in this browser.")
    }
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    setMessageType("")
  
    try {
      // 1. Add the incident to Firestore
      const docRef = await addDoc(collection(db, "incidents"), {
        ...formData,
        timestamp: Timestamp.now(),
      })
  
      setMessage("Incident reported successfully!")
      setMessageType("success")
  
      // 2. Dispatch nearest responder (optional: hardcoded location for now)
      const dispatchRes = await fetch(
        "https://us-central1-project-drishti-mvp-31f1b.cloudfunctions.net/dispatchResponder",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            incidentId: docRef.id,
            lat: 12.9716, // 🔁 Replace with actual incident lat
            lon: 77.5946, // 🔁 Replace with actual incident lon
            incidentType: formData.type.toLowerCase(), // e.g., fire, medical
          }),
        }
      )
  
      const dispatchData = await dispatchRes.json()
  
      if (dispatchData.success) {
        setMessage(`🚑 Responder dispatched: ${dispatchData.responder.name}`)
      } else {
        setMessage("⚠️ Incident reported, but no responder was available.")
      }
  
      // 3. Reset form and close modal
      setFormData({ zone: "", type: "", status: "" })
      setTimeout(() => onClose(), 3000)
    } catch (err) {
      console.error("Error reporting incident:", err)
      setMessage("Failed to report incident. Please try again.")
      setMessageType("error")
    } finally {
      setLoading(false)
    }
  }
  
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Report Incident</h2>
              <p className="text-sm text-gray-600">Quick emergency reporting</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Location status */}
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-500" />
            {location.lat && location.lng
              ? `Location: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
              : locationError || "Fetching location..."}
          </div>

          {/* Zone */}
          <div>
            <label htmlFor="zone" className="block text-sm font-medium text-gray-700 mb-1">
              Zone Location *
            </label>
            <input
              type="text"
              id="zone"
              name="zone"
              placeholder="e.g., Zone A, Main Entrance"
              value={formData.zone}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {/* Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Incident Type *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Select incident type</option>
              <option value="Fire">🔥 Fire Emergency</option>
              <option value="Medical">🚑 Medical Emergency</option>
              <option value="Panic">😰 Crowd Panic</option>
              <option value="Security">🛡️ Security Breach</option>
              <option value="Structural">🏗️ Structural Issue</option>
              <option value="Other">⚠️ Other</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Current Status *
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Select status</option>
              <option value="Ongoing">🔴 Ongoing</option>
              <option value="Investigating">🟡 Under Investigation</option>
              <option value="Resolved">🟢 Resolved</option>
              <option value="Escalated">🚨 Escalated</option>
            </select>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`p-3 rounded-lg flex items-center space-x-2 ${
                messageType === "success"
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              {messageType === "success" ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <p
                className={`text-sm font-medium ${
                  messageType === "success" ? "text-green-800" : "text-red-800"
                }`}
              >
                {message}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Reporting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
