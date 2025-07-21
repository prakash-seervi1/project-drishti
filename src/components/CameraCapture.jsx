import React, { useRef, useState, useEffect, useCallback } from "react"
import { Camera, Video, VideoOff, Upload, RotateCcw, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { api } from "../services/adkApi"
import { cn, formatTimestamp } from "../lib/utils"

// Constants
const LIVE_STREAM_INTERVAL = 5000 // 5 seconds
const VIDEO_CONSTRAINTS = {
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: 'environment' // Use back camera on mobile
  }
}

export default function CameraCapture({ isOpen, onClose }) {
  console.log("CameraCapture mounted");
  // Refs
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const intervalRef = useRef(null)
  
  // State
  const [stream, setStream] = useState(null)
  const [captured, setCaptured] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [zones, setZones] = useState([])
  const [zonesLoading, setZonesLoading] = useState(false)
  const [zonesError, setZonesError] = useState("")
  const [selectedZone, setSelectedZone] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [liveStatus, setLiveStatus] = useState("")
  const [frameCount, setFrameCount] = useState(0)
  const [cameraReady, setCameraReady] = useState(false)

  // Initialize camera when modal opens
  const initializeCamera = useCallback(async () => {
    try {
      setError("")
      const mediaStream = await navigator.mediaDevices.getUserMedia(VIDEO_CONSTRAINTS)
      setStream(mediaStream)
      // Do not set videoRef.current.srcObject or onloadedmetadata here
    } catch (err) {
      console.error("Camera access error:", err)
      setError("Unable to access camera. Please check permissions.")
    }
  }, []) // no dependencies, stable

  // Ensure video element gets stream and sets cameraReady
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        setCameraReady(true);
      };
    }
  }, [stream]);

  // Live stream functions
  const stopLiveStream = useCallback(() => {
    setStreaming(false)
    setLiveStatus("")
    clearInterval(intervalRef.current)
    intervalRef.current = null
  }, [])

  // Cleanup camera resources and reset all state
  const fullCleanup = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraReady(false)
    setCaptured(null)
    setSuccess(false)
    setError("")
    setZones([])
    setSelectedZone("")
    setZonesError("")
    setZonesLoading(false)
    setFrameCount(0)
    stopLiveStream()
  }, [stream, stopLiveStream])

  // Load zones (stable)
  const loadZones = useCallback(async () => {
    if (zonesLoading || zones.length > 0) {
      console.log("Skipping loadZones: already loading or loaded");
      return;
    }
    setZonesLoading(true)
    setZonesError("")
    console.log("Loading zones");
    try {
      const res = await api.getZones()
      console.log("Loaded zones:", res);
      const zones = Array.isArray(res) ? res : (res.zones || [])
      setZones(zones)
    } catch (err) {
      console.error("Failed to load zones:", err)
      setZonesError("Failed to load zones. Please try again.")
    } finally {
      setZonesLoading(false)
    }
  }, []) // no dependencies, stable

  // Effects
  useEffect(() => {
    console.log("useEffect triggered", { isOpen });
    if (isOpen) {
      initializeCamera()
      loadZones()
    } else {
      fullCleanup()
    }
  }, [isOpen])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      fullCleanup()
    }
  }, [fullCleanup])

  // Live stream functions
  const startLiveStream = useCallback(async () => {
    if (!selectedZone) {
      setError("Please select a zone first")
      return
    }

    setError("")
    setSuccess(false)
    setLiveStatus("Starting live stream...")
    setFrameCount(0)

    try {
      setStreaming(true)
      setLiveStatus("Live stream active")
      
      intervalRef.current = setInterval(() => {
        captureAndUploadFrame()
      }, LIVE_STREAM_INTERVAL)
    } catch (err) {
      console.error("Live stream error:", err)
      setError("Failed to start live stream")
      setLiveStatus("")
      setStreaming(false)
    }
  }, [selectedZone])

  // Capture and upload frame for live stream
  const captureAndUploadFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !selectedZone || !cameraReady) return

    const video = videoRef.current
    const canvas = canvasRef.current

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(async (blob) => {
      if (!blob) return

      const currentFrame = frameCount + 1
      setFrameCount(currentFrame)
      setLiveStatus(`Uploading frame ${currentFrame}...`)

      const filename = `liveframe_${Date.now()}_${currentFrame}.jpg`
      const mimetype = blob.type || "image/jpeg"

      try {
        const data = await api.getSignedUploadUrl({
          filename,
          mimetype,
          zone: selectedZone,
          notes: '',
          type: '', // Always send a string, not null
          bucket: 'project-drishti-central1-bucket-vision'
        })

        if (!data.url) throw new Error("No upload URL returned")

        const uploadResponse = await fetch(data.url, {
          method: "PUT",
          body: blob,
          headers: { "Content-Type": mimetype },
        })

        if (!uploadResponse.ok) throw new Error("Upload failed")

        // Automatically call vision analysis after upload
        const fileUrl = `https://storage.googleapis.com/project-drishti-central1-bucket-vision/${data.objectPath}`
        setLiveStatus(`Frame ${currentFrame} uploaded. Analyzing...`)
        try {
          const analysisRes = await api.analyzeMedia({
            fileUrl,
            zone: selectedZone,
            docId: data.docId // Pass docId from upload response
          })
          if (analysisRes && analysisRes.success) {
            setLiveStatus(`People detected: ${analysisRes.personCount}`);
          } else {
            setLiveStatus('Image uploaded, but analysis failed.');
          }
        } catch (err) {
          setLiveStatus('Image uploaded, but analysis failed.')
        }
      } catch (err) {
        console.error("Frame upload error:", err)
        setLiveStatus(`Upload error: ${err.message || "Unknown error"}`)
      }
    }, "image/jpeg", 0.8) // 80% quality
  }, [selectedZone, frameCount, cameraReady])

  // Manual capture
  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !cameraReady) {
      setError("Camera not ready")
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob((blob) => {
      if (blob) {
        setCaptured(blob)
        setError("")
      } else {
        setError("Failed to capture image")
      }
    }, "image/jpeg", 0.9) // 90% quality for manual captures
  }, [cameraReady])

  // Upload captured image
  const handleUpload = useCallback(async () => {
    if (!captured || !selectedZone) return

    setUploading(true)
    setError("")
    setSuccess(false)

    try {
      const filename = `capture_${Date.now()}.jpg`
      const mimetype = captured.type || "image/jpeg"

      const data = await api.getSignedUploadUrl({
        filename,
        mimetype,
        zone: selectedZone,
        notes: '',
        type: '', // Always send a string, not null
        bucket: 'project-drishti-central1-bucket-vision'
      })

      if (!data.url) throw new Error("No upload URL returned")

      const uploadResponse = await fetch(data.url, {
        method: "PUT",
        body: captured,
        headers: { "Content-Type": mimetype },
      })

      if (!uploadResponse.ok) throw new Error("Upload failed")

      // Automatically call vision analysis after upload
      const fileUrl = `https://storage.googleapis.com/project-drishti-central1-bucket-vision/${data.objectPath}`
      setSuccess(true)
      setLiveStatus('Analyzing image...')
      try {
        const analysisRes = await api.analyzeMedia({
          fileUrl,
          zone: selectedZone,
          docId: data.docId // Pass docId from upload response
        })
        setLiveStatus(`Image analyzed: ${analysisRes && analysisRes.result ? analysisRes.result : 'Done'}`)
      } catch (err) {
        setLiveStatus('Image uploaded, but analysis failed.')
      }
    } catch (err) {
      console.error("Upload error:", err)
      setError(err.message || "Upload failed")
    } finally {
      setUploading(false)
    }
  }, [captured, selectedZone])

  // Reset capture
  const handleRetake = useCallback(() => {
    setCaptured(null)
    setSuccess(false)
    setError("")
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Camera Capture</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Success Display */}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span className="text-sm text-green-700">Image uploaded successfully!</span>
            </div>
          )}

          {/* Zone Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Zone <span className="text-red-500">*</span>
            </label>
            {zonesLoading ? (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                <span className="text-sm text-gray-600">Loading zones...</span>
              </div>
            ) : zonesError ? (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-700">{zonesError}</span>
              </div>
            ) : (
              (() => {
                // Normalize zones to ensure id and name
                const normalizedZones = zones.map((zone, idx) => ({
                  id: zone.id || idx,
                  name: zone.name || `Zone ${idx + 1}`,
                  ...zone,
                }));
                return (
                  <select
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                      streaming && "bg-gray-100 cursor-not-allowed"
                    )}
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    disabled={streaming}
                    required
                  >
                    <option value="">-- Select Zone --</option>
                    {normalizedZones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name}
                      </option>
                    ))}
                  </select>
                );
              })()
            )}
          </div>

          {/* Live Stream Controls */}
          <div className="flex gap-2">
            {!streaming ? (
              <button
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors",
                  selectedZone && cameraReady && !zonesLoading
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                )}
                onClick={startLiveStream}
                disabled={!selectedZone || !cameraReady || zonesLoading}
              >
                <Video className="w-4 h-4" />
                Start Live Stream
              </button>
            ) : (
              <button
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                onClick={stopLiveStream}
              >
                <VideoOff className="w-4 h-4" />
                Stop Live Stream
              </button>
            )}
          </div>

          {/* Live Stream Status */}
          {liveStatus && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                {streaming && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                <span className="text-sm text-blue-700">{liveStatus}</span>
              </div>
              {frameCount > 0 && (
                <div className="text-xs text-blue-600 mt-1">
                  Frames uploaded: {frameCount}
                </div>
              )}
            </div>
          )}

          {/* Video Preview */}
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-lg bg-gray-900"
              style={{ aspectRatio: '16/9' }}
            />
            {!cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-lg">
                <div className="text-center text-white">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Initializing camera...</p>
                </div>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {/* Manual Capture Controls */}
          {!streaming && (
            <div className="space-y-3">
              {!captured ? (
                <button
                  onClick={handleCapture}
                  disabled={!selectedZone || !cameraReady || zonesLoading}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors",
                    selectedZone && cameraReady && !zonesLoading
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  )}
                >
                  <Camera className="w-4 h-4" />
                  Capture Photo
                </button>
              ) : (
                <div className="space-y-3">
                  {/* Captured Image Preview */}
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(captured) || "/placeholder.svg"}
                      alt="Captured"
                      className="w-full rounded-lg"
                    />
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Captured
                    </div>
                  </div>

                  {/* Upload and Retake Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpload}
                      disabled={uploading || success || !selectedZone}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors",
                        uploading
                          ? "bg-blue-400 text-white cursor-not-allowed"
                          : success
                          ? "bg-green-600 text-white cursor-not-allowed"
                          : selectedZone
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      )}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Uploading...
                        </>
                      ) : success ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Uploaded!
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Upload
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleRetake}
                      disabled={uploading}
                      className="flex items-center justify-center gap-2 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Retake
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
