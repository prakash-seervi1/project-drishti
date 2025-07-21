"use client"

import { useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { api } from "../services/adkApi";
import DebugPanel from "../components/DebugPanel"
// import APITest from "../components/APITest"
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

import {
  IncidentHeader,
  StatusOverview,
  SearchFilters,
  IncidentList,
  timeAgo,
  getStatusCounts,
  getTypeIcon,
  getStatusColor,
  getPriorityColor,
  getResponderIcon
} from "../components/incidents"

export default function Incidents() {
  const [incidents, setIncidents] = useState([])
  const [filteredIncidents, setFilteredIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [sortBy, setSortBy] = useState("timestamp")
  const [sortOrder, setSortOrder] = useState("desc")
  const [viewMode, setViewMode] = useState("cards") // cards or table
  const [selectedIncidents, setSelectedIncidents] = useState([])
  const [expandedCard, setExpandedCard] = useState(null)
  const [zoneMap, setZoneMap] = useState({})

  // Fetch incidents from API
  useEffect(() => {
    setLoading(true)
    setError(null)
    api.getIncidents()
      .then(data => {
        // Support both array and {incidents: array} response
        const rawIncidents = Array.isArray(data) ? data : (data.incidents || []);
        const mappedIncidents = rawIncidents.map(incident => ({
          ...incident,
          // Convert timestamp to Firestore-style object for compatibility
          timestamp: incident.timestamp
            ? { seconds: Math.floor(new Date(incident.timestamp).getTime() / 1000) }
            : { seconds: Date.now() / 1000 },
          // Use zoneId for mapping, but keep zone as undefined (zoneMap will fill it in)
          zone: undefined,
        }));
        setIncidents(mappedIncidents);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  // Filter incidents based on search term
  const filterIncidents = () => {
    let filtered = incidents

    console.log('🔍 Filtering incidents:', {
      total: incidents.length,
      searchTerm,
      statusFilter,
      typeFilter,
      priorityFilter
    })

    if (searchTerm) {
      filtered = filtered.filter(incident =>
        incident.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.zone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    console.log('✅ Filtered incidents:', filtered.length)
    setFilteredIncidents(filtered)
  }

  // Handle bulk actions
  const handleBulkAction = async (action) => {
    if (selectedIncidents.length === 0) {
      alert('Please select incidents first')
      return
    }
    try {
      // The new backend may not support bulk update; fallback to individual updates
      await Promise.all(selectedIncidents.map(id => api.updateIncident(id, { status: action })))
      setIncidents(prev => prev.map(incident => 
        selectedIncidents.includes(incident.id)
          ? { ...incident, status: action }
          : incident
      ))
      setSelectedIncidents([])
      alert(`Successfully updated ${selectedIncidents.length} incidents`)
    } catch (err) {
      console.error('Error performing bulk action:', err)
      alert(`Failed to perform bulk action: ${err.message}`)
    }
  }

  // Fetch data on component mount and when filters change
  useEffect(() => {
    filterIncidents()
  }, [sortBy, sortOrder, statusFilter, typeFilter, priorityFilter])

  // Filter incidents when search term or incidents change
  useEffect(() => {
    filterIncidents()
  }, [searchTerm, incidents])

  // Fetch zones on component mount
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await api.getZones()
        if (response.success) {
          // Create a map of zoneId -> zone object
          const map = {}
          for (const zone of response.data?.zones || []) {
            map[zone.id] = zone
          }
          setZoneMap(map)
        }
      } catch (err) {
        console.error('Error fetching zones:', err)
        setZoneMap({})
      }
    }
    fetchZones()
  }, [])

  // Get status counts for overview
  const statusCounts = getStatusCounts(incidents)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div>
            <Skeleton height={32} width={200} className="mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} height={96} />
              ))}
            </div>
            <Skeleton height={384} />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-medium">Error Loading Incidents</h3>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* API Test Component */}
        {/* <APITest /> */}

        {/* Header */}
        <IncidentHeader 
          totalIncidents={incidents.length}
          selectedCount={selectedIncidents.length}
          onBulkAction={handleBulkAction}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {/* Status Overview */}
        <StatusOverview statusCounts={statusCounts} />

        {/* Search and Filters */}
        <SearchFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />

        {/* Incident List */}
        <IncidentList
          loading={loading}
          filteredIncidents={filteredIncidents}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          typeFilter={typeFilter}
          priorityFilter={priorityFilter}
          typeInfo={getTypeIcon}
          getStatusColor={getStatusColor}
          getPriorityColor={getPriorityColor}
          getResponderIcon={getResponderIcon}
          timeAgo={timeAgo}
          selectedIncidents={selectedIncidents}
          setSelectedIncidents={setSelectedIncidents}
          expandedCard={expandedCard}
          setExpandedCard={setExpandedCard}
          zoneMap={zoneMap}
        />

        {/* Debug Panel */}
        <DebugPanel 
          data={{
            rawIncidents: incidents,
            filteredIncidents: filteredIncidents,
            statusCounts: statusCounts,
            loading: loading,
            error: error
          }} 
          title="Incidents Debug"
        />
      </div>
    </div>
  )
}
