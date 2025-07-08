"use client"

import { useEffect, useState } from "react"
import { incidentsAPI, zonesAPI, respondersAPI, emergencyContactsAPI, systemAPI } from "../services/api"
import ErrorBoundary from "../components/ErrorBoundary"
import TimestampTest from "../components/TimestampTest"
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

import {
  DashboardHeader,
  CriticalAlerts,
  AISituationSummary,
  LiveCommandFeed,
  ZoneStatus,
  IncidentAnalytics,
  ResponseTeams,
  ActionCenter,
  EmergencyContacts
} from "../components/dashboard"

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedZone, setSelectedZone] = useState("Zone A")
  const [currentTime, setCurrentTime] = useState(new Date())

  // Real-time dashboard data
  const [dashboardData, setDashboardData] = useState({
    totalIncidents: 0,
    activeIncidents: 0,
    resolvedToday: 0,
    criticalAlerts: 0,
    availableResponders: 0,
    totalResponders: 0,
    zonesMonitored: 0,
    crowdDensity: 0,
    weatherCondition: "Clear",
    temperature: "24°C",
    windSpeed: "12 km/h",
  })

  const [criticalAlerts, setCriticalAlerts] = useState([])
  const [incidentTypes, setIncidentTypes] = useState([])
  const [responderTeams, setResponderTeams] = useState([])
  const [zoneFeeds, setZoneFeeds] = useState([])
  const [emergencyContacts, setEmergencyContacts] = useState([])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch incidents analytics
      const incidentsResponse = await incidentsAPI.getIncidentAnalytics()
      if (incidentsResponse.success) {
        const analytics = incidentsResponse.data || {}
        setDashboardData(prev => ({
          ...prev,
          totalIncidents: analytics.totalIncidents || analytics.total || 0,
          activeIncidents: analytics.activeIncidents || analytics.active || 0,
          resolvedToday: analytics.resolvedToday || analytics.resolved || 0,
          criticalAlerts: analytics.criticalAlerts || analytics.critical || 0,
        }))

        // Set incident types data
        if (analytics.incidentTypes) {
          setIncidentTypes(analytics.incidentTypes.map(type => ({
            type: type.type || type.name,
            count: type.count || 0,
            color: getIncidentTypeColor(type.type || type.name),
            trend: type.trend || "0"
          })))
        } else {
          // Fallback: create incident types from incidents data
          const incidentsData = await incidentsAPI.getIncidents({ limit: 100 })
          if (incidentsData.success) {
            const incidents = incidentsData.data?.incidents || []
            const typeCounts = {}
            incidents.forEach(incident => {
              const type = incident.type || 'Unknown'
              typeCounts[type] = (typeCounts[type] || 0) + 1
            })
            
            setIncidentTypes(Object.entries(typeCounts).map(([type, count]) => ({
              type,
              count,
              color: getIncidentTypeColor(type),
              trend: "0"
            })))
          }
        }

        // Set critical alerts
        if (analytics.criticalAlerts) {
          setCriticalAlerts(analytics.criticalAlerts.map(alert => ({
            id: alert.id,
            type: alert.type,
            zone: alert.zone,
            severity: alert.severity || alert.priority,
            time: alert.timestamp, // This will be formatted in the component
            status: alert.status
          })))
        } else {
          // Fallback: get critical incidents
          const criticalResponse = await incidentsAPI.getIncidents({ 
            priority: 'critical',
            limit: 5 
          })
          if (criticalResponse.success) {
            const criticalIncidents = criticalResponse.data?.incidents || []
            setCriticalAlerts(criticalIncidents.map(incident => ({
              id: incident.id,
              type: incident.type,
              zone: incident.zone,
              severity: incident.priority || 'Critical',
              time: incident.timestamp, // This will be formatted in the component
              status: incident.status
            })))
          }
        }
      }

      // Fetch responders analytics
      const respondersResponse = await respondersAPI.getResponderAnalytics()
      if (respondersResponse.success) {
        const analytics = respondersResponse.data || {}
        setDashboardData(prev => ({
          ...prev,
          availableResponders: analytics.availableResponders || analytics.available || 0,
          totalResponders: analytics.totalResponders || analytics.total || 0,
        }))

        // Set responder teams data
        if (analytics.teams) {
          setResponderTeams(analytics.teams.map(team => ({
            name: team.name,
            available: team.available,
            total: team.total,
            status: team.status,
            contact: team.contact
          })))
        } else {
          // Fallback: get responders data
          const respondersData = await respondersAPI.getResponders()
          if (respondersData.success) {
            const responders = respondersData.data?.responders || []
            const teamCounts = {}
            responders.forEach(responder => {
              const type = responder.type || responder.teamType || 'General'
              if (!teamCounts[type]) {
                teamCounts[type] = { available: 0, total: 0 }
              }
              teamCounts[type].total++
              if (responder.status === 'available' || responder.status === 'ready') {
                teamCounts[type].available++
              }
            })
            
            setResponderTeams(Object.entries(teamCounts).map(([name, counts]) => ({
              name,
              available: counts.available,
              total: counts.total,
              status: counts.available > 0 ? 'Ready' : 'Busy',
              contact: 'N/A'
            })))
          }
        }
      }

      // Fetch zones data
      const zonesResponse = await zonesAPI.getZones()
      if (zonesResponse.success) {
        const zones = zonesResponse.data?.zones || []
        setDashboardData(prev => ({
          ...prev,
          zonesMonitored: zones.length,
        }))

        // Set zone feeds
        setZoneFeeds(zones.map(zone => ({
          zone: zone.name || zone.id,
          status: zone.status || 'Normal',
          incidents: zone.incidents || zone.incidentCount || 0,
          crowd: zone.crowdDensity > 70 ? "High" : zone.crowdDensity > 40 ? "Medium" : "Low",
          camera: zone.cameras?.length > 0 ? "Online" : "Offline"
        })))
      }

      // Fetch emergency contacts
      const contactsResponse = await emergencyContactsAPI.getEmergencyContacts()
      if (contactsResponse.success) {
        const contacts = contactsResponse.data?.contacts || []
        setEmergencyContacts(contacts.map(contact => ({
          service: contact.service || contact.name,
          number: contact.phone || contact.contact,
          status: contact.status || 'Available',
          responseTime: contact.responseTime || "3-5 min"
        })))
      }

      // Fetch system analytics for additional data
      const systemResponse = await systemAPI.getAnalytics()
      if (systemResponse.success) {
        const analytics = systemResponse.data || {}
        setDashboardData(prev => ({
          ...prev,
          crowdDensity: analytics.crowdDensity || 0,
          weatherCondition: analytics.weatherCondition || "Clear",
          temperature: analytics.temperature || "24°C",
          windSpeed: analytics.windSpeed || "12 km/h",
        }))
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Helper function to get incident type colors
  const getIncidentTypeColor = (type) => {
    const colors = {
      fire: "bg-red-500",
      medical: "bg-blue-500",
      security: "bg-yellow-500",
      crowd: "bg-purple-500",
      structural: "bg-gray-500",
      panic: "bg-orange-500",
    }
    return colors[type?.toLowerCase()] || "bg-gray-500"
  }

  useEffect(() => {
    fetchDashboardData()
    // const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    
    // Auto-refresh dashboard data every 30 seconds
    // const refreshTimer = setInterval(fetchDashboardData, 30000)
    
    return () => {
    //   clearInterval(timer)
    //   clearInterval(refreshTimer)
    }
  }, [])

  const handleEmergencyCall = (service, number) => {
    if (confirm(`Call ${service} at ${number}?`)) {
      window.open(`tel:${number}`)
    }
  }

  const handleDispatchResponder = async (team) => {
    try {
      // This would integrate with the dispatch API
      alert(`Dispatching ${team} to selected zone`)
    } catch (error) {
      console.error('Error dispatching responder:', error)
      alert('Failed to dispatch responder')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="w-full max-w-6xl mx-auto">
          <Skeleton height={80} className="mb-8 rounded-xl" />
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} height={100} className="rounded-lg" />
            ))}
          </div>
          <Skeleton height={400} className="rounded-xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Dashboard Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Timestamp Test Component */}
        {/* <TimestampTest /> */}

        {/* Header */}
        <DashboardHeader dashboardData={dashboardData} />

        {/* Critical Alerts & Situation Summary */}
        <div className="grid md:grid-cols-2 gap-6">
          <ErrorBoundary>
            <CriticalAlerts criticalAlerts={criticalAlerts} />
          </ErrorBoundary>
          <AISituationSummary />
        </div>

        {/* Live Feeds & Zone Monitoring */}
        <div className="grid md:grid-cols-3 gap-6">
          <LiveCommandFeed 
            selectedZone={selectedZone}
            setSelectedZone={setSelectedZone}
            zoneFeeds={zoneFeeds}
            currentTime={currentTime}
          />
          <ZoneStatus 
            selectedZone={selectedZone}
            setSelectedZone={setSelectedZone}
            zoneFeeds={zoneFeeds}
          />
        </div>

        {/* Incident Analytics & Response Teams */}
        <div className="grid md:grid-cols-2 gap-6">
          <IncidentAnalytics incidentTypes={incidentTypes} />
          <ResponseTeams 
            responderTeams={responderTeams}
            handleDispatchResponder={handleDispatchResponder}
          />
        </div>

        {/* Action Center */}
        <ActionCenter />

        {/* Emergency Contacts */}
        <EmergencyContacts 
          emergencyContacts={emergencyContacts}
          handleEmergencyCall={handleEmergencyCall}
        />
      </div>
    </div>
  )
}
