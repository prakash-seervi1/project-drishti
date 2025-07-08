
import { MessageCircle, Sparkles } from "lucide-react"

export default function FloatingAIButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center group"
      title="AI Assistant"
    >
      <div className="relative">
        <MessageCircle className="w-6 h-6" />
        <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300 group-hover:animate-pulse" />
      </div>
    </button>
  )
}
