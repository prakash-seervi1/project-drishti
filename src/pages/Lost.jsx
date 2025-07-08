import { useState } from "react"
import {
  ArrowLeft,
  Search,
  Upload,
  ImageIcon,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react"
import { Link } from "react-router-dom"

export default function Lost() {
  const [description, setDescription] = useState("")
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true)
    else if (e.type === "dragleave") setDragActive(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file?.type?.startsWith("image/")) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!image || !description.trim()) return


    const formData = new FormData()
    formData.append("description", description.trim())
    formData.append("image", image)



    setLoading(true)
    setResult(null)
    try {
        const res = await fetch(
          "https://us-central1-project-drishti-mvp-31f1b.cloudfunctions.net/lostAndFound2",
          {
            method: "POST",
            body: formData,
          }
        )
      
        const isJSON = res.headers.get("content-type")?.includes("application/json")
        const data = isJSON ? await res.json() : { message: await res.text() }
      
        setResult({
          success: res.ok,
          message: data.message || "No response received",
          timestamp: new Date(),
        })
      } catch (err) {
        console.error("Error:", err)
        setResult({
          success: false,
          message: "Error searching for match. Please try again.",
          timestamp: new Date(),
        })
      }
       finally {
      setLoading(false)
    }
  }

  const clearForm = () => {
    setDescription("")
    setImage(null)
    setPreview("")
    setResult(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-8 text-white">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <Search className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Lost & Found Search</h1>
                <p className="text-orange-100 mt-2">
                  AI-powered person identification and matching system
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  <ImageIcon className="w-5 h-5 inline mr-2" />
                  Upload Photo
                </label>

                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    dragActive
                      ? "border-orange-500 bg-orange-50"
                      : preview
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 hover:border-orange-400 hover:bg-orange-50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />

                  {preview ? (
                    <div className="space-y-4">
                      <img
                        src={preview}
                        alt="Preview"
                        className="mx-auto rounded-lg shadow-lg max-w-xs h-48 object-cover"
                      />
                      <div className="flex items-center justify-center text-green-700 space-x-2">
                        <CheckCircle className="w-5 h-5" />
                        <span>Image uploaded</span>
                      </div>
                      <button
                        type="button"
                        onClick={clearForm}
                        className="text-sm text-gray-600 hover:text-gray-800 underline"
                      >
                        Remove image
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
                        <Upload className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-gray-900">
                          Drop your image here, or <span className="text-orange-600">browse</span>
                        </p>
                        <p className="text-sm text-gray-500 mt-1">Supports JPG, PNG, GIF up to 10MB</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  <User className="w-5 h-5 inline mr-2" />
                  Person Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  maxLength={500}
                  placeholder="Example: Male, ~30 yrs, red shirt, blue jeans, seen near Gate 3 around 2:00 PM"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
                />
                <p className="text-sm text-gray-600 mt-2">
                  💡 Tip: Include age, clothing, accessories, and last known location
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={loading || !image || !description.trim()}
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-medium rounded-lg hover:from-orange-700 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Search for Match
                    </>
                  )}
                </button>

                {(image || description) && (
                  <button
                    type="button"
                    onClick={clearForm}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                  >
                    Clear Form
                  </button>
                )}
              </div>
            </form>

            {result && (
              <div className="mt-8 animate-fade-in">
                <div
                  className={`p-6 rounded-xl border-2 ${
                    result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {result.success ? (
                      <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold mb-2 ${result.success ? "text-green-900" : "text-red-900"}`}>
                        {result.success ? "Search Results" : "Search Failed"}
                      </h3>
                      <p className={`text-sm leading-relaxed ${result.success ? "text-green-800" : "text-red-800"}`}>
                        {result.message}
                      </p>
                      <div className="flex items-center space-x-2 mt-3 text-xs text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>Search completed at {result.timestamp.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
