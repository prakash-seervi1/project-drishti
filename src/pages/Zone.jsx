import { useEffect, useState } from "react";
import { api } from "../services/adkApi";
import { Eye, Users, AlertTriangle, MapPin } from "lucide-react";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function Zone() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getZones()
      .then(res => {
        let data = Array.isArray(res) ? res : (res.zones || res.data || []);
        setZones(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch zones');
        setLoading(false);
      });
  }, []);

  // Group zones by venueId
  const zonesByVenue = zones.reduce((acc, zone) => {
    const venueId = zone.venueName || zone.venueId || 'No Venue';
    if (!acc[venueId]) acc[venueId] = [];
    acc[venueId].push(zone);
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <Eye className="w-7 h-7 mr-2 text-purple-600" />
        Zones
      </h1>
      {loading ? (
        <Skeleton count={6} height={120} className="mb-4" />
      ) : error ? (
        <div className="text-red-600 font-semibold">{error}</div>
      ) : (
        <div className="space-y-10">
          {Object.entries(zonesByVenue).map(([venueId, venueZones]) => (
            <div key={venueId}>
              <h2 className="text-xl font-bold mb-4 text-blue-800">Venue: {venueId}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {venueZones.map(zone => (
                  <div key={zone.id || zone.zone} className="bg-white/80 rounded-xl shadow border border-gray-200 p-6 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-lg text-gray-900 flex items-center">
                        <MapPin className="w-5 h-5 mr-1 text-blue-500" />
                        {zone.name || zone.zone}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        zone.status === "critical" ? "bg-red-100 text-red-800" :
                        zone.status === "active" ? "bg-yellow-100 text-yellow-800" :
                        zone.status === "normal" ? "bg-green-100 text-green-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {zone.status ? zone.status.charAt(0).toUpperCase() + zone.status.slice(1) : "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-6 mb-2 mt-2">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4 text-purple-600" />
                        <span className="font-medium">{zone.currentOccupancy ?? zone.capacity?.currentOccupancy ?? 'N/A'}</span>
                        <span className="text-xs text-gray-500">/ {zone.capacity ?? zone.capacity?.maxOccupancy ?? 'N/A'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        <span className="font-medium">Crowd Density:</span>
                        <span className="text-sm text-orange-700 font-bold">{
                          zone.currentOccupancy != null && (zone.capacity || zone.capacity?.maxOccupancy)
                            ? `${Math.round((zone.currentOccupancy / (zone.capacity || zone.capacity?.maxOccupancy)) * 100)}%`
                            : zone.crowdDensity != null ? `${zone.crowdDensity}%` : 'N/A'
                        }</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 mb-2">Incidents: {zone.incidents ?? 0}</div>
                    {zone.lastUpdate && (
                      <div className="text-xs text-gray-400">Last update: {new Date(zone.lastUpdate).toLocaleString()}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 