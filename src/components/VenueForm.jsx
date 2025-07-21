import React, { useState } from 'react';
import { uploadFileToGCS } from '../utils/upload';
import { api } from '../services/adkApi';

const initialState = {
  eventName: '',
  venueType: 'Ground',
  venueArea: '',
  layoutImage: null,
  entryGates: '',
  crowdType: 'Standing',
  autoZone: true,
};

const venueTypes = ['Ground', 'Stadium', 'Roadshow', 'Other'];
const crowdTypes = ['Standing', 'Seating'];

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export default function VenueForm({ onSubmit }) {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setForm((f) => ({ ...f, [name]: checked }));
    } else if (type === 'file') {
      setForm((f) => ({ ...f, [name]: files[0] }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.eventName.trim()) newErrors.eventName = 'Event name required';
    if (!form.venueArea || isNaN(form.venueArea) || Number(form.venueArea) <= 0) newErrors.venueArea = 'Valid area required';
    if (!form.entryGates || isNaN(form.entryGates) || Number(form.entryGates) <= 0) newErrors.entryGates = 'Valid number of gates required';
    return newErrors;
  };

  // Upload image to GCS using presigned URL (using api service)
  const uploadImage = async () => {
    if (!form.layoutImage) return '';
    const presigned = await api.getSignedUploadUrl({
      filename: form.layoutImage.name,
      mimetype: form.layoutImage.type,
      zone: 'venue',
      type: 'venue',
      notes: '',
      bucket: 'project-drishti-central1-bucket-venues',
    });
    await fetch(presigned.url, {
      method: 'PUT',
      headers: { 'Content-Type': form.layoutImage.type },
      body: form.layoutImage,
    });
    return `https://storage.googleapis.com/project-drishti-central1-bucket-venues/${presigned.objectPath}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setSubmitting(true);
    try {
      let imageUrl = null;
      if (form.layoutImage) {
        imageUrl = await uploadImage();
      }
      // Prepare venue data
      const venueData = {
        eventName: form.eventName,
        venueType: form.venueType,
        venueArea: Number(form.venueArea),
        entryGates: Number(form.entryGates),
        crowdType: form.crowdType,
        autoZone: form.autoZone,
        imageUrl,
        zones: [], // For manual mode, can add later
      };
      // Call backend API using api service
      const result = await api.createVenue(venueData);
      if (onSubmit) onSubmit(result);
      else {
        alert('Venue created!');
        console.log('Venue created:', result);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error creating venue');
    }
    setSubmitting(false);
  };

  return (
    <form className="max-w-lg mx-auto p-6 bg-white rounded shadow" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-4">Create Event / Venue</h2>
      {errorMsg && <div className="text-red-600 mb-2">{errorMsg}</div>}
      <div className="mb-4">
        <label className="block font-medium mb-1">Event Name *</label>
        <input
          type="text"
          name="eventName"
          value={form.eventName}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />
        {errors.eventName && <div className="text-red-500 text-sm">{errors.eventName}</div>}
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">Venue Type *</label>
        <select
          name="venueType"
          value={form.venueType}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        >
          {venueTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">Venue Area (sq. ft.) *</label>
        <input
          type="number"
          name="venueArea"
          value={form.venueArea}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          min="1"
        />
        {errors.venueArea && <div className="text-red-500 text-sm">{errors.venueArea}</div>}
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">Upload Layout Image (optional)</label>
        <input
          type="file"
          name="layoutImage"
          accept="image/*"
          onChange={handleChange}
          className="w-full"
        />
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">Number of Entry Gates *</label>
        <input
          type="number"
          name="entryGates"
          value={form.entryGates}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          min="1"
        />
        {errors.entryGates && <div className="text-red-500 text-sm">{errors.entryGates}</div>}
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">Crowd Type *</label>
        <div className="flex gap-4">
          {crowdTypes.map((type) => (
            <label key={type} className="flex items-center gap-1">
              <input
                type="radio"
                name="crowdType"
                value={type}
                checked={form.crowdType === type}
                onChange={handleChange}
              />
              {type}
            </label>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="autoZone"
            checked={form.autoZone}
            onChange={handleChange}
          />
          Auto-generate Zones
        </label>
      </div>
      {/* Manual zone UI can go here if autoZone is false (future) */}
      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-2 rounded font-semibold disabled:opacity-50"
        disabled={submitting}
      >
        {submitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
} 