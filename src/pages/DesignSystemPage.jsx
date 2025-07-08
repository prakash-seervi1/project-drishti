"use client"
import { Link } from "react-router-dom"
import { ArrowLeft, Figma, Download, Copy } from "lucide-react"
import DesignSystem from "../components/DesignSystem"

export default function DesignSystemPage() {
  const downloadDesignTokens = () => {
    const designTokens = {
      colors: {
        primary: {
          blue: "#2563EB",
          indigo: "#4F46E5",
        },
        status: {
          critical: "#EF4444",
          success: "#10B981",
          warning: "#F59E0B",
          info: "#8B5CF6",
        },
        priority: {
          critical: "#EF4444",
          high: "#F97316",
          medium: "#EAB308",
          low: "#22C55E",
        },
        neutral: {
          900: "#111827",
          600: "#4B5563",
          300: "#D1D5DB",
          50: "#F9FAFB",
        },
      },
      typography: {
        h1: { fontSize: "36px", fontWeight: 700, lineHeight: 1.2 },
        h2: { fontSize: "30px", fontWeight: 700, lineHeight: 1.2 },
        h3: { fontSize: "24px", fontWeight: 700, lineHeight: 1.3 },
        h4: { fontSize: "20px", fontWeight: 600, lineHeight: 1.4 },
        body: { fontSize: "16px", fontWeight: 400, lineHeight: 1.5 },
        small: { fontSize: "14px", fontWeight: 400, lineHeight: 1.4 },
        caption: { fontSize: "12px", fontWeight: 400, lineHeight: 1.3 },
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
        "4xl": "48px",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
      },
      shadows: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      },
    }

    const dataStr = JSON.stringify(designTokens, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = "drishti-design-tokens.json"

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const copyFigmaSpecs = () => {
    const figmaSpecs = `
# Project Drishti - Figma Design Specifications

## Colors
- Primary Blue: #2563EB
- Primary Indigo: #4F46E5
- Critical/Ongoing: #EF4444
- Success/Resolved: #10B981
- Warning/Investigating: #F59E0B
- Info/Escalated: #8B5CF6

## Typography
- H1: 36px, Bold, 1.2 line-height
- H2: 30px, Bold, 1.2 line-height
- H3: 24px, Bold, 1.3 line-height
- H4: 20px, Semibold, 1.4 line-height
- Body: 16px, Regular, 1.5 line-height
- Small: 14px, Regular, 1.4 line-height

## Components
- Button Height: 40px
- Button Padding: 16px horizontal, 8px vertical
- Button Border Radius: 8px
- Card Border Radius: 16px
- Card Padding: 24px
- Badge Border Radius: 9999px (full)

## Spacing System
- XS: 4px, SM: 8px, MD: 12px, LG: 16px
- XL: 20px, 2XL: 24px, 3XL: 32px, 4XL: 48px

## Shadows
- Card Shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1)
- Hover Shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25)

## Animations
- Fast: 150ms (hover effects)
- Standard: 300ms (UI changes)
- Slow: 500ms (page transitions)
- Easing: ease-in-out
    `

    navigator.clipboard.writeText(figmaSpecs).then(() => {
      alert("Figma specifications copied to clipboard!")
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/incidents" className="flex items-center space-x-3">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
              <span className="text-gray-600 hover:text-gray-900">Back to Incidents</span>
            </Link>
            <div className="flex items-center space-x-4">
              <button
                onClick={copyFigmaSpecs}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Figma Specs
              </button>
              <button
                onClick={downloadDesignTokens}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Tokens
              </button>
              <a
                href="https://figma.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Figma className="w-4 h-4 mr-2" />
                Open Figma
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Design System Content */}
      <DesignSystem />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">
              This design system provides complete specifications for implementing Project Drishti in Figma.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Use the specifications above to create pixel-perfect designs and maintain consistency across all
              components.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
