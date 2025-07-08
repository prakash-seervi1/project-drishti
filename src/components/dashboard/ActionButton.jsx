export default function ActionButton({ icon, label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-4 ${color} text-white rounded-lg transition-all duration-200 transform hover:scale-105`}
    >
      {icon}
      <span className="text-xs mt-2 font-medium">{label}</span>
    </button>
  )
} 