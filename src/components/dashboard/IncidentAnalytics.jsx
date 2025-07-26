import { BarChart2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

// Default color palette for incident types
const DEFAULT_COLORS = [
  '#6366f1', // indigo
  '#f59e42', // orange
  '#10b981', // green
  '#ef4444', // red
  '#3b82f6', // blue
  '#fbbf24', // yellow
  '#a21caf', // purple
  '#eab308', // gold
  '#0ea5e9', // sky
  '#f472b6', // pink
];

export default function IncidentAnalytics({ incidentTypes }) {
  // Assign a color to each type if not provided
  const coloredTypes = incidentTypes.map((incident, idx) => {
    // Accept both 'color' as a hex code or as a tailwind class, but prefer hex for recharts
    let color = incident.color;
    // If color is a tailwind class (e.g., 'bg-red-500'), map to a hex code from DEFAULT_COLORS
    if (!color || color.startsWith('bg-')) {
      color = DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
    }
    return { ...incident, color };
  });

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <BarChart2 className="w-6 h-6 mr-2 text-indigo-500" />
        Incident Analytics
      </h2>
      <div className="mb-6" style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={coloredTypes} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <XAxis dataKey="type" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: '#f3f4f6' }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {coloredTypes.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-4">
        {coloredTypes.map((incident) => (
          <div key={incident.type} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: incident.color }}></div>
              <span className="font-medium text-gray-900">{incident.type}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900">{incident.count}</span>
              <span
                className={`text-sm px-2 py-1 rounded-full ${
                  incident.trend.startsWith("+")
                    ? "bg-red-100 text-red-800"
                    : incident.trend.startsWith("-")
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {incident.trend}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 