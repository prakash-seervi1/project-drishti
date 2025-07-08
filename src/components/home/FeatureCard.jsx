import { Link } from "react-router-dom"

export default function FeatureCard({ icon: Icon, title, description, linkText, linkTo, gradientFrom, gradientTo, colSpan = "" }) {
  return (
    <div className={`group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/70 backdrop-blur-sm rounded-lg overflow-hidden ${colSpan}`}>
      <div className="p-6">
        <div className={`w-12 h-12 bg-gradient-to-br from-${gradientFrom} to-${gradientTo} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
          {Icon && <Icon className="w-6 h-6 text-white" />}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <Link
          to={linkTo}
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          {linkText} →
        </Link>
      </div>
    </div>
  )
} 