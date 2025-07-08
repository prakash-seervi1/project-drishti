"use client"

import { useState, useEffect } from "react"
import { GoogleMap, useLoadScript, PolylineF } from "@react-google-maps/api"
import { Link } from "react-router-dom"
import { incidentsAPI, zonesAPI, respondersAPI } from "../services/api"

// Import map components
import {
  MapHeader,
  MapFilters,
  MapControls,
  MapLegend,
  IncidentMarker,
  ResponderMarker,
  ZonePolygon,
  MapStats,
  getIncidentMarkerIcon,
  getResponderMarkerIcon,
  getStatusColor,
  getResponderStatusColor,
  getZoneColor,
  timeAgo,
  calculateMapStats
} from "../components/map"

const mapContainerStyle = {
  width: "100%",
  height: "75vh",
  borderRadius: "16px",
}

const center = { lat: 12.9716, lng: 77.5946 } // Default center: Bangalore

const mapStyles = [
  {
    featureType: "all",
    elementType: "geometry.fill",
    stylers: [{ weight: "2.00" }],
  },
  {
    featureType: "all",
    elementType: "geometry.stroke",
    stylers: [{ color: "#9c9c9c" }],
  },
  {
    featureType: "all",
    elementType: "labels.text",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "landscape",
    elementType: "all",
    stylers: [{ color: "#f2f2f2" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry.fill",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "landscape.man_made",
    elementType: "geometry.fill",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "poi",
    elementType: "all",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "all",
    stylers: [{ saturation: -100 }, { lightness: 45 }],
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [{ color: "#eeeeee" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#7b7b7b" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road.highway",
    elementType: "all",
    stylers: [{ visibility: "simplified" }],
  },
  {
    featureType: "road.arterial",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    elementType: "all",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "water",
    elementType: "all",
    stylers: [{ color: "#46bcec" }, { visibility: "on" }],
  },
  {
    featureType: "water",
    elementType: "geometry.fill",
    stylers: [{ color: "#c8d7d4" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#070707" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#ffffff" }],
  },
]

export default function MapPage() {
  const [incidents, setIncidents] = useState([])
  const [zones, setZones] = useState([])
  const [responders, setResponders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedMarker, setSelectedMarker] = useState(null)
  const [mapCenter, setMapCenter] = useState(center)
  const [zoom, setZoom] = useState(15)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    incidents: true,
    responders: true,
    zones: true,
    status: "all",
    type: "all",
  })
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  })

  // Fetch all map data
  const fetchMapData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch incidents
      const incidentsResponse = await incidentsAPI.getIncidents({
        limit: 100,
        status: filters.status !== 'all' ? filters.status : undefined,
        type: filters.type !== 'all' ? filters.type : undefined,
      })

      // Fetch zones
      const zonesResponse = await zonesAPI.getZones()

      // Fetch responders
      const respondersResponse = await respondersAPI.getResponders()

      if (incidentsResponse.success) {
        const incidentsData = incidentsResponse.data?.incidents || []
        
        // Transform incidents to include position data
        const transformedIncidents = incidentsData.map(incident => ({
          ...incident,
          position: incident.location ? {
            lat: incident.location.lat,
            lng: incident.location.lng
          } : incident.lat && incident.lng ? {
            lat: incident.lat,
            lng: incident.lng
          } : null
        })).filter(incident => incident.position) // Only show incidents with position data
        
        setIncidents(transformedIncidents)
      }

      if (zonesResponse.success) {
        const zonesData = zonesResponse.data?.zones || []
        
        // Transform zones to include coordinates if they don't have them
        const transformedZones = zonesData.map(zone => ({
          ...zone,
          coordinates: zone.coordinates || zone.boundaries || [
            { lat: 12.9716, lng: 77.5946 },
            { lat: 12.9726, lng: 77.5946 },
            { lat: 12.9726, lng: 77.5956 },
            { lat: 12.9716, lng: 77.5956 },
          ]
        }))
        
        setZones(transformedZones)
      }

      if (respondersResponse.success) {
        const respondersData = respondersResponse.data?.responders || []
        
        // Transform responders to include position data
        const transformedResponders = respondersData.map(responder => ({
          ...responder,
          position: responder.currentLocation || responder.position || {
            lat: 12.9716 + (Math.random() - 0.5) * 0.01,
            lng: 77.5946 + (Math.random() - 0.5) * 0.01
          }
        }))
        
        setResponders(transformedResponders)
      }

      setLastUpdate(new Date())
    } catch (err) {
      console.error('Error fetching map data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Auto-refresh data
  useEffect(() => {
    fetchMapData()

    if (autoRefresh) {
      const interval = setInterval(fetchMapData, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [filters.status, filters.type, autoRefresh])

  const handleRefresh = () => {
    fetchMapData()
  }

  const handleFilterToggle = () => {
    setShowFilters(!showFilters)
  }

  const handleFilterClose = () => {
    setShowFilters(false)
  }

  const generateRoute = (start, end) => {
    // This would integrate with Google Directions API
    return [
      { lat: start.lat, lng: start.lng },
      { lat: end.lat, lng: end.lng },
    ]
  }

  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker)
  }

  const handleMapClick = () => {
    setSelectedMarker(null)
  }

  const handleZoomChange = () => {
    if (window.google && window.google.maps) {
      const map = window.google.maps.Map
      if (map) {
        setZoom(map.getZoom())
        setMapCenter({
          lat: map.getCenter().lat(),
          lng: map.getCenter().lng(),
        })
      }
    }
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🗺️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Map Loading Error</h2>
          <p className="text-gray-600 mb-4">Failed to load Google Maps</p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }

  // Calculate map statistics
  const mapStats = calculateMapStats(incidents, zones, responders)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <MapHeader
          totalIncidents={mapStats.totalIncidents}
          activeResponders={mapStats.activeResponders}
          zonesCovered={mapStats.zonesCovered}
          lastUpdate={lastUpdate}
          onRefresh={handleRefresh}
          autoRefresh={autoRefresh}
          setAutoRefresh={setAutoRefresh}
        />

        {/* Map Statistics */}
        <MapStats stats={mapStats} />

        {/* Map Container */}
        <div className="relative bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={mapCenter}
            zoom={zoom}
            options={{
              styles: mapStyles,
              disableDefaultUI: false,
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: true,
              fullscreenControl: true,
            }}
            onClick={handleMapClick}
            onZoomChanged={handleZoomChange}
            onCenterChanged={handleZoomChange}
          >
            {/* Render Zones */}
            {filters.zones &&
              zones.map((zone) => (
                <ZonePolygon
                  key={zone.id}
                  zone={zone}
                  getZoneColor={getZoneColor}
                  onClick={() => handleMarkerClick({ type: "zone", data: zone })}
                />
              ))}

            {/* Render Incident Markers */}
            {filters.incidents &&
              incidents.map((incident) => (
                <IncidentMarker
                  key={incident.id}
                  incident={incident}
                  getIncidentMarkerIcon={getIncidentMarkerIcon}
                  getStatusColor={getStatusColor}
                  timeAgo={timeAgo}
                  onClick={() => handleMarkerClick({ type: "incident", data: incident })}
                />
              ))}

            {/* Render Responder Markers */}
            {filters.responders &&
              responders.map((responder) => (
                <ResponderMarker
                  key={responder.id}
                  responder={responder}
                  getResponderMarkerIcon={getResponderMarkerIcon}
                  getResponderStatusColor={getResponderStatusColor}
                  onClick={() => handleMarkerClick({ type: "responder", data: responder })}
                />
              ))}

            {/* Render Routes */}
            {selectedMarker?.type === "responder" &&
              selectedMarker.data.assignedIncident && (
                <PolylineF
                  path={generateRoute(
                    selectedMarker.data.position,
                    incidents.find((i) => i.id === selectedMarker.data.assignedIncident)?.position || center
                  )}
                  options={{
                    strokeColor: "#3B82F6",
                    strokeOpacity: 0.8,
                    strokeWeight: 3,
                    icons: [
                      {
                        icon: {
                          path: window.google?.maps?.SymbolPath?.FORWARD_CLOSED_ARROW,
                        },
                        offset: "50%",
                      },
                    ],
                  }}
                />
              )}
          </GoogleMap>

          {/* Map Controls */}
          <MapControls
            zoom={zoom}
            setZoom={setZoom}
            center={mapCenter}
            setMapCenter={setMapCenter}
            onFilterToggle={handleFilterToggle}
          />

          {/* Map Legend */}
          <MapLegend filters={filters} />

          {/* Selected Marker Info */}
          {selectedMarker && (
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">
                  {selectedMarker.data.name || selectedMarker.data.type}
                </h3>
                <button
                  onClick={() => setSelectedMarker(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <div className="text-sm text-gray-600">
                {selectedMarker.type === "incident" && (
                  <>
                    <p>Status: {selectedMarker.data.status}</p>
                    <p>Priority: {selectedMarker.data.priority}</p>
                    <p>Zone: {selectedMarker.data.zone}</p>
                  </>
                )}
                {selectedMarker.type === "responder" && (
                  <>
                    <p>Type: {selectedMarker.data.type}</p>
                    <p>Status: {selectedMarker.data.status}</p>
                    <p>ETA: {selectedMarker.data.eta}</p>
                  </>
                )}
                {selectedMarker.type === "zone" && (
                  <>
                    <p>Status: {selectedMarker.data.status}</p>
                    <p>Incidents: {selectedMarker.data.incidents}</p>
                    <p>Crowd Density: {selectedMarker.data.crowdDensity}%</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <MapFilters
            filters={filters}
            setFilters={setFilters}
            onClose={handleFilterClose}
          />
        )}
      </div>
    </div>
  )
}
