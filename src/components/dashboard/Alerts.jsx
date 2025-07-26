// TODO: Rename this file to Alerts.jsx
import React, { useState, useEffect } from 'react';
import { Siren } from 'lucide-react'
import { formatTimestamp } from '../../utils/timestamp'
import { Link } from 'react-router-dom'
import SendAlertModal from './SendAlertModal'
import { api } from '../../services/adkApi'

// Map integer severity to color classes
const severityColors = {
  5: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    dot: 'bg-red-500',
    text: 'text-red-900',
    badge: 'bg-red-100 text-red-800',
    time: 'text-red-600',
    severity: 'text-red-800',
  },
  4: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
    text: 'text-orange-900',
    badge: 'bg-orange-100 text-orange-800',
    time: 'text-orange-600',
    severity: 'text-orange-800',
  },
  3: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    dot: 'bg-yellow-400',
    text: 'text-yellow-900',
    badge: 'bg-yellow-100 text-yellow-800',
    time: 'text-yellow-600',
    severity: 'text-yellow-800',
  },
  2: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    dot: 'bg-green-500',
    text: 'text-green-900',
    badge: 'bg-green-100 text-green-800',
    time: 'text-green-600',
    severity: 'text-green-800',
  },
  1: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    text: 'text-blue-900',
    badge: 'bg-blue-100 text-blue-800',
    time: 'text-blue-600',
    severity: 'text-blue-800',
  },
  default: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    dot: 'bg-gray-400',
    text: 'text-gray-900',
    badge: 'bg-gray-100 text-gray-800',
    time: 'text-gray-600',
    severity: 'text-gray-800',
  },
};

function getSeverityColor(severity) {
  const sev = Number(severity);
  return severityColors[sev] || severityColors.default;
}

export default function Alerts({ alerts, onSendAlert, zones: propZones }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [zones, setZones] = useState(Array.isArray(propZones) ? propZones : []);

  useEffect(() => {
    if (!Array.isArray(propZones)) {
      api.getZones().then(res => {
        if (res && Array.isArray(res.zones)) {
          setZones(res.zones);
        } else {
          setZones([]);
        }
      });
    } else {
      setZones(propZones);
    }
  }, [propZones]);

  const handleSendAlert = async (alertData) => {
    if (onSendAlert) await onSendAlert(alertData);
    setModalOpen(false);
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Siren className="w-6 h-6 mr-2 text-blue-500" />
          Alerts
        </h2>
        <div className="flex items-center space-x-2">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
            {alerts.length} Active
          </span>
          <button
            className="ml-2 px-3 py-1 rounded bg-orange-600 text-white text-xs font-semibold hover:bg-orange-700 transition"
            onClick={() => setModalOpen(true)}
          >
            + Send Alert
          </button>
        </div>
      </div>
      <SendAlertModal open={modalOpen} onClose={() => setModalOpen(false)} zones={Array.isArray(zones) ? zones : []} onSendAlert={handleSendAlert} />
      <div className="space-y-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {alerts.map((alert) => {
          const color = getSeverityColor(alert.severity);
          let zoneDisplay = alert.zoneName || alert.zoneId || (alert.target && alert.target.startsWith('zone_') ? alert.target : null) || 'Unknown';
          let showTooltip = !alert.zoneName && (alert.zoneId || (alert.target && alert.target.startsWith('zone_')));
          return (
            <Link
              to={`/incident/${alert.id}`}
              key={alert.id}
              className="block transition rounded-lg hover:shadow-md"
              style={{ textDecoration: 'none' }}
            >
              <div className={`flex items-center justify-between p-3 ${color.bg} ${color.border} border rounded-lg`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 ${color.dot} rounded-full animate-pulse`}></div>
                  <div>
                    <div className={`font-medium ${color.text}`}>{alert.type}</div>
                    <div className="text-sm text-gray-700">
                      Zone: <span title={showTooltip ? 'Zone name not found, showing ID' : ''} style={showTooltip ? { fontStyle: 'italic', textDecoration: 'underline dotted' } : {}}>{zoneDisplay}</span>
                    </div>
                    <div className="text-xs text-gray-700 mt-1">Status: {alert.status}</div>
                    {alert.description && (
                      <div className="text-xs text-gray-800 mt-1">{alert.description}</div>
                    )}
                    {alert.message && !alert.description && (
                      <div className="text-xs text-gray-800 mt-1">{alert.message}</div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs ${color.time}`}>{formatTimestamp(alert.time || alert.timestamp)}</div>
                  <div className={`text-xs font-medium ${color.badge}`}>{alert.severity}</div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
} 