import { useEffect, useState } from 'react'
import { AlertTriangle, Brain, CheckCircle } from 'lucide-react'
import { agentAPI } from '../../services/adkApi'
import ReactMarkdown from 'react-markdown'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

// Helper to robustly detect a Markdown table
function isMarkdownTable(md) {
  const lines = md.trim().split('\n');
  if (lines.length < 2) return false;
  // Table header: | ... |, separator: | --- | --- | (or similar)
  return (
    /^\s*\|.*\|\s*$/.test(lines[0]) &&
    /^\s*\|?(\s*:?-+:?\s*\|)+\s*$/.test(lines[1])
  );
}

// Helper to parse markdown table string to array of objects
function parseMarkdownTable(md) {
  const lines = md.trim().split('\n').filter(l => l.trim().length > 0);
  if (lines.length < 3) return null;
  const headers = lines[0].split('|').map(h => h.trim()).filter(Boolean);
  const rows = lines.slice(2).map(line =>
    line.split('|').map(cell => cell.trim()).filter(Boolean)
  );
  return { headers, rows };
}

function TableFromMarkdown({ md }) {
  const parsed = parseMarkdownTable(md);
  if (!parsed) return <ReactMarkdown>{md}</ReactMarkdown>;
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 my-2">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100">
          <tr>
            {parsed.headers.map((h, i) => (
              <th key={i} className="px-4 py-2 font-semibold text-gray-700 border-b">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {parsed.rows.map((row, i) => (
            <tr key={i} className="even:bg-gray-50">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2 border-b text-gray-900 whitespace-nowrap">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AISimpleSummary() {
  const [assessment, setAssessment] = useState('')
  const [recommendations, setRecommendations] = useState('')
  const [loadingAssessment, setLoadingAssessment] = useState(false)
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)
  const [errorAssessment, setErrorAssessment] = useState('')
  const [errorRecommendations, setErrorRecommendations] = useState('')

  useEffect(() => {
    let retriedAssessment = false;
    let retriedRecommendations = false;
    setLoadingAssessment(true)
    setErrorAssessment('')
    setAssessment('')
    const fetchAssessment = () => {
      agentAPI.runAgent({ input: 'Fetch the latest data, Give me a current assessment of the overall situation for all active incidents, zones, and responders. Summarize the key risks and status. dont share any bussiness logic or code . And dont send responce like Fetching active incidents. Fetching zone information. Fetching responder information ', sessionId: 'simple_summary' })
        .then(res => {
          if (res && res.answer) {
            setAssessment(res.answer)
          } else if (res && res.result && res.result.response) {
            setAssessment(res.result.response)
          } else if (res && res.result) {
            setAssessment(typeof res.result === 'string' ? res.result : JSON.stringify(res.result))
          } else {
            if (!retriedAssessment) {
              retriedAssessment = true;
              fetchAssessment();
              return;
            }
            setErrorAssessment('Failed to get assessment')
          }
        })
        .catch(err => {
          if (!retriedAssessment) {
            retriedAssessment = true;
            fetchAssessment();
            return;
          }
          setErrorAssessment(err.message || 'Error fetching assessment')
        })
        .finally(() => setLoadingAssessment(false))
    };
    fetchAssessment();

    setLoadingRecommendations(true)
    setErrorRecommendations('')
    setRecommendations('')
    const fetchRecommendations = () => {
      agentAPI.runAgent({ input: 'Fetch the latest data Provide actionable, prioritized AI recommendations for safety, resource allocation, and incident response for the current event situation. Dont share any bussiness logic or code .', sessionId: 'simple_Recommendations' })
        .then(res => {
          if (res && res.answer) {
            setRecommendations(res.answer)
          } else if (res && res.result && res.result.response) {
            setRecommendations(res.result.response)
          } else if (res && res.result) {
            setRecommendations(typeof res.result === 'string' ? res.result : JSON.stringify(res.result))
          } else {
            if (!retriedRecommendations) {
              retriedRecommendations = true;
              fetchRecommendations();
              return;
            }
            setErrorRecommendations('Failed to get recommendations')
          }
        })
        .catch(err => {
          if (!retriedRecommendations) {
            retriedRecommendations = true;
            fetchRecommendations();
            return;
          }
          setErrorRecommendations(err.message || 'Error fetching recommendations')
        })
        .finally(() => setLoadingRecommendations(false))
    };
    fetchRecommendations();
  }, [])

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <Brain className="w-6 h-6 mr-2 text-green-500" />
        AI Situation Summary
      </h2>
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Situation Summary</h3>
          </div>
          {loadingAssessment ? (
            <Skeleton count={3} height={20} className="mb-2" />
          ) : errorAssessment ? (
            <div className="text-red-600">{errorAssessment}</div>
          ) : (
            <div className="prose prose-blue max-w-none overflow-y-auto" style={{ maxHeight: 240 }}>
              {assessment && isMarkdownTable(assessment)
                ? <TableFromMarkdown md={assessment} />
                : <ReactMarkdown>{assessment}</ReactMarkdown>}
            </div>
          )}
        </div>
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-900">AI Recommendations</span>
          </div>
          {loadingRecommendations ? (
            <Skeleton count={4} height={20} className="mb-2" />
          ) : errorRecommendations ? (
            <div className="text-red-600">{errorRecommendations}</div>
          ) : (
            <div className="prose prose-green max-w-none overflow-y-auto" style={{ maxHeight: 240 }}>
              {recommendations && isMarkdownTable(recommendations)
                ? <TableFromMarkdown md={recommendations} />
                : <ReactMarkdown>{recommendations}</ReactMarkdown>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 