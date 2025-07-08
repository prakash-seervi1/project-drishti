import {
    AlertTriangle,
    Clock,
    MapPin,
    Users,
    Thermometer,
    Camera,
    Star,
    Phone,
    Radio,
    Eye,
    Download,
    Zap,
    Siren,
  } from "lucide-react"
  
  export default function DesignSystem() {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Project Drishti - Design System</h1>
            <p className="text-xl text-gray-600">Complete design specifications for Figma implementation</p>
          </div>
  
          {/* Color Palette */}
          <section className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Color Palette</h2>
  
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Primary Colors */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Primary Colors</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg"></div>
                    <div>
                      <p className="font-medium">Blue Primary</p>
                      <p className="text-sm text-gray-600">#2563EB</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-indigo-600 rounded-lg"></div>
                    <div>
                      <p className="font-medium">Indigo</p>
                      <p className="text-sm text-gray-600">#4F46E5</p>
                    </div>
                  </div>
                </div>
              </div>
  
              {/* Status Colors */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Status Colors</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-red-500 rounded-lg"></div>
                    <div>
                      <p className="font-medium">Critical/Ongoing</p>
                      <p className="text-sm text-gray-600">#EF4444</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-500 rounded-lg"></div>
                    <div>
                      <p className="font-medium">Resolved/Success</p>
                      <p className="text-sm text-gray-600">#10B981</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-yellow-500 rounded-lg"></div>
                    <div>
                      <p className="font-medium">Investigating/Warning</p>
                      <p className="text-sm text-gray-600">#F59E0B</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-500 rounded-lg"></div>
                    <div>
                      <p className="font-medium">Escalated</p>
                      <p className="text-sm text-gray-600">#8B5CF6</p>
                    </div>
                  </div>
                </div>
              </div>
  
              {/* Priority Colors */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Priority Colors</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-red-500 rounded-lg"></div>
                    <div>
                      <p className="font-medium">Critical</p>
                      <p className="text-sm text-gray-600">#EF4444</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-orange-500 rounded-lg"></div>
                    <div>
                      <p className="font-medium">High</p>
                      <p className="text-sm text-gray-600">#F97316</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-yellow-500 rounded-lg"></div>
                    <div>
                      <p className="font-medium">Medium</p>
                      <p className="text-sm text-gray-600">#EAB308</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-500 rounded-lg"></div>
                    <div>
                      <p className="font-medium">Low</p>
                      <p className="text-sm text-gray-600">#22C55E</p>
                    </div>
                  </div>
                </div>
              </div>
  
              {/* Neutral Colors */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Neutral Colors</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-900 rounded-lg"></div>
                    <div>
                      <p className="font-medium">Gray 900</p>
                      <p className="text-sm text-gray-600">#111827</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-600 rounded-lg"></div>
                    <div>
                      <p className="font-medium">Gray 600</p>
                      <p className="text-sm text-gray-600">#4B5563</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                    <div>
                      <p className="font-medium">Gray 300</p>
                      <p className="text-sm text-gray-600">#D1D5DB</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-50 rounded-lg border"></div>
                    <div>
                      <p className="font-medium">Gray 50</p>
                      <p className="text-sm text-gray-600">#F9FAFB</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
  
          {/* Typography */}
          <section className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Typography</h2>
  
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Heading 1 - 36px Bold</h1>
                <p className="text-sm text-gray-600 mt-1">font-size: 36px, font-weight: 700, line-height: 1.2</p>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Heading 2 - 30px Bold</h2>
                <p className="text-sm text-gray-600 mt-1">font-size: 30px, font-weight: 700, line-height: 1.2</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Heading 3 - 24px Bold</h3>
                <p className="text-sm text-gray-600 mt-1">font-size: 24px, font-weight: 700, line-height: 1.3</p>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-900">Heading 4 - 20px Semibold</h4>
                <p className="text-sm text-gray-600 mt-1">font-size: 20px, font-weight: 600, line-height: 1.4</p>
              </div>
              <div>
                <p className="text-base text-gray-900">Body Text - 16px Regular</p>
                <p className="text-sm text-gray-600 mt-1">font-size: 16px, font-weight: 400, line-height: 1.5</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Small Text - 14px Regular</p>
                <p className="text-xs text-gray-500 mt-1">font-size: 14px, font-weight: 400, line-height: 1.4</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Caption - 12px Regular</p>
                <p className="text-xs text-gray-400 mt-1">font-size: 12px, font-weight: 400, line-height: 1.3</p>
              </div>
            </div>
          </section>
  
          {/* Spacing System */}
          <section className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Spacing System</h2>
  
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { size: "4px", class: "p-1", name: "XS" },
                { size: "8px", class: "p-2", name: "SM" },
                { size: "12px", class: "p-3", name: "MD" },
                { size: "16px", class: "p-4", name: "LG" },
                { size: "20px", class: "p-5", name: "XL" },
                { size: "24px", class: "p-6", name: "2XL" },
                { size: "32px", class: "p-8", name: "3XL" },
                { size: "48px", class: "p-12", name: "4XL" },
              ].map((space) => (
                <div key={space.name} className="text-center">
                  <div className="bg-blue-100 border-2 border-blue-300 rounded-lg mb-2">
                    <div className={`bg-blue-500 rounded ${space.class}`}></div>
                  </div>
                  <p className="font-medium text-gray-900">{space.name}</p>
                  <p className="text-sm text-gray-600">{space.size}</p>
                </div>
              ))}
            </div>
          </section>
  
          {/* Button Components */}
          <section className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Button Components</h2>
  
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Primary Buttons */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Primary Buttons</h3>
                <div className="space-y-3">
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </button>
                  <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Responder
                  </button>
                  <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center">
                    <Radio className="w-4 h-4 mr-2" />
                    Radio Contact
                  </button>
                </div>
              </div>
  
              {/* Secondary Buttons */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Secondary Buttons</h3>
                <div className="space-y-3">
                  <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </button>
                  <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                    Card View
                  </button>
                </div>
              </div>
  
              {/* Action Buttons */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Action Buttons</h3>
                <div className="space-y-3">
                  <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center">
                    <Zap className="w-4 h-4 mr-2" />
                    Escalate
                  </button>
                  <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center">
                    <Siren className="w-4 h-4 mr-2" />
                    Emergency
                  </button>
                </div>
              </div>
            </div>
  
            {/* Button Specifications */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Button Specifications:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Height: 40px (py-2 + text height)</li>
                <li>• Padding: 16px horizontal, 8px vertical</li>
                <li>• Border Radius: 8px</li>
                <li>• Font Weight: 500 (medium)</li>
                <li>• Transition: all 150ms ease</li>
                <li>• Icon Size: 16px (w-4 h-4)</li>
                <li>• Icon Margin: 8px right</li>
              </ul>
            </div>
          </section>
  
          {/* Card Components */}
          <section className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Card Components</h2>
  
            {/* Incident Card Example */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-6">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">🔥</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">Fire Incident</h3>
                        <span className="px-3 py-1 rounded-full text-sm font-medium border bg-red-100 text-red-800 border-red-200">
                          ongoing
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-500 text-white">CRITICAL</span>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < 5 ? "text-red-500 fill-current" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                      </div>
  
                      <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span className="font-medium">Zone A - Main Stage</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>5m ago</span>
                        </div>
                      </div>
  
                      <p className="text-gray-700 leading-relaxed mb-4">
                        Large fire detected near main stage area with potential structural damage
                      </p>
  
                      {/* Quick Stats */}
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="bg-purple-50 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <Users className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium text-purple-900">Crowd Density</span>
                          </div>
                          <div className="text-lg font-bold text-purple-900">85%</div>
                          <div className="text-xs text-purple-700">150 evacuated</div>
                        </div>
  
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">Response ETA</span>
                          </div>
                          <div className="text-lg font-bold text-blue-900">2 min</div>
                          <div className="text-xs text-blue-700">en_route</div>
                        </div>
  
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <Thermometer className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-900">Environment</span>
                          </div>
                          <div className="text-lg font-bold text-green-900">28°C</div>
                          <div className="text-xs text-green-700">Poor visibility</div>
                        </div>
  
                        <div className="bg-orange-50 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <Camera className="w-4 h-4 text-orange-600" />
                            <span className="text-sm font-medium text-orange-900">Media</span>
                          </div>
                          <div className="text-lg font-bold text-orange-900">3</div>
                          <div className="text-xs text-orange-700">cameras active</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
  
            {/* Card Specifications */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Card Specifications:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Background: white/70 with backdrop-blur</li>
                <li>• Border Radius: 16px</li>
                <li>• Shadow: xl (0 20px 25px -5px rgba(0, 0, 0, 0.1))</li>
                <li>• Border: 1px solid #E5E7EB</li>
                <li>• Padding: 24px</li>
                <li>• Hover: shadow-2xl transition</li>
                <li>• Status Badge: rounded-full, 12px padding horizontal</li>
                <li>• Priority Badge: rounded-full, 8px padding horizontal</li>
              </ul>
            </div>
          </section>
  
          {/* Status Indicators */}
          <section className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Status Indicators</h2>
  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Status Badges */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Status Badges</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 rounded-full text-sm font-medium border bg-red-100 text-red-800 border-red-200">
                      ongoing
                    </span>
                    <span className="text-sm text-gray-600">Active incident</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 rounded-full text-sm font-medium border bg-green-100 text-green-800 border-green-200">
                      resolved
                    </span>
                    <span className="text-sm text-gray-600">Completed incident</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 rounded-full text-sm font-medium border bg-yellow-100 text-yellow-800 border-yellow-200">
                      investigating
                    </span>
                    <span className="text-sm text-gray-600">Under investigation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 rounded-full text-sm font-medium border bg-purple-100 text-purple-800 border-purple-200">
                      escalated
                    </span>
                    <span className="text-sm text-gray-600">Escalated priority</span>
                  </div>
                </div>
              </div>
  
              {/* Priority Badges */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Priority Badges</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-500 text-white">CRITICAL</span>
                    <span className="text-sm text-gray-600">Immediate response required</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-orange-500 text-white">HIGH</span>
                    <span className="text-sm text-gray-600">High priority response</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-500 text-white">MEDIUM</span>
                    <span className="text-sm text-gray-600">Standard response</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-500 text-white">LOW</span>
                    <span className="text-sm text-gray-600">Low priority response</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
  
          {/* Icons System */}
          <section className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Icon System</h2>
  
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[
                { icon: AlertTriangle, name: "Alert Triangle", usage: "Warnings, incidents" },
                { icon: Clock, name: "Clock", usage: "Time, timestamps" },
                { icon: MapPin, name: "Map Pin", usage: "Location, zones" },
                { icon: Users, name: "Users", usage: "Crowd, responders" },
                { icon: Thermometer, name: "Thermometer", usage: "Temperature, environment" },
                { icon: Camera, name: "Camera", usage: "Media, surveillance" },
                { icon: Phone, name: "Phone", usage: "Communication" },
                { icon: Radio, name: "Radio", usage: "Radio communication" },
                { icon: Eye, name: "Eye", usage: "View, visibility" },
                { icon: Download, name: "Download", usage: "Export, download" },
                { icon: Zap, name: "Zap", usage: "Escalate, urgent" },
                { icon: Siren, name: "Siren", usage: "Emergency, alert" },
              ].map((item) => (
                <div key={item.name} className="text-center p-4 border border-gray-200 rounded-lg">
                  <item.icon className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                  <p className="font-medium text-sm text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-600 mt-1">{item.usage}</p>
                </div>
              ))}
            </div>
  
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Icon Specifications:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Standard Size: 16px (w-4 h-4) for inline icons</li>
                <li>• Large Size: 20px (w-5 h-5) for prominent icons</li>
                <li>• Extra Large: 24px (w-6 h-6) for headers</li>
                <li>• Stroke Width: 2px (default Lucide)</li>
                <li>• Colors: Contextual based on usage</li>
              </ul>
            </div>
          </section>
  
          {/* Layout Grid */}
          <section className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Layout Grid System</h2>
  
            <div className="space-y-6">
              {/* 12 Column Grid */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">12 Column Grid</h3>
                <div className="grid grid-cols-12 gap-4">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-blue-100 border border-blue-300 rounded p-2 text-center text-xs font-medium text-blue-800"
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
  
              {/* Responsive Breakpoints */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Responsive Breakpoints</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">Mobile</p>
                    <p className="text-sm text-gray-600">&lt; 768px</p>
                    <p className="text-xs text-gray-500">1 column layout</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">Tablet</p>
                    <p className="text-sm text-gray-600">768px - 1024px</p>
                    <p className="text-xs text-gray-500">2 column layout</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">Desktop</p>
                    <p className="text-sm text-gray-600">1024px - 1280px</p>
                    <p className="text-xs text-gray-500">3-4 column layout</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">Large</p>
                    <p className="text-sm text-gray-600">&gt; 1280px</p>
                    <p className="text-xs text-gray-500">4+ column layout</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
  
          {/* Component States */}
          <section className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Component States</h2>
  
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Button States */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Button States</h3>
                <div className="space-y-3">
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg">Default</button>
                  <button className="w-full px-4 py-2 bg-blue-700 text-white rounded-lg">Hover</button>
                  <button className="w-full px-4 py-2 bg-blue-800 text-white rounded-lg">Active</button>
                  <button className="w-full px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed">
                    Disabled
                  </button>
                </div>
              </div>
  
              {/* Input States */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Input States</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Default state"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Focus state"
                    className="w-full px-3 py-2 border-2 border-blue-500 rounded-lg outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Error state"
                    className="w-full px-3 py-2 border-2 border-red-500 rounded-lg outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Disabled state"
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>
  
              {/* Card States */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Card States</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-white border border-gray-200 rounded-lg">Default Card</div>
                  <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-md">Hover Card</div>
                  <div className="p-4 bg-blue-50 border-2 border-blue-500 rounded-lg">Selected Card</div>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg opacity-50">Disabled Card</div>
                </div>
              </div>
            </div>
          </section>
  
          {/* Animation Guidelines */}
          <section className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Animation Guidelines</h2>
  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Transition Durations</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">Fast (Hover effects)</span>
                    <span className="text-gray-600">150ms</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">Standard (UI changes)</span>
                    <span className="text-gray-600">300ms</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">Slow (Page transitions)</span>
                    <span className="text-gray-600">500ms</span>
                  </div>
                </div>
              </div>
  
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Easing Functions</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">Linear</span>
                    <span className="text-gray-600">linear</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">Ease</span>
                    <span className="text-gray-600">ease</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">Ease In Out</span>
                    <span className="text-gray-600">ease-in-out</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
  
          {/* Figma Implementation Notes */}
          <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Figma Implementation Guide</h2>
  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">🎨 Design Setup</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Create color styles for all defined colors</li>
                  <li>• Set up text styles for typography system</li>
                  <li>• Create component library for buttons, cards, badges</li>
                  <li>• Use auto-layout for responsive components</li>
                  <li>• Set up grid system with 12 columns</li>
                  <li>• Create spacing tokens (4px, 8px, 12px, etc.)</li>
                </ul>
              </div>
  
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">🔧 Component Structure</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Use variants for button states and types</li>
                  <li>• Create master components for incident cards</li>
                  <li>• Set up boolean properties for status indicators</li>
                  <li>• Use component properties for dynamic content</li>
                  <li>• Create instances for different incident types</li>
                  <li>• Set up prototyping for interactions</li>
                </ul>
              </div>
            </div>
  
            <div className="mt-6 p-4 bg-white/50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">📋 Figma Checklist:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <p className="font-medium mb-2">Design System:</p>
                  <ul className="space-y-1">
                    <li>□ Color palette defined</li>
                    <li>□ Typography styles created</li>
                    <li>□ Spacing system established</li>
                    <li>□ Icon library imported</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-2">Components:</p>
                  <ul className="space-y-1">
                    <li>□ Button components with variants</li>
                    <li>□ Card components with states</li>
                    <li>□ Status indicators</li>
                    <li>□ Form elements</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    )
  }
  