import { Phone, PhoneCall, MessageSquare } from 'lucide-react'

export default function EmergencyContacts({ emergencyContacts, handleEmergencyCall }) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <Phone className="w-6 h-6 mr-2 text-red-500" />
        Emergency Response Contacts
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {emergencyContacts.map((contact) => (
          <div key={contact.service} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-gray-900">{contact.service}</div>
              <div
                className={`w-2 h-2 rounded-full ${contact.status === "Available" ? "bg-green-500" : "bg-red-500"}`}
              ></div>
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-2">{contact.number}</div>
            <div className="text-sm text-gray-600 mb-3">ETA: {contact.responseTime}</div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEmergencyCall(contact.service, contact.number)}
                className="flex-1 flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                <PhoneCall className="w-4 h-4 mr-1" />
                Call
              </button>
              <button className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 