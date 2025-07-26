import React, { useEffect, useState } from 'react';
import { api } from '../../services/adkApi';
import { Card, CardContent, Typography, CircularProgress, Alert } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

const SAFE_THRESHOLD = 0.8; // 80% of capacity

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const themeColors = {
  current: '#1976d2', // primary
  history: '#90caf9', // light primary
  forecast: '#ff9800', // orange
  alert: '#d32f2f', // error
};

export default function CrowdForecastChart({ zoneId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [zone, setZone] = useState(null);
  const [history, setHistory] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');
    setAlert(null);
    async function fetchData() {
      try {
        // Fetch zone data
        const zoneRes = await api.getZoneById(zoneId);
        if (!zoneRes || (!zoneRes.success && !zoneRes.id)) throw new Error('Failed to fetch zone');
        if (!isMounted) return;
        setZone(zoneRes.data || zoneRes.zone || zoneRes || {});
        // Fetch crowd history (placeholder)
        setHistory([]);
        // Fetch crowd forecast for next 12 hours
        const now = new Date();
        const forecastResults = [];
        for (let i = 1; i <= 12; i++) {
          const future = new Date(now.getTime() + i * 60 * 60 * 1000);
          // Format timestamp: YYYY-MM-DD HH:MM:SS+0000
          const pad = n => n.toString().padStart(2, '0');
          const ts = `${future.getFullYear()}-${pad(future.getMonth() + 1)}-${pad(future.getDate())} ${pad(future.getHours())}:${pad(future.getMinutes())}:${pad(future.getSeconds())}+0000`;
          const payload = {
            timestamp: ts,
            zoneId,
            day_of_week: future.toLocaleString('en-US', { weekday: 'long' }),
            hour_of_day: String(future.getHours()),
            lag_peopleCount_1: String(zoneRes.data?.lastPersonCount || 0),
            rolling_avg_5min: zoneRes.data?.lastRollingAvg || 0,
            crowdDensity: zoneRes.data?.lastCrowdDensity || 'moderate'
          };
          try {
            const data = await api.predictCrowd(payload);
            let predictionValue = data.prediction;
            if (Array.isArray(predictionValue)) {
              predictionValue = predictionValue[0];
            }
            if (predictionValue && typeof predictionValue === 'object' && 'value' in predictionValue) {
              predictionValue = predictionValue.value;
            }
            forecastResults.push({
              type: 'forecast',
              timestamp: future,
              peopleCount: predictionValue,
              crowdDensity: payload.crowdDensity
            });
          } catch {
            // Optionally handle per-request errors
          }
        }
        if (isMounted) setForecast(forecastResults);
        setLoading(false);
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    }
    fetchData();
    return () => { isMounted = false; };
  }, [zoneId]);

  // Prepare chart data
  const chartData = [
    ...history.map(h => ({
      type: 'history',
      timestamp: h.timestamp ? new Date(h.timestamp) : null,
      peopleCount: h.peopleCount,
      crowdDensity: h.crowdDensity,
    })),
    ...forecast.map(f => ({
      type: 'forecast',
      timestamp: f.timestamp ? new Date(f.timestamp) : null,
      peopleCount: f.prediction?.peopleCount || f.peopleCount,
      crowdDensity: f.crowdDensity,
    })),
  ].sort((a, b) => a.timestamp - b.timestamp);

  // Alert if any forecast exceeds safe threshold
  useEffect(() => {
    if (!zone || !zone.capacity || forecast.length === 0) return;
    const risky = forecast.find(f => (f.prediction?.peopleCount || f.peopleCount) > SAFE_THRESHOLD * zone.capacity);
    if (risky) {
      setAlert(`⚠️ Forecasted crowd exceeds safe limit (${SAFE_THRESHOLD * 100}% of capacity) at ${formatTime(risky.timestamp)}!`);
    } else {
      setAlert(null);
    }
  }, [forecast, zone]);

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!zone) return <Alert severity="info">Select a zone to view crowd data.</Alert>;

  return (
    <Card sx={{ my: 2, boxShadow: 3, borderRadius: 3 }}>
      <CardContent>
        {/* <Typography variant="h6" color="primary" gutterBottom>
          Crowd Analytics for {zone.name || zoneId}
        </Typography> */}
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Capacity: {zone.capacity || 'N/A'} | Current: {zone.lastPersonCount || 'N/A'} ({zone.lastCrowdDensity || 'N/A'})
        </Typography>
        {alert && <Alert severity="warning" sx={{ my: 2 }}>{alert}</Alert>}
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" tickFormatter={formatTime} minTickGap={32} />
            <YAxis allowDecimals={false} label={{ value: 'People', angle: -90, position: 'insideLeft' }} />
            <Tooltip labelFormatter={formatTime} formatter={(v, n) => [v, n === 'peopleCount' ? 'People' : n]} />
            <Legend />
            <Line type="monotone" dataKey="peopleCount" stroke={themeColors.history} name="History" dot={false} isAnimationActive={false}
              data={chartData.filter(d => d.type === 'history')} />
            <Line type="monotone" dataKey="peopleCount" stroke={themeColors.forecast} name="Forecast" strokeDasharray="5 5" dot={true} isAnimationActive={false}
              data={chartData.filter(d => d.type === 'forecast')} />
            {zone.capacity && <ReferenceLine y={zone.capacity} stroke={themeColors.current} strokeDasharray="2 2" label="Capacity" />}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 