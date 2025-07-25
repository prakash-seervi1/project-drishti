"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import {
  ArrowLeft,
  Clock,
  MapPin,
  Calendar,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  Loader2,
  XCircle,
} from "lucide-react"
import { api } from "../services/adkApi";
import {
  IncidentNavigation,
  QuickStats,
  TabNavigation,
  OverviewTab,
  TimelineTab,
  MediaTab,
  AnalyticsTab,
  RespondersTab,
  AssignedResponder,
} from "../components/incident"

import { timeAgo } from '../components/TimeAgo'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export default function IncidentDetail() {
  const { id } = useParams()
  const [incident, setIncident] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState("")
  const [responders, setResponders] = useState([])
  const [relatedIncidents, setRelatedIncidents] = useState([])
  const [updating, setUpdating] = useState(false)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [assignment, setAssignment] = useState(null)
  const [assignedResponder, setAssignedResponder] = useState(null)
  const [zone, setZone] = useState(null)

  // Mock live data (this could be replaced with real-time data later)
  const [liveData] = useState({
    crowdDensity: 85,
    temperature: "26°C",
    humidity: "65%",
    airQuality: "Good",
    noiseLevel: "75 dB",
    evacuationProgress: 45,
    responderETA: "2 min",
    lastUpdate: new Date(),
  })

  const fetchIncidentData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch incident details
      const incidentResponse = await api.getIncidentById(id)
      // Accept both {success, data} and direct data
      let incidentData = incidentResponse && incidentResponse.data ? incidentResponse.data : incidentResponse;
      if (incidentData && (incidentData.incident || incidentData.id)) {
        const { incident, zone, assignedResponder, assignmentTransaction } = incidentData;
        setIncident(incident || incidentData);
        setZone(zone);
        setAssignedResponder(assignedResponder);
        setAssignment(assignmentTransaction);

        // Fix: If zone is missing, fetch by zoneId
        const zoneId = (incident || incidentData).zoneId;
        if (!zone && zoneId) {
          try {
            const zoneRes = await api.getZoneById(zoneId);
            const zoneObj = zoneRes.zone || zoneRes;
            setZone(zoneObj && zoneObj.name ? zoneObj : { id: zoneId, name: zoneObj.name || zoneId });
          } catch {
            setZone({ id: zoneId, name: zoneId });
          }
        }

        // Fetch incident notes
        // const notesResponse = await api.getIncidentNotes(id)
        // const notesData = notesResponse && notesResponse.data ? notesResponse.data : notesResponse;
        // setNotes(notesData || [])

        // Fetch responders
        let respondersResponse = await api.getResponders();
        let responders = Array.isArray(respondersResponse) ? respondersResponse : (respondersResponse.responders || respondersResponse.data || []);
        setResponders(responders);

        // Fetch related incidents (same zone, different status)
        const relatedResponse = await api.getIncidents({
          zone: (zone && zone.id) || (incident && incident.zoneId) || (incidentData && incidentData.zoneId),
          status: '!resolved',
          limit: 3
        })
        const relatedData = relatedResponse && relatedResponse.data && relatedResponse.data.incidents
          ? relatedResponse.data.incidents
          : (relatedResponse.incidents || []);
        setRelatedIncidents(
          relatedData.filter(inc => inc.id !== id).slice(0, 3)
        )
      } else {
        throw new Error(incidentResponse.error || 'Incident not found')
      }
    } catch (err) {
      console.error("Error fetching incident data:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchIncidentData()
    }
  }, [id])

  const updateIncidentStatus = async (newStatus) => {
    if (!incident) return

    setUpdating(true)
    try {
      const response = await api.updateIncident(id, {
        status: newStatus,
        lastUpdated: new Date(),
      })
      
      if (response.success) {
        setIncident({ ...incident, status: newStatus })
      } else {
        throw new Error(response.error || 'Failed to update incident status')
      }
    } catch (error) {
      console.error("Error updating incident status:", error)
      alert(`Failed to update incident status: ${error.message}`)
    } finally {
      setUpdating(false)
    }
  }

  const addNote = async () => {
    if (!newNote.trim() || !incident) return

    try {
      const response = await api.addIncidentNote(id, newNote.trim())
      
      if (response.success) {
        const newNoteData = {
          id: response.data.id,
          incidentId: id,
          type: "note",
          content: newNote.trim(),
          timestamp: new Date(),
          author: "Current User",
        }
        setNotes([newNoteData, ...notes])
        setNewNote("")
      } else {
        throw new Error(response.error || 'Failed to add note')
      }
    } catch (error) {
      console.error("Error adding note:", error)
      alert(`Failed to add note: ${error.message}`)
    }
  }

  const assignResponder = async (responderId) => {
    if (!incident) return

    try {
      const response = await api.assignResponderToIncident(responderId, id)
      
      if (response.success) {
        const responder = responders.find((r) => r.id === responderId)
        setIncident({ ...incident, assignedResponder: responder })
      } else {
        throw new Error(response.error || 'Failed to assign responder')
      }
    } catch (error) {
      console.error("Error assigning responder:", error)
      alert(`Failed to assign responder: ${error.message}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="w-full max-w-3xl mx-auto">
          <Skeleton height={60} className="mb-6 rounded-xl" />
          <Skeleton height={400} className="rounded-xl" />
        </div>
      </div>
    )
  }

  if (error || !incident) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {error ? 'Error Loading Incident' : 'Incident Not Found'}
          </h2>
          <p className="text-gray-600 mb-4">
            {error || 'The requested incident could not be found.'}
          </p>
          <div className="space-x-4">
            <button
              onClick={fetchIncidentData}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
            <Link
              to="/incidents"
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Back to Incidents
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <IncidentNavigation
          incident={incident}
          updating={updating}
          onStatusUpdate={updateIncidentStatus}
          timeAgo={timeAgo}
          zone={zone}
        />

        {/* Quick Stats */}
        <QuickStats incident={incident} liveData={liveData} zone={zone} />

        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl mb-6 space-x-8 px-8 py-8">
        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "overview" && (
            <OverviewTab
              incident={incident}
              relatedIncidents={relatedIncidents}
              timeAgo={timeAgo}
              zone={zone}
              assignedResponder={assignedResponder}
              assignment={assignment}
              liveData={liveData}
              showEnvironmentalConditions={!!(liveData && (liveData.temperature || liveData.windSpeed || liveData.visibility || liveData.crowdDensity))}
            />
          )}
          {activeTab === "timeline" && (
            <TimelineTab
              notes={notes}
              newNote={newNote}
              setNewNote={setNewNote}
              addNote={addNote}
              timeAgo={timeAgo}
              zone={zone}
            />
          )}
          {activeTab === "media" && (
            <MediaTab
              incident={incident}
              isVideoPlaying={isVideoPlaying}
              setIsVideoPlaying={setIsVideoPlaying}
              zone={zone}
            />
          )}
          {activeTab === "analytics" && (
            <AnalyticsTab incident={incident} liveData={liveData} zone={zone} />
          )}
          {activeTab === "responders" && (
            <RespondersTab
              incident={incident}
              responders={responders}
              assignedResponder={assignedResponder}
              assignment={assignment}
              zone={zone}
            />
          )}
          {activeTab === "assignedResponder" && (
            <AssignedResponder
              incident={incident}
              responders={responders}
              assignResponder={assignResponder}
              liveData={liveData}
              assignedResponder={assignedResponder}
              assignment={assignment}
            />
          )}
          </div>
        </div>
      </div>
    </div>
  )
}
