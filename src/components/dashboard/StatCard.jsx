import { ArrowUp, ArrowDown } from 'lucide-react'

export default function StatCard({ title, value, icon, color, trend }) {
  const isPositive = trend.startsWith("+")
  const isNegative = trend.startsWith("-")

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center text-white`}>{icon}</div>
        <div
          className={`flex items-center text-xs px-2 py-1 rounded-full ${
            isPositive
              ? "bg-red-100 text-red-800"
              : isNegative
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
          }`}
        >
          {isPositive && <ArrowUp className="w-3 h-3 mr-1" />}
          {isNegative && <ArrowDown className="w-3 h-3 mr-1" />}
          {trend}
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  )
} 