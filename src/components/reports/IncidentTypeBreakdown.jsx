import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = [
  '#6366f1', '#f59e42', '#10b981', '#ef4444', '#3b82f6', '#fbbf24', '#a21caf'
];
const INCIDENT_TYPE_LABELS = {
  fire: 'Fire',
  medical: 'Medical',
  security: 'Security',
  panic: 'Panic',
  crowd: 'Crowd',
  environmental: 'Environmental',
  technical: 'Technical',
};

function getTypeData(incidents) {
  const typeMap = {};
  incidents.forEach(inc => {
    typeMap[inc.type] = (typeMap[inc.type] || 0) + 1;
  });
  return Object.entries(typeMap).map(([type, count]) => ({ type, count }));
}

export default function IncidentTypeBreakdown({ incidents = [] }) {
  const data = getTypeData(incidents);
  return (
    <Card className="mb-6">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Incident Type Breakdown
        </Typography>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="type"
              cx="50%"
              cy="50%"
              outerRadius={70}
              label={entry => INCIDENT_TYPE_LABELS[entry.type] || entry.type}
            >
              {data.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v, n, p) => [`${v}`, INCIDENT_TYPE_LABELS[p.payload.type] || p.payload.type]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 