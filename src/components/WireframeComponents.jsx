import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Zap, Brain, Eye, Map, Database } from 'lucide-react'

// Utility function for combining classes
function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function WireframeBox({ children, width = "w-full", height = "h-auto", className = "", dashed = false, ...props }) {
  return (
    <div
      className={cn(
        "border-2 rounded-lg flex items-center justify-center p-4 bg-white",
        dashed ? "border-dashed border-gray-400" : "border-solid border-gray-600",
        width,
        height,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function DeviceFrame({ type = "desktop", children, className = "" }) {
  const frameStyles = {
    desktop: "w-full max-w-6xl mx-auto bg-gray-800 rounded-t-lg p-4 shadow-2xl",
    tablet: "w-full max-w-4xl mx-auto bg-gray-800 rounded-2xl p-6 shadow-2xl",
    mobile: "w-80 mx-auto bg-gray-900 rounded-3xl p-4 shadow-2xl",
  }

  const screenStyles = {
    desktop: "bg-white rounded min-h-[600px] overflow-hidden",
    tablet: "bg-white rounded-xl min-h-[500px] overflow-hidden",
    mobile: "bg-white rounded-2xl min-h-[600px] overflow-hidden relative",
  }

  return (
    <div className={cn(frameStyles[type], className)}>
      {type === "mobile" && (
        <div className="flex justify-center mb-2">
          <div className="w-12 h-1 bg-gray-600 rounded-full"></div>
        </div>
      )}
      <div className={screenStyles[type]}>{children}</div>
      {type === "desktop" && (
        <div className="flex justify-center mt-2">
          <div className="w-32 h-6 bg-gray-700 rounded-b-lg"></div>
        </div>
      )}
    </div>
  )
}

export function FlowArrow({ direction = "right", label = "", color = "gray", size = "md" }) {
  const colorClasses = {
    gray: "text-gray-400",
    blue: "text-blue-500",
    green: "text-green-500",
    red: "text-red-500",
    purple: "text-purple-500",
  }

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  }

  const ArrowComponent = {
    right: ArrowRight,
    left: ArrowLeft,
    up: ArrowUp,
    down: ArrowDown,
  }[direction] || ArrowRight

  return (
    <div className="flex flex-col items-center justify-center">
      <ArrowComponent className={cn(sizeClasses[size], colorClasses[color])} />
      {label && (
        <div className={cn("text-xs mt-1 text-center max-w-20", colorClasses[color])}>
          {label}
        </div>
      )}
    </div>
  )
}

export function Annotation({ text, position = "top", color = "blue", className = "" }) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-800 border-blue-300",
    green: "bg-green-100 text-green-800 border-green-300",
    red: "bg-red-100 text-red-800 border-red-300",
    purple: "bg-purple-100 text-purple-800 border-purple-300",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-300",
  }

  const positionClasses = {
    top: "absolute -top-8 left-1/2 transform -translate-x-1/2",
    bottom: "absolute -bottom-8 left-1/2 transform -translate-x-1/2",
    left: "absolute top-1/2 -left-32 transform -translate-y-1/2",
    right: "absolute top-1/2 -right-32 transform -translate-y-1/2",
  }

  return (
    <div
      className={cn(
        "px-3 py-1 rounded-full text-xs font-medium border-2 whitespace-nowrap z-10",
        colorClasses[color],
        positionClasses[position],
        className
      )}
    >
      {text}
    </div>
  )
}

export function GoogleAIBadge({ service, className = "" }) {
  const serviceConfig = {
    "Vertex AI": { 
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
      icon: Brain
    },
    "Gemini": { 
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
      icon: Zap
    },
    "Firebase": { 
      color: "bg-gradient-to-r from-orange-500 to-red-500",
      icon: Database
    },
    "Google Maps": { 
      color: "bg-gradient-to-r from-green-500 to-blue-500",
      icon: Map
    },
    "Cloud Functions": { 
      color: "bg-gradient-to-r from-indigo-500 to-purple-500",
      icon: Zap
    },
    "Vision AI": { 
      color: "bg-gradient-to-r from-teal-500 to-cyan-500",
      icon: Eye
    }
  }

  const config = serviceConfig[service] || { 
    color: "bg-gray-500", 
    icon: Zap 
  }
  const IconComponent = config.icon

  return (
    <div
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white shadow-sm",
        config.color,
        className,
      )}
    >
      <IconComponent className="w-3 h-3 mr-1" />
      {service}
    </div>
  )
}

export function AIProcessingNode({ title, description, aiService, status = "active" }) {
  const statusColors = {
    active: "border-green-400 bg-green-50",
    processing: "border-blue-400 bg-blue-50",
    pending: "border-yellow-400 bg-yellow-50",
    error: "border-red-400 bg-red-50"
  }

  return (
    <div className={cn("border-2 rounded-lg p-4 relative", statusColors[status])}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm">{title}</h3>
        <GoogleAIBadge service={aiService} />
      </div>
      <p className="text-xs text-gray-600">{description}</p>
      <div className={cn(
        "absolute top-2 right-2 w-2 h-2 rounded-full",
        status === "active" ? "bg-green-400" : 
        status === "processing" ? "bg-blue-400 animate-pulse" :
        status === "pending" ? "bg-yellow-400" : "bg-red-400"
      )}></div>
    </div>
  )
}
