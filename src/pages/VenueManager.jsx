import React from 'react';
import VenueForm from '../components/VenueForm';

export default function VenueManager() {
  const handleVenueSubmit = (formData) => {
    // For now, just log the form data keys
    alert('Venue form submitted! (see console)');
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }
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
      </div>
    </div>
  );
} 