import { useEffect, useState } from 'react'
import { Brain } from 'lucide-react'
import { incidentsAPI } from '../../services/api'
import ReactMarkdown from 'react-markdown'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export default function AISituationSummary() {
  const [assessment, setAssessment] = useState('')
  const [recommendations, setRecommendations] = useState('')
  const [loadingAssessment, setLoadingAssessment] = useState(false)
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)
  const [errorAssessment, setErrorAssessment] = useState('')
  const [errorRecommendations, setErrorRecommendations] = useState('')

  useEffect(() => {
    setLoadingAssessment(true)
    setErrorAssessment('')
    setAssessment('')
    incidentsAPI.getAIResponse({ query: 'Give me a current assessment of the overall situation for all active incidents, zones, and responders. Summarize the key risks and status.' })
      .then(res => {
        if (res.success) {
          setAssessment(res.response)
        } else {
          setErrorAssessment(res.error || 'Failed to get assessment')
        }
      })
      .catch(err => setErrorAssessment(err.message || 'Error fetching assessment'))
      .finally(() => setLoadingAssessment(false))

    setLoadingRecommendations(true)
    setErrorRecommendations('')
    setRecommendations('')
    incidentsAPI.getAIResponse({ query: 'Provide actionable, prioritized AI recommendations for safety, resource allocation, and incident response for the current event situation.' })
      .then(res => {
        if (res.success) {
          setRecommendations(res.response)
        } else {
          setErrorRecommendations(res.error || 'Failed to get recommendations')
        }
      })
      .catch(err => setErrorRecommendations(err.message || 'Error fetching recommendations'))
      .finally(() => setLoadingRecommendations(false))
  }, [])

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <Brain className="w-6 h-6 mr-2 text-green-500" />
        AI Situation Summary
      </h2>
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="font-medium text-blue-900 mb-2">Current Assessment</div>
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
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="font-medium text-green-900 mb-2">AI Recommendations</div>
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