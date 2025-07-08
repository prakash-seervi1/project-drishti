import React from 'react'
import { Truck, Ambulance, Shield } from 'lucide-react'
import { timeAgo } from '../TimeAgo'

// Map utility functions
export const getIncidentMarkerIcon = (incident) => {
  const status = incident.status?.toLowerCase()
  switch (status) {
    case "ongoing":
      return {
        path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z",
        fillColor: "#ef4444",
        fillOpacity: 1,
        strokeColor: "#dc2626",
        strokeWeight: 2,
        scale: 1.2,
      }
    case "resolved":
      return {
        path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z",
        fillColor: "#22c55e",
        fillOpacity: 1,
        strokeColor: "#16a34a",
        strokeWeight: 2,
        scale: 1.2,
      }
    case "investigating":
      return {
        path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z",
        fillColor: "#f59e0b",
        fillOpacity: 1,
        strokeColor: "#d97706",
        strokeWeight: 2,
        scale: 1.2,
      }
    default:
      return {
        path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z",
        fillColor: "#6b7280",
        fillOpacity: 1,
        strokeColor: "#4b5563",
        strokeWeight: 2,
        scale: 1.2,
      }
  }
}

export const getResponderMarkerIcon = (responder) => {
  const colors = {
    "Fire Brigade": "#ef4444",
    "Medical": "#3b82f6",
    "Security": "#f59e0b",
    "Police": "#8b5cf6",
  }

  return {
    path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
    fillColor: colors[responder.type] || "#6b7280",
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 2,
    scale: 1.0,
  }
}

// JSX version for React components
export const getResponderIcon = (type) => {
  switch (type?.toLowerCase()) {
    case "fire brigade":
      return <Truck className="w-4 h-4 text-red-500" />
    case "medical":
      return <Ambulance className="w-4 h-4 text-blue-500" />
    case "security":
      return <Shield className="w-4 h-4 text-yellow-500" />
    default:
      return <Shield className="w-4 h-4 text-gray-500" />
  }
}

// String emoji version (alternative for non-JSX usage)
export const getResponderIconEmoji = (type) => {
  switch (type?.toLowerCase()) {
    case "fire brigade":
      return "🚒"
    case "medical":
      return "🚑"
    case "security":
      return "👮"
    default:
      return "🛡️"
  }
}

export const getStatusColor = (status) => {
  const colors = {
    'critical': 'bg-red-100 text-red-800',
    'high': 'bg-orange-100 text-orange-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'low': 'bg-green-100 text-green-800',
    'resolved': 'bg-gray-100 text-gray-800',
    'ongoing': 'bg-red-100 text-red-800',
    'investigating': 'bg-yellow-100 text-yellow-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export const getResponderStatusColor = (status) => {
  const colors = {
    'en_route': 'bg-blue-100 text-blue-800',
    'on_scene': 'bg-green-100 text-green-800',
    'returning': 'bg-purple-100 text-purple-800',
    'available': 'bg-gray-100 text-gray-800',
    'on_duty': 'bg-yellow-100 text-yellow-800',
    'offline': 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export const getZoneColor = (status) => {
  const colors = {
    'critical': { fill: '#ef4444', stroke: '#dc2626' },
    'active': { fill: '#f59e0b', stroke: '#d97706' },
    'normal': { fill: '#10b981', stroke: '#059669' }
  }
  return colors[status] || { fill: '#6b7280', stroke: '#4b5563' }
}

// Re-export timeAgo for backward compatibility
export { timeAgo }

export const calculateMapStats = (incidents, responders, zones) => {
  return {
    activeIncidents: incidents.filter(i => i.status !== 'resolved').length,
    responders: responders.length,
    criticalZones: zones.filter(z => z.status === 'critical').length,
    avgResponseTime: Math.floor(Math.random() * 10) + 5 // Mock calculation
  }
} 