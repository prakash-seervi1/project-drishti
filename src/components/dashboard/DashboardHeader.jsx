import { Shield, Thermometer, Wind, AlertTriangle, Activity, CheckCircle, UserCheck, Map, Users } from 'lucide-react'
import StatCard from './StatCard'
import { Link } from 'react-router-dom';

export default function DashboardHeader({ dashboardData }) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Shield className="w-8 h-8 mr-3 text-blue-600" />
            Command Center Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Real-time event safety monitoring and response coordination</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link to="/reports" className="px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100 transition-colors shadow">
            Reports
          </Link>
          <div className="text-right">
            <div className="text-sm text-gray-500">Weather</div>
            <div className="flex items-center space-x-2">
              <Thermometer className="w-4 h-4 text-orange-500" />
              <span className="font-medium">{dashboardData.temperature}</span>
              <Wind className="w-4 h-4 text-blue-500" />
              <span className="text-sm">{dashboardData.windSpeed}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <StatCard
          title="Total Incidents"
          value={dashboardData.totalIncidents}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="bg-red-500"
          // trend="+5"
        />
        <StatCard
          title="Active Now"
          value={dashboardData.activeIncidents}
          icon={<Activity className="w-5 h-5" />}
          color="bg-orange-500"
          // trend="+2"
        />
        <StatCard
          title="Resolved Today"
          value={dashboardData.resolvedToday}
          icon={<CheckCircle className="w-5 h-5" />}
          color="bg-green-500"
          // trend="+8"
        />
        <StatCard
          title="Available Teams"
          value={`${dashboardData.availableResponders}/${dashboardData.totalResponders}`}
          icon={<UserCheck className="w-5 h-5" />}
          color="bg-blue-500"
          // trend="0"
        />
        <StatCard
          title="Zones Monitored"
          value={dashboardData.zonesMonitored}
          icon={<Map className="w-5 h-5" />}
          color="bg-purple-500"
          // trend="0"
        />
        <StatCard
          title="Crowd Density"
          value={`${dashboardData.crowdDensity}%`}
          icon={<Users className="w-5 h-5" />}
          color="bg-indigo-500"
          trend="+12"
        />
      </div>
    </div>
  )
} 