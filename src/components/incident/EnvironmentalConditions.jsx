import { Thermometer, Wind, Eye, Users } from "lucide-react"

export default function EnvironmentalConditions({ liveData }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Thermometer className="w-5 h-5 mr-2 text-orange-500" />
        Environmental Conditions
      </h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <Thermometer className="w-4 h-4 text-orange-500" />
          <span>Temperature: {liveData?.temperature}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Wind className="w-4 h-4 text-blue-500" />
          <span>Wind: {liveData?.windSpeed}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Eye className="w-4 h-4 text-gray-500" />
          <span>Visibility: {liveData?.visibility}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-purple-500" />
          <span>Crowd: {liveData?.crowdDensity}%</span>
        </div>
      </div>
    </div>
  )
} 