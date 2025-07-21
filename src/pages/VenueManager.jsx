import React, { useState } from 'react';
import VenueForm from '../components/VenueForm';

export default function VenueManager() {
  const [createdVenue, setCreatedVenue] = useState(null);

  const handleVenueSubmit = (result) => {
    setCreatedVenue(result);
    alert('Venue created!');
    console.log('Venue created:', result);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
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
            <h2 className="text-xl font-semibold mb-2">Created Zones</h2>
            <ul className="list-disc pl-6">
              {createdVenue.zones.map((zone, idx) => (
                <li key={zone.zoneId || idx}>
                  <strong>{zone.zoneId || `Zone ${idx + 1}`}</strong>: Area {zone.area}, Capacity {zone.capacity}, Risk: {zone.risk}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 