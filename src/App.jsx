import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Summary from "./pages/Summary";
import Incidents from "./pages/Incidents";
import Report from "./pages/Report";
import { Brain } from "lucide-react"
import FloatingActionBar from "./components/FloatingActionBar";
import Map from "./pages/Map";
import Lost from "./pages/Lost";
import IncidentDetail from "./pages/IncidentDetail";
import Dashboard from "./pages/Dashboard";
import MediaUpload from "./pages/uploadFile";
import DesignSystemPage from "./pages/DesignSystemPage";
import WireframesPage from "./pages/WireframesPage";
import VenueManager from "./pages/VenueManager";
import MobileMenu from "./components/MobileMenu"
import Zone from "./pages/Zone";


export default function App() {
  return (
    <>
      <div className="min-h-screen bg-gray-50"> {/* Background for the whole app */}
         <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Project Drishti</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Home
              </Link>
              {/* <Link to="/report" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Report
              </Link> */}
              <Link to="/incidents" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Incidents
              </Link>
              {/* <Link to="/map" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Map</Link> */}
              {/* <Link to="/lost" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Lost</Link> */}
              <Link to="/zones" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Zones</Link>
              <Link to="/Upload" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Upload</Link>
              <Link to="/Dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Dashboard</Link>

              {/* <Link to="/designSystem" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Design System</Link> */}
              {/* <Link to="/wireframes" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Wireframes</Link> */}
              <Link to="/venue-manager" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Venue Manager</Link>
            </div>
          </div>
        </div>
      </nav>
      <MobileMenu />

      {/* Centralized Floating Action Bar */}
      <FloatingActionBar />
   
      <div className="container mx-auto p-6 animate-fade-in"> {/* Main content area */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/report" element={<Report />} />
          {/* <Route path="/map" element={<Map />} /> */}
          {/* <Route path="/lost" element={<Lost />} /> */}
          <Route path="/zones" element={<Zone />} />
          <Route path="/incident/:id" element={<IncidentDetail />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/Upload" element={<MediaUpload/>} />
          {/* <Route path="/designSystem" element={<DesignSystemPage />} /> */}
          {/* <Route path="/wireframes" element={<WireframesPage />} /> */}
          <Route path="/venue-manager" element={<VenueManager />} />
        </Routes>
      </div>
    </div>
    </>
  );
}