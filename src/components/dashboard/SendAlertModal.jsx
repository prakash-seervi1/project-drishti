import React, { useState } from "react";
import { createPortal } from "react-dom";
import { api } from '../../services/adkApi';

const ALERT_TYPES = [
  { value: "general", label: "General" },
  { value: "crowd", label: "Crowd" },
  { value: "medical", label: "Medical" },
  { value: "fire", label: "Fire" },
  { value: "security", label: "Security" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "kn", label: "Kannada" },
  // Add more as needed
];

export default function SendAlertModal({ open, onClose, zones, onSendAlert }) {
  const [alertType, setAlertType] = useState("general");
  const [zoneId, setZoneId] = useState("");
  const [language, setLanguage] = useState("en");
  const [message, setMessage] = useState("");
  const [generating, setGenerating] = useState(false);
  const [audioBase64, setAudioBase64] = useState("");
  const [audioLoading, setAudioLoading] = useState(false);
  const [severity, setSeverity] = useState(3); // default to medium

  if (!open) return null;

  const handleGenerateAI = async () => {
    setGenerating(true);
    try {
      const res = await api.generateAlertMessage({ alertType, zoneId, language, severity });
      if (res.success && res.message) {
        setMessage(res.message);
      } else {
        setMessage('Failed to generate message.');
      }
    } catch (err) {
      setMessage('Failed to generate message: ' + (err && err.message ? err.message : 'Unknown error'));
    }
    setGenerating(false);
  };

  const handleTTS = async () => {
    setAudioLoading(true);
    setAudioBase64("");
    try {
      const res = await api.textToSpeech({ text: message, language });
      if (res.success && res.audio_base64) {
        setAudioBase64(res.audio_base64);
      } else {
        setAudioBase64("");
        alert(res.error || 'Failed to generate audio.');
      }
    } catch (err) {
      setAudioBase64("");
      alert('Failed to generate audio: ' + (err && err.message ? err.message : 'Unknown error'));
    }
    setAudioLoading(false);
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4">Send Alert</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            onSendAlert({ alertType, zoneId, language, message, severity });
            onClose();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block font-medium mb-1">Alert Type</label>
            <select
              value={alertType}
              onChange={e => setAlertType(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            >
              {ALERT_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Severity</label>
            <select
              value={severity}
              onChange={e => setSeverity(Number(e.target.value))}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value={5}>5 - Critical</option>
              <option value={4}>4 - High</option>
              <option value={3}>3 - Medium</option>
              <option value={2}>2 - Low</option>
              <option value={1}>1 - Info</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Zone</label>
            <select
              value={zoneId}
              onChange={e => setZoneId(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Select Zone...</option>
              <option value="all">All Zones</option>
              {zones && zones.map(z => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Language</label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            >
              {LANGUAGES.map(lang => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1 flex items-center justify-between">
              <span>Message</span>
              <button
                type="button"
                className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50"
                onClick={handleGenerateAI}
                disabled={generating || !alertType || !zoneId || !language}
              >
                {generating ? 'Generating...' : 'Generate with AI'}
              </button>
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full border rounded px-3 py-2"
              rows={3}
              placeholder="Enter alert message..."
              required
            />
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <button
              type="button"
              className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700 hover:bg-orange-200 disabled:opacity-50"
              onClick={handleTTS}
              disabled={audioLoading || !message}
            >
              {audioLoading ? 'Converting...' : 'Convert to Audio'}
            </button>
            {audioBase64 && (
              <audio controls src={`data:audio/mp3;base64,${audioBase64}`} className="ml-2">
                Your browser does not support the audio element.
              </audio>
            )}
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
              className="px-4 py-2 rounded bg-orange-600 text-white"
              disabled={!alertType || !zoneId || !language || !message}
            >
              Send Alert
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
} 