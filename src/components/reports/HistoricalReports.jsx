import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Incident type and severity mappings
const INCIDENT_TYPES = [
  'fire', 'medical', 'security', 'panic', 'crowd', 'environmental', 'technical'
];
const SEVERITY_LABELS = {
  5: 'Critical',
  4: 'High',
  3: 'Medium',
  2: 'Low',
  1: 'Very Low',
};

function aggregateIncidents(incidents) {
  // Returns array of { type, count, avgSeverity }
  const typeMap = {};
  incidents.forEach(inc => {
    if (!typeMap[inc.type]) typeMap[inc.type] = { type: inc.type, count: 0, totalSeverity: 0 };
    typeMap[inc.type].count++;
    typeMap[inc.type].totalSeverity += inc.severity;
  });
  return Object.values(typeMap).map(t => ({
    ...t,
    avgSeverity: t.count ? (t.totalSeverity / t.count).toFixed(1) : 0
  }));
}

export default function HistoricalReports({ incidents = [] }) {
  const data = aggregateIncidents(incidents);
  return (
    <Card className="mb-6">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Historical Incident Reports
        </Typography>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
            <XAxis dataKey="type" />
            <YAxis allowDecimals={false} />
            <Tooltip formatter={(v, n) => n === 'avgSeverity' ? SEVERITY_LABELS[Math.round(v)] || v : v} />
            <Legend />
            <Bar dataKey="count" fill="#1976d2" name="Incident Count" />
            <Bar dataKey="avgSeverity" fill="#f59e42" name="Avg Severity" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 