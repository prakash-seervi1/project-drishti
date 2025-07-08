export default function StatCard({ icon: Icon, value, label, gradientFrom, gradientTo }) {
  return (
    <div className="text-center">
      <div className={`w-16 h-16 bg-gradient-to-br from-${gradientFrom} to-${gradientTo} rounded-full flex items-center justify-center mx-auto mb-4`}>
        {Icon && <Icon className="w-8 h-8 text-white" />}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  )
} 