import { Activity, FileText } from "lucide-react"

export default function TimelineItem({ note, timeAgo }) {
  return (
    <div className="flex space-x-4">
      <div className="flex-shrink-0">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            note.type === "status_update" ? "bg-blue-100" : "bg-gray-100"
          }`}
        >
          {note.type === "status_update" ? (
            <Activity className="w-4 h-4 text-blue-600" />
          ) : (
            <FileText className="w-4 h-4 text-gray-600" />
          )}
        </div>
      </div>
      <div className="flex-1">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium text-gray-900">{note.author}</div>
            <div className="text-xs text-gray-500">
              {note.timestamp?.seconds ? timeAgo(note.timestamp) : "Just now"}
            </div>
          </div>
          <p className="text-gray-700">{note.content}</p>
        </div>
      </div>
    </div>
  )
} 