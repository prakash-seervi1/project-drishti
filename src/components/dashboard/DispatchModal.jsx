import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function DispatchModal({ open, onClose, team, responders, onDispatch, incidents, zones }) {
  const [selectedResponder, setSelectedResponder] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedIncident, setSelectedIncident] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setSelectedResponder("");
    setSelectedZone("");
    setSelectedIncident("");
    setNotes("");
  }, [open, team]);

  if (!open) return null;
  const availableResponders = team
    ? responders.filter(r => r.type === team.name && (r.status === "available" || r.status === "ready"))
    : responders.filter(r => r.status === "available" || r.status === "ready");
  const filteredIncidents = selectedZone
    ? incidents.filter(i => i.zoneId === selectedZone)
    : [];

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4">Dispatch {team ? team.name : "Team"}</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            onDispatch({ responderId: selectedResponder, incidentId: selectedIncident, notes });
            onClose();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block font-medium mb-1">Select Responder</label>
            <select
              value={selectedResponder}
              onChange={e => setSelectedResponder(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Select...</option>
              {availableResponders.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          {zones && (
            <div>
              <label className="block font-medium mb-1">Select Zone</label>
              <select
                value={selectedZone}
                onChange={e => {
                  setSelectedZone(e.target.value);
                  setSelectedIncident(""); // Reset incident when zone changes
                }}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Select...</option>
                {zones.map(z => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
            </div>
          )}
          {selectedZone && (
            <div>
              <label className="block font-medium mb-1">Select Incident</label>
              <select
                value={selectedIncident}
                onChange={e => setSelectedIncident(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Select...</option>
                {filteredIncidents.map(i => (
                  <option key={i.id} value={i.id}>{i.type ? `${i.type} - ${i.description?.slice(0, 40)}` : i.description?.slice(0, 40) || i.id}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block font-medium mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full border rounded px-3 py-2"
              rows={3}
              placeholder="Add any special instructions..."
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white"
              disabled={!selectedResponder || !selectedZone || !selectedIncident}
            >
              Dispatch
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
} 