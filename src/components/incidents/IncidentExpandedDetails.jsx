import { Clock, Target, Thermometer, Download, FileText } from "lucide-react"

export default function IncidentExpandedDetails({ incident }) {
  return (
    <div className="border-t border-gray-200 bg-gray-50/50 p-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Timeline */}
        {incident.timeline && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-blue-500" />
              Timeline
            </h4>
            <div className="space-y-2">
              {incident.timeline.map((event, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{event.time}</div>
                    <div className="text-sm text-gray-600">{event.event}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Equipment */}
        {incident.equipment && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Target className="w-4 h-4 mr-2 text-green-500" />
              Equipment
            </h4>
            <div className="space-y-2">
              {incident.equipment.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Environmental Data */}
        {incident.environmentalData && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Thermometer className="w-4 h-4 mr-2 text-orange-500" />
              Environmental
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Temperature:</span>
                <span className="font-medium">{incident.environmentalData.temperature}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Wind Speed:</span>
                <span className="font-medium">{incident.environmentalData.windSpeed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Visibility:</span>
                <span className="font-medium">{incident.environmentalData.visibility}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Air Quality:</span>
                <span className="font-medium">{incident.environmentalData.airQuality}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Additional Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
              <Download className="w-4 h-4 mr-1" />
              Export Report
            </button>
            <button className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
              <FileText className="w-4 h-4 mr-1" />
              Generate Summary
            </button>
          </div>
          <div className="text-xs text-gray-500">
            Last updated: {new Date(incident.timestamp?.seconds * 1000).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  )
} 