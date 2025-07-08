import React from 'react'
import { 
  Shield, 
  Truck, 
  Ambulance, 
  Shield as SecurityIcon 
} from "lucide-react"
import { timeAgo } from '../TimeAgo'

export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "ongoing":
      return "bg-red-100 text-red-800 border-red-200"
    case "resolved":
      return "bg-green-100 text-green-800 border-green-200"
    case "investigating":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "escalated":
      return "bg-purple-100 text-purple-800 border-purple-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case "critical":
      return "bg-red-100 text-red-800"
    case "high":
      return "bg-orange-100 text-orange-800"
    case "medium":
      return "bg-yellow-100 text-yellow-800"
    case "low":
      return "bg-green-100 text-green-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export const getTypeIcon = (type) => {
  switch (type?.toLowerCase()) {
    case "fire":
      return { icon: "🔥", color: "text-red-500" }
    case "medical":
      return { icon: "🏥", color: "text-blue-500" }
    case "security":
      return { icon: "🛡️", color: "text-yellow-500" }
    case "panic":
      return { icon: "🚨", color: "text-orange-500" }
    case "structural":
      return { icon: "🏗️", color: "text-purple-500" }
    default:
      return { icon: "⚠️", color: "text-gray-500" }
  }
}

export const getResponderIcon = (type) => {
  switch (type?.toLowerCase()) {
    case "fire brigade":
      return <Truck className="w-4 h-4 text-red-500" />
    case "medical":
      return <Ambulance className="w-4 h-4 text-blue-500" />
    case "security":
      return <SecurityIcon className="w-4 h-4 text-yellow-500" />
    default:
      return <Shield className="w-4 h-4 text-gray-500" />
  }
}

// Alternative emoji version for non-JSX usage
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

// Re-export timeAgo for backward compatibility
export { timeAgo }

export const getStatusCounts = (incidents) => {
  return {
    all: incidents.length,
    ongoing: incidents.filter((i) => i.status?.toLowerCase() === "ongoing").length,
    resolved: incidents.filter((i) => i.status?.toLowerCase() === "resolved").length,
    investigating: incidents.filter((i) => i.status?.toLowerCase() === "investigating").length,
    escalated: incidents.filter((i) => i.status?.toLowerCase() === "escalated").length,
  }
} 