import { Activity, Eye, Users, Clock } from "lucide-react"
import StatCard from "./StatCard"

export default function StatsSection() {
  const stats = [
    {
      icon: Activity,
      value: "24/7",
      label: "Monitoring",
      gradientFrom: "blue-500",
      gradientTo: "indigo-600"
    },
    {
      icon: Eye,
      value: "Real-time",
      label: "Analysis",
      gradientFrom: "green-500",
      gradientTo: "emerald-600"
    },
    {
      icon: Users,
      value: "AI-Powered",
      label: "Intelligence",
      gradientFrom: "purple-500",
      gradientTo: "violet-600"
    },
    {
      icon: Clock,
      value: "Instant",
      label: "Response",
      gradientFrom: "orange-500",
      gradientTo: "red-600"
    }
  ]

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              gradientFrom={stat.gradientFrom}
              gradientTo={stat.gradientTo}
            />
          ))}
        </div>
      </div>
    </section>
  )
} 