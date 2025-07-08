import React, { useRef, useState } from "react"
import { uploadAPI } from "../services/api"
import { zonesAPI } from "../services/api"

export default function CameraCapture({ isOpen, onClose }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [captured, setCaptured] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [zones, setZones] = useState([])
  const [zonesLoading, setZonesLoading] = useState(false)
  const [zonesError, setZonesError] = useState("")
  const [selectedZone, setSelectedZone] = useState("")

  // Start camera when modal opens
  React.useEffect(() => {
    if (isOpen) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((mediaStream) => {
          setStream(mediaStream)
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream
          }
        })
        .catch(() => setError("Unable to access camera"))
    } else {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
        setStream(null)
      }
      setCaptured(null)
      setSuccess(false)
      setError("")
    }
    // eslint-disable-next-line
  }, [isOpen])

  // Fetch zones when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setZonesLoading(true)
      setZonesError("")
      zonesAPI.getZones()
        .then((res) => {
          setZones(res.data?.zones || [])
          setZonesLoading(false)
        })
        .catch(() => {
          setZonesError("Failed to load zones")
          setZonesLoading(false)
        })
    } else {
      setZones([])
      setSelectedZone("")
      setZonesError("")
      setZonesLoading(false)
    }
  }, [isOpen])

  const handleCapture = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video) {
      setError("Video ref not set")
      console.error("Video ref not set")
      return
    }
    if (!canvas) {
      setError("Canvas ref not set")
      console.error("Canvas ref not set")
      return
    }
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob((blob) => {
      setCaptured(blob)
      console.log("Image captured", blob)
    }, "image/jpeg")
  }

  const handleUpload = async () => {
    setUploading(true)
    setError("")
    setSuccess(false)
    try {
      const filename = `capture_${Date.now()}.jpg`
      const mimetype = captured?.type || "image/jpeg"
      const data = await uploadAPI.getSignedUploadUrl({ filename, mimetype, zone: selectedZone })
      if (!data.url) throw new Error("No upload URL returned")
      const uploadRes = await fetch(data.url, {
        method: "PUT",
        body: captured,
        headers: { "Content-Type": mimetype },
      })
      if (!uploadRes.ok) throw new Error("Upload failed")
      setSuccess(true)
      console.log("Upload successful")
    } catch (e) {
      setError(e.message || "Upload error")
      console.error("Upload error", e)
    } finally {
      setUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm relative">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>&times;</button>
        <h2 className="text-lg font-bold mb-4">Capture Image</h2>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {/* Zone Dropdown */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Select Zone <span className="text-red-500">*</span></label>
          {zonesLoading ? (
            <div className="text-gray-500 text-sm">Loading zones...</div>
          ) : zonesError ? (
            <div className="text-red-500 text-sm">{zonesError}</div>
          ) : (
            <select
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={selectedZone}
              onChange={e => setSelectedZone(e.target.value)}
              required
            >
              <option value="">-- Select Zone --</option>
              {zones.map((zone) => (
                <option key={zone.id || zone.zone || zone.name} value={zone.id || zone.zone || zone.name}>
                  {zone.name || zone.zone || zone.id}
                </option>
              ))}
            </select>
          )}
        </div>
        {!captured ? (
          <>
            <video ref={videoRef} autoPlay playsInline className="w-full rounded mb-4" />
            <canvas ref={canvasRef} style={{ display: "none" }} />
            <button onClick={handleCapture} className="w-full py-2 bg-blue-600 text-white rounded font-semibold" disabled={!selectedZone || zonesLoading}>Capture</button>
          </>
        ) : (
          <>
            <canvas ref={canvasRef} style={{ display: "none" }} />
            <img src={URL.createObjectURL(captured)} alt="Captured" className="w-full rounded mb-4" />
            <button onClick={handleUpload} disabled={uploading || success || !selectedZone} className="w-full py-2 bg-green-600 text-white rounded font-semibold mb-2">{uploading ? "Uploading..." : success ? "Uploaded!" : "Upload"}</button>
            <button onClick={() => setCaptured(null)} className="w-full py-2 bg-gray-200 text-gray-700 rounded font-semibold">Retake</button>
          </>
        )}
      </div>
    </div>
  )
} 