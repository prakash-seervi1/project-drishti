import React, { useEffect, useState } from 'react';
import HistoricalReports from '../components/reports/HistoricalReports';
import ConfidenceReport from '../components/reports/ConfidenceReport';
import IncidentTypeBreakdown from '../components/reports/IncidentTypeBreakdown';
import { Typography, Card, CardContent } from '@mui/material';
import { api } from '../services/adkApi';

export default function Reports() {
  const [incidents, setIncidents] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [venues, setVenues] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        // 1. All incident reports (flat)
        const allIncidentsRes = await api.getAllIncidentReports();
        const allIncidents = allIncidentsRes.incidents || [];
        setIncidents(allIncidents);
        // 2. Statistics
        const statsRes = await api.getIncidentStatistics();
        setStatistics(statsRes);
        // 3. Fetch unique venues
        const uniqueVenueIds = [...new Set(allIncidents.map(i => i.venue_id).filter(Boolean))];
        const venueData = {};
        await Promise.all(uniqueVenueIds.map(async (venueId) => {
          try {
            const venue = await api.getVenueById(venueId);
            venueData[venueId] = venue;
          } catch {
            venueData[venueId] = { eventName: venueId };
          }
        }));
        setVenues(venueData);
      } catch {
        setIncidents([]);
        setStatistics(null);
        setVenues({});
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  // Group incidents by venue
  const incidentsByVenue = incidents.reduce((acc, inc) => {
    if (!inc.venue_id) return acc;
    if (!acc[inc.venue_id]) acc[inc.venue_id] = [];
    acc[inc.venue_id].push(inc);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <Typography variant="h4" className="mb-6 font-bold">Reports</Typography>
      {loading ? (
        <Typography>Loading reports...</Typography>
      ) : (
        <>
          {Object.keys(incidentsByVenue).map(venueId => (
            <Card className="mb-8" key={venueId}>
              <CardContent>
                <Typography variant="h5" className="mb-2 font-semibold">
                  Venue: {venues[venueId]?.eventName || venueId}
                </Typography>
                <HistoricalReports incidents={incidentsByVenue[venueId]} />
                <ConfidenceReport incidents={incidentsByVenue[venueId]} statistics={statistics} />
                <IncidentTypeBreakdown incidents={incidentsByVenue[venueId]} />
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  );
} 