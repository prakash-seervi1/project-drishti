import { useEffect, useState } from "react"
import { Brain } from "lucide-react"
import { agentAPI } from "../../services/adkApi"
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
    agentAPI.runAgent({ input: `Give me a current assessment of this incident. Summarize the key risks and status. Provide details for incidentId: ${incident.id}. In responce dont share ids insted share name or details`, sessionId: 'incident_assessment' })
      .then(res => {
        if (res && res.answer) {
          setAssessment(res.answer)
        } else if (res && res.result && res.result.response) {
          setAssessment(res.result.response)
        } else if (res && res.result) {
          setAssessment(typeof res.result === 'string' ? res.result : JSON.stringify(res.result))
        } else {
          setErrorAssessment("Failed to get assessment")
        }
      })
      .catch(err => setErrorAssessment(err.message || "Error fetching assessment"))
      .finally(() => setLoadingAssessment(false))

    setLoadingRecommendations(true)
    setErrorRecommendations("")
    setRecommendations("")
    agentAPI.runAgent({ input: `Provide actionable, prioritized AI recommendations for response, safety, and resource allocation for this incident. Provide details for incidentId: ${incident.id}. In responce dont share ids insted share name or details`, sessionId: 'incident_recommendations' })
      .then(res => {
        if (res && res.answer) {
          setRecommendations(res.answer)
        } else if (res && res.result && res.result.response) {
          setRecommendations(res.result.response)
        } else if (res && res.result) {
          setRecommendations(typeof res.result === 'string' ? res.result : JSON.stringify(res.result))
        } else {
          setErrorRecommendations("Failed to get recommendations")
        }
      })
      .catch(err => setErrorRecommendations(err.message || "Error fetching recommendations"))
      .finally(() => setLoadingRecommendations(false))
  }, [incident?.id, incident?.description])

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