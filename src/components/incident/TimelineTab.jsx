import { Send } from "lucide-react"
import TimelineItem from "./TimelineItem"

export default function TimelineTab({ notes, newNote, setNewNote, addNote, timeAgo }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Incident Timeline</h3>
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add update or note..."
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <button
            onClick={addNote}
            disabled={!newNote.trim()}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            <Send className="w-4 h-4 mr-2" />
            Add Note
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {notes?.notes?.map((note) => (
          <TimelineItem key={note.id} note={note} timeAgo={timeAgo} />
        ))}
      </div>
    </div>
  )
} 