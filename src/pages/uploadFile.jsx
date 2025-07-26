import React, { useState, useEffect } from "react"
import { Upload, Loader2, CheckCircle, XCircle, ArrowLeft, Camera, Video, FileText, Cloud } from "lucide-react"
import { Link } from "react-router-dom"
import { api } from '../services/adkApi';

export default function MediaUpload() {
  const [zone, setZone] = useState("")
  const [notes, setNotes] = useState("")
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [zones, setZones] = useState([])
  const [zonesLoading, setZonesLoading] = useState(false)
  const [zonesError, setZonesError] = useState("")
  const [analysisStatus, setAnalysisStatus] = useState("")
  const [autoIncident, setAutoIncident] = useState(true);
  const [analysisResult, setAnalysisResult] = useState(null);

  useEffect(() => {
    const fetchZones = async () => {
      setZonesLoading(true)
      setZonesError("")
      try {
        const res = await api.getZones()
        const zoneList = Array.isArray(res) ? res : (res.zones || [])
        setZones(zoneList)
      } catch {
        setZonesError("Failed to load zones. Please try again.")
      } finally {
        setZonesLoading(false)
      }
    }
    fetchZones()
  }, [])

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setFile(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleUpload = async () => {
    if (!file || !zone) {
      setMessage({ type: "error", text: "Zone and media file are required." })
      return
    }
    setLoading(true)
    setMessage(null)
    setAnalysisStatus("")
    setAnalysisResult(null)
    try {
      // Get signed URL
      const data = await api.getSignedUploadUrl({
        filename: file.name,
        mimetype: file.type,
        zone,
        notes,
        type: '', // Always send a string
        bucket: 'project-drishti-central1-bucket-vision',
        autoIncident // Pass to backend if needed
      });
      if (!data.url) throw new Error("No upload URL returned")
      // Upload the file directly
      await fetch(data.url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      setMessage({ type: "success", text: "Upload successful ✅" })
      // Automatically call vision analysis after upload
      const fileUrl = `https://storage.googleapis.com/project-drishti-central1-bucket-vision/${data.objectPath}`
      setAnalysisStatus("Analyzing image...")
      try {
        const analysisRes = await api.analyzeMedia({
          fileUrl,
          zone,
          docId: data.docId, // Pass docId from upload response
          autoIncident
        })
        if (analysisRes && analysisRes.success) {
          setAnalysisResult(analysisRes);
          setAnalysisStatus("");
        } else {
          setAnalysisResult(null);
          setAnalysisStatus('Image uploaded, but analysis failed.');
        }
      } catch {
        setAnalysisResult(null);
        setAnalysisStatus('Image uploaded, but analysis failed.');
      }
      setZone("")
      setNotes("")
      setFile(null)
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Upload failed. Please try again." })
    } finally {
      setLoading(false)
    }
  };
  

  const getFileIcon = () => {
    if (!file) return <Upload className="w-8 h-8 text-gray-400" />
    if (file.type.startsWith('image/')) return <Camera className="w-8 h-8 text-blue-500" />
    if (file.type.startsWith('video/')) return <Video className="w-8 h-8 text-purple-500" />
    return <FileText className="w-8 h-8 text-gray-500" />
  }

  const getFileType = () => {
    if (!file) return "No file selected"
    if (file.type.startsWith('image/')) return "Image"
    if (file.type.startsWith('video/')) return "Video"
    return "File"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Navigation */}
        <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Media Upload</h1>
              <p className="text-gray-600">Upload photos and videos for crowd detection analysis</p>
            </div>
          </div>
        </div>

        {/* Upload Form */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          {/* <form onSubmit={handleSubmit} className="space-y-6"> */}
            {/* Zone Selection */}
            <div>
              <label className="block font-semibold text-gray-900 mb-2">Zone *</label>
              {zonesLoading ? (
                <div className="p-2 text-blue-600">Loading zones...</div>
              ) : zonesError ? (
                <div className="p-2 text-red-600">{zonesError}</div>
              ) : (
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  required
                >
                  <option value="">Select a zone</option>
                  {zones.map((z) => (
                    <option key={z.id || z.name} value={z.id || z.name}>
                      {z.name || z.id}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block font-semibold text-gray-900 mb-2">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe the situation, crowd behavior, or any relevant details..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm resize-none"
              />
            </div>

            {/* Auto Incident Creation Toggle */}
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="autoIncident"
                checked={autoIncident}
                onChange={e => setAutoIncident(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="autoIncident" className="font-medium text-gray-900">
                Auto Incident Creation
              </label>
            </div>

            {/* File Upload Area */}
            <div>
              <label className="block font-semibold text-gray-900 mb-2">Upload Media *</label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  dragActive 
                    ? "border-blue-500 bg-blue-50" 
                    : file 
                      ? "border-green-500 bg-green-50" 
                      : "border-gray-300 bg-gray-50 hover:border-gray-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
                
                <div className="space-y-4">
                  {getFileIcon()}
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {file ? file.name : "Drop your file here"}
                    </h3>
                    <p className="text-gray-600">
                      {file 
                        ? `${getFileType()} • ${(file.size / 1024 / 1024).toFixed(2)} MB`
                        : "or click to browse"
                      }
                    </p>
                  </div>

                  {file && (
                    <div className="flex items-center justify-center space-x-2 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>File selected successfully</span>
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                Supported formats: JPG, PNG, GIF, MP4, MOV, AVI (Max 50MB)
              </p>
            </div>

            {/* Message Display */}
            {message && (
              <div
                className={`flex items-center px-4 py-3 rounded-xl text-sm ${
                  message.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 mr-2 text-red-600" />
                )}
                {message.text}
              </div>
            )}

            {/* Analysis Status Display */}
            {analysisStatus && (
              <div className="flex items-center px-4 py-3 rounded-xl text-sm bg-blue-50 text-blue-800 border border-blue-200 mt-4">
                <Loader2 className="w-5 h-5 mr-2 text-blue-600 animate-spin" />
                {analysisStatus}
              </div>
            )}

            {/* Analysis Result Card */}
            {analysisResult && (
              <div className="bg-white/90 border border-gray-200 rounded-2xl shadow-lg p-6 mt-6 max-w-2xl mx-auto">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
                  Analysis Result
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div><span className="font-semibold">People Detected:</span> {analysisResult.personCount}</div>
                  <div><span className="font-semibold">Crowd Density:</span> {analysisResult.crowdDensity}</div>
                  <div><span className="font-semibold">Smoke Detected:</span> <span className={analysisResult.smokeDetected ? 'text-red-600 font-bold' : 'text-green-700'}>{analysisResult.smokeDetected ? 'Yes' : 'No'}</span></div>
                  <div><span className="font-semibold">Fire Detected:</span> <span className={analysisResult.fireDetected ? 'text-red-600 font-bold' : 'text-green-700'}>{analysisResult.fireDetected ? 'Yes' : 'No'}</span></div>
                  <div><span className="font-semibold">Stampede Detected:</span> <span className={analysisResult.stampedeDetected ? 'text-red-600 font-bold' : 'text-green-700'}>{analysisResult.stampedeDetected ? 'Yes' : 'No'}</span></div>
                  <div><span className="font-semibold">Medical Emergency:</span> <span className={analysisResult.medicalEmergency ? 'text-red-600 font-bold' : 'text-green-700'}>{analysisResult.medicalEmergency ? 'Yes' : 'No'}</span></div>
                  <div><span className="font-semibold">Potential Risk:</span> <span className={analysisResult.potentialRisk ? 'text-red-600 font-bold' : 'text-green-700'}>{analysisResult.potentialRisk ? 'Yes' : 'No'}</span></div>
                  <div><span className="font-semibold">Incident Recommended:</span> <span className={analysisResult.incidentRecommended ? 'text-orange-600 font-bold' : 'text-green-700'}>{analysisResult.incidentRecommended ? 'Yes' : 'No'}</span></div>
                  <div className="md:col-span-2"><span className="font-semibold">Incident Type:</span> {analysisResult.incidentType}</div>
                </div>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-2">
                  <span className="font-semibold text-yellow-800">Suggested Action:</span>
                  <div className="text-gray-900 mt-1">{analysisResult.suggestedAction}</div>
                </div>
                <div className="text-xs text-gray-500 mt-2">Zone: {analysisResult.zone} | File: <a href={analysisResult.fileUrl} target="_blank" rel="noopener noreferrer" className="underline">View Media</a></div>
              </div>
            )}

            {/* Upload Button */}
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-gray-600">
                {file && (
                  <span className="flex items-center">
                    <Cloud className="w-4 h-4 mr-1" />
                    Ready to upload
                  </span>
                )}
              </div>
              
              <button
                type="submit"
                disabled={loading || !file || !zone}
                onClick={handleUpload}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>Upload Media</span>
                  </>
                )}
              </button>
            </div>
          {/* </form> */}
        </div>

        {/* Info Section */}
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Upload Guidelines
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Best Practices:</h4>
              <ul className="space-y-1">
                <li>• Ensure good lighting for clear visibility</li>
                <li>• Capture crowd density from elevated positions</li>
                <li>• Include timestamps when possible</li>
                <li>• Avoid blurry or low-quality media</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">What We Analyze:</h4>
              <ul className="space-y-1">
                <li>• Crowd density and flow patterns</li>
                <li>• Potential safety hazards</li>
                <li>• Emergency exit accessibility</li>
                <li>• Overall crowd behavior</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
