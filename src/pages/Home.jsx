import {
  HeroSection,
  FeaturesGrid,
  StatsSection,
  Footer
} from "../components/home"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <HeroSection />
      <FeaturesGrid />
      <StatsSection />
      <Footer />
    </div>
  )
}
