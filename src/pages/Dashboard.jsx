"use client"

import { useEffect, useState } from "react"
import { api } from "../services/adkApi"
import ErrorBoundary from "../components/ErrorBoundary"
import TimestampTest from "../components/TimestampTest"
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { Card, CardContent, FormControl, InputLabel, Select, MenuItem, Box, Typography } from '@mui/material';
import CrowdForecastChart from '../components/dashboard/CrowdForecastChart';
import DispatchModal from '../components/dashboard/DispatchModal';
import SendAlertModal from '../components/dashboard/SendAlertModal';
import AICommandModal from '../components/dashboard/AICommandModal';
import { toast } from 'react-hot-toast';

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
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [dispatchTeam, setDispatchTeam] = useState(null);
  const [allResponders, setAllResponders] = useState([]); // for modal
  const [incidents, setIncidents] = useState([]);
  const [sendAlertModalOpen, setSendAlertModalOpen] = useState(false);
  const [aiModalOpen, setAIModalOpen] = useState(false);
  const [aiSummary, setAISummary] = useState("");
  const [aiActions, setAIActions] = useState([]);
  const [aiResources, setAIResources] = useState([]);
  const [aiError, setAIError] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingResources, setLoadingResources] = useState(false);
  const [loadingActions, setLoadingActions] = useState(false);

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

      // Fetch incidents analytics from new backend
      const incidentsRes = await api.getIncidents();
      const incidents = Array.isArray(incidentsRes) ? incidentsRes : (incidentsRes.incidents || []);
      // Calculate active and resolved incidents
      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10); // e.g., '2025-07-19'
      // Treat all non-resolved as active
      const activeIncidents = incidents.filter(
        inc => !inc.status || inc.status.toLowerCase() !== 'resolved'
      ).length;
      const resolvedToday = incidents.filter(inc => {
        if (!inc.status || inc.status.toLowerCase() !== 'resolved') return false;
        if (!inc.resolvedAt) return false;
        // resolvedAt may be ISO string or object
        const resolvedDate = typeof inc.resolvedAt === 'string'
          ? inc.resolvedAt.slice(0, 10)
          : (inc.resolvedAt.seconds
              ? new Date(inc.resolvedAt.seconds * 1000).toISOString().slice(0, 10)
              : null);
        return resolvedDate === todayStr;
      }).length;
      setDashboardData(prev => ({
        ...prev,
        totalIncidents: incidents.length,
        activeIncidents,
        resolvedToday,
      }));
      // Set incident types data
      const typeCounts = {};
      incidents.forEach(incident => {
        const type = incident.type || 'Unknown';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });
      setIncidentTypes(Object.entries(typeCounts).map(([type, count]) => ({
        type,
        count,
        color: getIncidentTypeColor(type),
        trend: "0"
      })));
      // Set critical alerts (example: filter by priority)
      setCriticalAlerts(incidents.filter(i => i.priority === 'critical').map(incident => ({
        id: incident.id,
        type: incident.type,
        zone: incident.zone,
        severity: incident.priority || 'Critical',
        time: incident.timestamp,
        status: incident.status
      })));
      setIncidents(incidents);

      // Fetch responders analytics from new backend
      let responders = await api.getResponders();
      if (!Array.isArray(responders) && responders && Array.isArray(responders.responders)) {
        responders = responders.responders;
      } else if (!Array.isArray(responders)) {
        responders = [];
      }
      setDashboardData(prev => ({
        ...prev,
        totalResponders: responders.length,
        availableResponders: responders.filter(r => r.status === 'available' || r.status === 'ready').length,
      }));
      // Set responder teams data (example: group by type)
      const teamCounts = {};
      responders.forEach(responder => {
        const type = responder.type || responder.teamType || 'General';
        if (!teamCounts[type]) {
          teamCounts[type] = { available: 0, total: 0 };
        }
        teamCounts[type].total++;
        if (responder.status === 'available' || responder.status === 'ready') {
          teamCounts[type].available++;
        }
      });
      setResponderTeams(Object.entries(teamCounts).map(([name, counts]) => ({
        name,
        available: counts.available,
        total: counts.total,
        status: counts.available > 0 ? 'Ready' : 'Busy',
        contact: 'N/A'
      })));
      setAllResponders(responders);

      // Fetch zones data
      let zones = await api.getZones();
      if (!Array.isArray(zones) && zones && Array.isArray(zones.zones)) {
        zones = zones.zones;
      } else if (!Array.isArray(zones)) {
        zones = [];
      }
      // Calculate overall crowd density (average across all zones)
      let avgCrowdDensity = 0;
      if (zones.length > 0) {
        const totalOccupancy = zones.reduce((sum, z) => sum + (z.currentOccupancy || 0), 0);
        const totalCapacity = zones.reduce((sum, z) => sum + (z.capacity || 0), 0);
        avgCrowdDensity = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;
      }
      setDashboardData(prev => ({
        ...prev,
        zonesMonitored: zones.length,
        crowdDensity: avgCrowdDensity,
      }));
      // Count incidents per zone
      const zoneIncidentCounts = {};
      incidents.forEach(incident => {
        if (incident.zoneId) {
          zoneIncidentCounts[incident.zoneId] = (zoneIncidentCounts[incident.zoneId] || 0) + 1;
        }
      });
      setZoneFeeds(zones.map(zone => {
        const crowdDensity = zone.crowdDensity !== undefined
          ? zone.crowdDensity
          : (zone.currentOccupancy && zone.capacity
              ? Math.round((zone.currentOccupancy / zone.capacity) * 100)
              : 0);
        return {
          id: zone.id, // backend id, e.g., 'zone_a'
          name: zone.name || zone.id, // display name, e.g., 'Main Hall'
          status: zone.status || 'Normal',
          incidents: zoneIncidentCounts[zone.id] || 0,
          crowd: crowdDensity,
          camera: zone.cameras?.length > 0 ? "Online" : "Offline"
        };
      }));
      // If selectedZone is not in the new zoneFeeds, default to the first zone's id
      if (!zones.find(z => z.id === selectedZone) && zones.length > 0) {
        setSelectedZone(zones[0].id);
      }

      // Fetch emergency contacts
      let contacts = await api.getEmergencyContacts();
      if (!Array.isArray(contacts) && contacts && Array.isArray(contacts.emergency_contacts)) {
        contacts = contacts.emergency_contacts;
      } else if (!Array.isArray(contacts)) {
        contacts = [];
      }
      setEmergencyContacts(contacts.map(contact => ({
        service: contact.service || contact.name,
        number: contact.phone || contact.contact,
        status: contact.status || 'Available',
        responseTime: contact.responseTime || "3-5 min"
      })));

      // Fetch system analytics for additional data
      // const systemResponse = await systemAPI.getAnalytics()
      // if (systemResponse.success) {
      //   const analytics = systemResponse.data || {}
      //   setDashboardData(prev => ({
      //     ...prev,
      //     crowdDensity: analytics.crowdDensity || 0,
      //     weatherCondition: analytics.weatherCondition || "Clear",
      //     temperature: analytics.temperature || "24°C",
      //     windSpeed: analytics.windSpeed || "12 km/h",
      //   }))
      // }

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

  const handleDispatchResponder = (teamName) => {
    const team = responderTeams.find(t => t.name === teamName);
    setDispatchTeam(team);
    setDispatchModalOpen(true);
  };

  // Add a handler to open DispatchModal from Action Center
  const handleOpenDispatchModal = () => {
    setDispatchTeam(null); // No team preselected
    setDispatchModalOpen(true);
  };

  // Handler for sending alert (replace with API call as needed)
  const handleSendAlert = async (alertData) => {
    try {
      const res = await api.sendAlert(alertData);
      if (res.success) {
        alert('Alert sent and logged!');
      } else {
        alert(res.error || 'Failed to send alert.');
      }
    } catch (err) {
      alert('Failed to send alert: ' + (err && err.message ? err.message : 'Unknown error'));
    }
  };

  const handleOpenAIModal = async () => {
    setAIModalOpen(true);
    setAISummary("");
    setAIActions([]);
    setAIResources([]);
    setAIError("");
    setLoadingSummary(true);
    setLoadingResources(true);
    setLoadingActions(true);
    // Fetch each section in parallel, update as each returns
    api.getAISummary().then(res => {
      if (res.success) setAISummary(res.summary);
      else setAIError(res.error || 'Failed to get AI summary.');
      setLoadingSummary(false);
    }).catch(err => {
      setAIError('Failed to get AI summary: ' + (err && err.message ? err.message : 'Unknown error'));
      setLoadingSummary(false);
    });
    api.getAIResourceRecommendations().then(res => {
      if (res.success) setAIResources(res.resourceRecommendations);
      else setAIError(res.error || 'Failed to get resource recommendations.');
      setLoadingResources(false);
    }).catch(err => {
      setAIError('Failed to get resource recommendations: ' + (err && err.message ? err.message : 'Unknown error'));
      setLoadingResources(false);
    });
    api.getAICommandActions().then(res => {
      if (res.success) setAIActions(res.actions);
      else setAIError(res.error || 'Failed to get AI actions.');
      setLoadingActions(false);
    }).catch(err => {
      setAIError('Failed to get AI actions: ' + (err && err.message ? err.message : 'Unknown error'));
      setLoadingActions(false);
    });
  };

  const handleAIAction = async (action, idx, showToastCb) => {
    try {
      if (action.type === "dispatch_responder") {
        const res = await api.dispatchResponder({
          responderId: action.parameters.responderId,
          zoneId: action.parameters.zoneId,
          notes: action.parameters.notes || "AI Command Center dispatch"
        });
        if (res.success) {
          (showToastCb || toast)("Responder dispatched successfully!", "success");
        } else {
          (showToastCb || toast)(res.error || "Failed to dispatch responder.", "error");
        }
      } else if (action.type === "send_alert") {
        const res = await api.sendAlert({
          target: action.parameters.target,
          alertType: action.parameters.alertType,
          message: action.parameters.message,
          language: action.parameters.language || "en"
        });
        if (res.success) {
          (showToastCb || toast)("Alert sent successfully!", "success");
        } else {
          (showToastCb || toast)(res.error || "Failed to send alert.", "error");
        }
      } else if (action.type === "lockdown_zone") {
        // TODO: Implement real lockdown API call
        (showToastCb || toast)(`Lockdown triggered for zone ${action.parameters.zoneId}.`, "success");
      } else {
        (showToastCb || toast)(`Action type '${action.type}' is not yet implemented.`, "error");
      }
    } catch (err) {
      (showToastCb || toast)("Failed to execute action: " + (err && err.message ? err.message : "Unknown error"), "error");
    }
    // Do not close modal after execution
  };

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
        {/* Command Center Dispatch Button */}
        <div className="flex justify-end mb-4">
          <button
            className="px-6 py-3 rounded-xl bg-blue-700 text-white font-bold text-lg shadow-lg hover:bg-blue-800 transition"
            onClick={handleOpenDispatchModal}
          >
            + Dispatch Team
          </button>
        </div>
        {/* Timestamp Test Component */}
        {/* <TimestampTest /> */}

        {/* Header */}
        <DashboardHeader dashboardData={dashboardData} />

        {/* Action Center (moved up) */}
        <ActionCenter
          onDispatchTeam={handleOpenDispatchModal}
          onSendAlert={() => setSendAlertModalOpen(true)}
          onAIAnalysis={handleOpenAIModal}
        />
        <SendAlertModal
          open={sendAlertModalOpen}
          onClose={() => setSendAlertModalOpen(false)}
          zones={zoneFeeds}
          teams={responderTeams}
          onSendAlert={handleSendAlert}
        />

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
            currentTime={new Date()}
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

        {/* Emergency Contacts */}
        <EmergencyContacts 
          emergencyContacts={emergencyContacts}
          handleEmergencyCall={handleEmergencyCall}
        />

        {/* --- Crowd Forecast Analytics Section --- */}
        <Card sx={{ my: 4, boxShadow: 3, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" color="primary" gutterBottom>
              Crowd Forecast Analytics
            </Typography>
            <Box sx={{ my: 2 }}>
              <FormControl fullWidth>
                <InputLabel id="zone-forecast-select-label">Select Zone</InputLabel>
                <Select
                  labelId="zone-forecast-select-label"
                  value={selectedZone}
                  label="Select Zone"
                  onChange={e => setSelectedZone(e.target.value)}
                >
                  {zoneFeeds && zoneFeeds.length > 0
                    ? zoneFeeds.map(zone => (
                        <MenuItem key={zone.id} value={zone.id}>{zone.name || zone.id}</MenuItem>
                      ))
                    : null}
                </Select>
              </FormControl>
            </Box>
            {selectedZone && <CrowdForecastChart zoneId={selectedZone} />}
          </CardContent>
        </Card>
        <DispatchModal
          open={dispatchModalOpen}
          onClose={() => setDispatchModalOpen(false)}
          team={dispatchTeam}
          responders={allResponders}
          incidents={incidents}
          zones={zoneFeeds}
          onDispatch={async ({ responderId, incidentId, notes }) => {
            try {
              const res = await api.dispatchResponder({ responderId, incidentId, notes });
              if (res.success || res.status === 'success') {
                alert('Responder dispatched successfully!');
              } else {
                alert(res.error || 'Failed to dispatch responder.');
              }
            } catch {
              alert('Failed to dispatch responder.');
            }
          }}
        />
        <AICommandModal
          open={aiModalOpen}
          onClose={() => setAIModalOpen(false)}
          summary={aiSummary}
          actions={aiActions}
          resources={aiResources}
          loadingSummary={loadingSummary}
          loadingResources={loadingResources}
          loadingActions={loadingActions}
          error={aiError}
          onAction={handleAIAction}
          showToast={toast}
        />
      </div>
    </div>
  )
}
