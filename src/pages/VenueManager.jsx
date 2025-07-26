import React, { useState } from 'react';
import VenueForm from '../components/VenueForm';
import toast, { Toaster } from 'react-hot-toast';

export default function VenueManager() {
  const [createdVenue, setCreatedVenue] = useState(null);

  const handleVenueSubmit = (result) => {
    setCreatedVenue(result);
    // Show toast based on autoZone
    if (result && result.zones && result.zones.length > 0) {
      const autoZone = result.zones.length > 0 && result.zones[0].zoneId && result.zones[0].name;
      if (autoZone) {
        toast.success('Venue created!');
      } else {
        toast.success('Venue zone blueprint created!');
      }
    } else {
      toast.success('Venue created!');
    }
    console.log('Venue created:', result);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <Toaster position="top-right" />
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <span className="inline-block w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
          </span>
          Venue & Event Manager
        </h1>
        <p className="mb-6 text-gray-600">Create and manage event venues, auto-generate safety zones, and plan crowd flow.</p>
        <VenueForm onSubmit={handleVenueSubmit} />
        {createdVenue && createdVenue.zones && createdVenue.zones.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Created Zones</h2>
            <div className="grid grid-cols-1 gap-4">
              {createdVenue.zones.map((zone, idx) => (
                <div key={zone.zoneId || idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg text-blue-800">{zone.name || zone.zoneId || `Zone ${idx + 1}`}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      zone.risk === 'overcrowding' ? 'bg-red-100 text-red-800' :
                      zone.risk === 'none' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {zone.risk ? zone.risk.charAt(0).toUpperCase() + zone.risk.slice(1) : 'Unknown'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                    <div><span className="font-medium">Area:</span> {zone.area}</div>
                    <div><span className="font-medium">Capacity:</span> {zone.capacity}</div>
                    <div><span className="font-medium">Assigned Gates:</span> {zone.assignedGates && zone.assignedGates.length > 0 ? zone.assignedGates.join(', ') : 'None'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 