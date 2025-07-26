import React from 'react';
import { Card, CardContent, Typography, LinearProgress, Box } from '@mui/material';

function calculateConfidence(incidents, statistics) {
  if (statistics) {
    // Use backend-provided statistics if available
    const percent = Math.round(
      (statistics.resolution_rate * 0.5 + (statistics.avg_severity / 5) * 0.3 + (statistics.avg_feedback / 5) * 0.2) * 100
    );
    return {
      percent,
      breakdown: {
        resolutionRate: (statistics.resolution_rate * 100).toFixed(1) + '%',
        avgSeverity: statistics.avg_severity.toFixed(2),
        avgFeedback: statistics.avg_feedback.toFixed(2)
      }
    };
  }
  // Fallback: calculate from incidents
  if (!incidents.length) return { percent: 0, breakdown: {} };
  const resolved = incidents.filter(i => i.resolved).length;
  const resolutionRate = resolved / incidents.length;
  const resolvedSeverities = incidents.filter(i => i.resolved).map(i => i.severity || 0);
  const avgSeverity = resolvedSeverities.length ? resolvedSeverities.reduce((a, b) => a + b, 0) / resolvedSeverities.length : 0;
  const feedbacks = incidents.map(i => typeof i.feedback_rating === 'number' ? i.feedback_rating : 4);
  const avgFeedback = feedbacks.length ? feedbacks.reduce((a, b) => a + b, 0) / feedbacks.length : 4.2;
  const percent = Math.round(
    (resolutionRate * 0.5 + (avgSeverity / 5) * 0.3 + (avgFeedback / 5) * 0.2) * 100
  );
  return {
    percent,
    breakdown: {
      resolutionRate: (resolutionRate * 100).toFixed(1) + '%',
      avgSeverity: avgSeverity.toFixed(2),
      avgFeedback: avgFeedback.toFixed(2)
    }
  };
}

export default function ConfidenceReport({ incidents = [], statistics = null }) {
  const { percent, breakdown } = calculateConfidence(incidents, statistics);
  return (
    <Card className="mb-6">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Confidence Report
        </Typography>
        <Typography variant="h2" color="primary" gutterBottom>
          {percent}%
        </Typography>
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress variant="determinate" value={percent} sx={{ height: 10, borderRadius: 5 }} />
        </Box>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          This confidence score is based on incident resolution rate, average severity resolved, and responder/admin feedback.
        </Typography>
        <ul className="text-sm text-gray-600 mt-2">
          <li>Resolution Rate: <b>{breakdown.resolutionRate}</b></li>
          <li>Avg. Severity Resolved: <b>{breakdown.avgSeverity}</b></li>
          <li>Avg. Feedback Rating: <b>{breakdown.avgFeedback} / 5</b></li>
        </ul>
      </CardContent>
    </Card>
  );
} 