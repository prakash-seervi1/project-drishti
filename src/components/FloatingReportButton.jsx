import { AlertTriangle } from "lucide-react"

export default function FloatingReportButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center group"
      title="Report Incident"
    >
      <AlertTriangle className="w-6 h-6 group-hover:animate-pulse" />
    </button>
  )
}
