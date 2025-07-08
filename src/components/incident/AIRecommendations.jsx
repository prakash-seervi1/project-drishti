import { useEffect, useState } from "react"
import { Brain } from "lucide-react"
import { incidentsAPI } from "../../services/api"
import ReactMarkdown from "react-markdown"
import Skeleton from "react-loading-skeleton"
import 'react-loading-skeleton/dist/skeleton.css'

export default function AIRecommendations({ incident }) {
  const [assessment, setAssessment] = useState("")
  const [recommendations, setRecommendations] = useState("")
  const [loadingAssessment, setLoadingAssessment] = useState(false)
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)
  const [errorAssessment, setErrorAssessment] = useState("")
  const [errorRecommendations, setErrorRecommendations] = useState("")

  useEffect(() => {
    if (!incident?.id) return
    setLoadingAssessment(true)
    setErrorAssessment("")
    setAssessment("")
    incidentsAPI.getAIResponse({ query: 'Give me a current assessment of this incident. Summarize the key risks and status.', incidentId: incident.id })
      .then(res => {
        if (res.success) {
          setAssessment(res.response)
        } else {
          setErrorAssessment(res.error || "Failed to get assessment")
        }
      })
      .catch(err => setErrorAssessment(err.message || "Error fetching assessment"))
      .finally(() => setLoadingAssessment(false))

    setLoadingRecommendations(true)
    setErrorRecommendations("")
    setRecommendations("")
    incidentsAPI.getAIResponse({ query: 'Provide actionable, prioritized AI recommendations for response, safety, and resource allocation for this incident.', incidentId: incident.id })
      .then(res => {
        if (res.success) {
          setRecommendations(res.response)
        } else {
          setErrorRecommendations(res.error || "Failed to get recommendations")
        }
      })
      .catch(err => setErrorRecommendations(err.message || "Error fetching recommendations"))
      .finally(() => setLoadingRecommendations(false))
  }, [incident?.id])

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Brain className="w-5 h-5 mr-2 text-green-500" />
        AI Recommendations
      </h3>
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 min-h-[80px] max-h-96 overflow-y-auto">
          <div className="mb-2 text-blue-900 font-medium">Current Assessment</div>
          {loadingAssessment ? (
            <Skeleton count={3} height={20} className="mb-2" />
          ) : errorAssessment ? (
            <div className="text-red-600">{errorAssessment}</div>
          ) : (
            <div className="prose prose-blue max-w-none">
              <ReactMarkdown>{assessment}</ReactMarkdown>
            </div>
          )}
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 min-h-[80px] max-h-96 overflow-y-auto">
          <div className="mb-2 text-green-900 font-medium">AI Recommendations</div>
          {loadingRecommendations ? (
            <Skeleton count={4} height={20} className="mb-2" />
          ) : errorRecommendations ? (
            <div className="text-red-600">{errorRecommendations}</div>
          ) : (
            <div className="prose prose-green max-w-none">
              <ReactMarkdown>{recommendations}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 