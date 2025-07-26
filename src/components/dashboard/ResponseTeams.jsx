import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react'
import DispatchModal from './DispatchModal'
import { api } from '../../services/adkApi'

export default function ResponseTeams({ responderTeams, handleDispatchResponder, onDispatchResponder }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [responders, setResponders] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [zones, setZones] = useState([]);

  useEffect(() => {
    if (modalOpen) {
      api.getResponders().then(r => {
        const arr = Array.isArray(r) ? r : (r.responders || []);
        setResponders(arr.filter(res => res.status === 'available' || res.status === 'ready'));
      });
      api.getIncidents().then(i => setIncidents(Array.isArray(i) ? i : (i.incidents || [])));
      api.getZones().then(z => setZones(Array.isArray(z) ? z : (z.zones || [])));
    }
  }, [modalOpen]);

  const handleDispatch = async (data) => {
    if (handleDispatchResponder) await handleDispatchResponder(data);
    if (onDispatchResponder) await onDispatchResponder(data);
    setModalOpen(false);
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Users className="w-6 h-6 mr-2 text-green-500" />
          Response Teams
        </h2>
        <button
          className="ml-2 px-3 py-1 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
          onClick={() => { setSelectedTeam(null); setModalOpen(true); }}
        >
          + Dispatch Team
        </button>
      </div>
      <DispatchModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        team={selectedTeam}
        responders={responders}
        incidents={incidents}
        zones={zones}
        onDispatch={handleDispatch}
      />
      <div className="space-y-3">
        {responderTeams.map((team) => (
          <div key={team.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">{team.name}</div>
              <div className="text-sm text-gray-600">
                {team.available}/{team.total} available
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  team.status === "Ready"
                    ? "bg-green-100 text-green-800"
                    : team.status === "Busy"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {team.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 