import { Eye, AlertTriangle, FileText } from "lucide-react"
import FeatureCard from "./FeatureCard"

export default function FeaturesGrid() {
  const features = [
    {
      icon: Eye,
      title: "Zone Summary",
      description: "AI-generated briefings for comprehensive zone analysis",
      linkText: "Get AI-generated briefings for any zone",
      linkTo: "/summary",
      gradientFrom: "green-500",
      gradientTo: "emerald-600"
    },
    {
      icon: AlertTriangle,
      title: "Live Incidents",
      description: "Real-time incident monitoring and response dashboard",
      linkText: "Real-time incident monitoring dashboard",
      linkTo: "/incidents",
      gradientFrom: "red-500",
      gradientTo: "rose-600"
    },
    {
      icon: FileText,
      title: "Incident Reports",
      description: "Submit and manage incident reports manually",
      linkText: "Submit a new incident manually",
      linkTo: "/report",
      gradientFrom: "purple-500",
      gradientTo: "violet-600",
      colSpan: "md:col-span-2 lg:col-span-1"
    }
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Comprehensive Safety Solutions</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powered by Google Cloud & Gemini AI for real-time monitoring and intelligent response
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              linkText={feature.linkText}
              linkTo={feature.linkTo}
              gradientFrom={feature.gradientFrom}
              gradientTo={feature.gradientTo}
              colSpan={feature.colSpan || ""}
            />
          ))}
        </div>
      </div>
    </section>
  )
} 