import { useEffect, useState } from 'react'
import { Zap, AlertTriangle, MapPin, CheckCircle, Loader2, Brain, AlertCircle } from 'lucide-react'
import { api } from '../../services/adkApi'
import ReactMarkdown from 'react-markdown'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

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

const ACTION_COLORS = {
  dispatch_responder: "border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100",
  send_alert: "border-l-4 border-yellow-500 bg-gradient-to-r from-yellow-50 to-yellow-100",
  lockdown_zone: "border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-red-100",
};

const ACTION_ICONS = {
  dispatch_responder: Zap,
  send_alert: AlertTriangle,
  lockdown_zone: MapPin,
};

const ACTION_LABELS = {
  dispatch_responder: "Dispatch",
  send_alert: "Alert",
  lockdown_zone: "Lockdown",
};

const ACTION_BUTTON_STYLES = {
  dispatch_responder: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl",
  send_alert: "bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg hover:shadow-xl",
  lockdown_zone: "bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl",
};

export default function AISituationSummary({ availableTeams }) {
  const [actions, setActions] = useState([])
  const [resources, setResources] = useState([])
  const [loadingActions, setLoadingActions] = useState(false)
  const [loadingResources, setLoadingResources] = useState(false)
  const [errorActions, setErrorActions] = useState('')
  const [errorResources, setErrorResources] = useState('')
  const [executing, setExecuting] = useState({});

  useEffect(() => {
    let retriedActions = false;
    let retriedResources = false;
    setLoadingActions(true)
    setErrorActions('')
    setActions([])
    const fetchActions = () => {
      api.getAICommandActions()
        .then(res => {
          if (res && res.actions) {
            setActions(res.actions)
          } else if (Array.isArray(res)) {
            setActions(res)
          } else {
            if (!retriedActions) {
              retriedActions = true;
              fetchActions();
              return;
            }
            setErrorActions('Failed to get actions')
          }
        })
        .catch(err => {
          if (!retriedActions) {
            retriedActions = true;
            fetchActions();
            return;
          }
          setErrorActions(err.message || 'Error fetching actions')
        })
        .finally(() => setLoadingActions(false))
    };
    fetchActions();

    setLoadingResources(true)
    setErrorResources('')
    setResources([])
    const fetchResources = () => {
      api.getAIResourceRecommendations()
        .then(res => {
          if (res && res.resourceRecommendations) {
            setResources(res.resourceRecommendations)
          } else if (Array.isArray(res)) {
            setResources(res)
          } else {
            if (!retriedResources) {
              retriedResources = true;
              fetchResources();
              return;
            }
            setErrorResources('Failed to get resources')
          }
        })
        .catch(err => {
          if (!retriedResources) {
            retriedResources = true;
            fetchResources();
            return;
          }
          setErrorResources(err.message || 'Error fetching resources')
        })
        .finally(() => setLoadingResources(false))
    };
    fetchResources();
  }, [])

  // Calculate total needed units
  const totalNeeded = resources.reduce((sum, rec) => {
    if (rec.needed && rec.categories && rec.categories.length > 0) {
      return sum + rec.categories.reduce((catSum, cat) => catSum + (cat.count || 0), 0);
    }
    return sum;
  }, 0);

  // Optionally, fetch available teams if not passed as prop
  const [availableTeamsCount, setAvailableTeamsCount] = useState(availableTeams ?? null);
  useEffect(() => {
    if (availableTeams === undefined) {
      api.getAvailableResponders().then(res => {
        if (res && Array.isArray(res.responders)) setAvailableTeamsCount(res.responders.length);
        else setAvailableTeamsCount(null);
      }).catch(() => setAvailableTeamsCount(null));
    }
  }, [availableTeams]);

  const handleExecute = async (action, idx) => {
    setExecuting(prev => ({ ...prev, [idx]: "pending" }));
    try {
      // Simulate execution delay
      await new Promise(res => setTimeout(res, 1200));
      setExecuting(prev => ({ ...prev, [idx]: "success" }));
    } catch {
      setExecuting(prev => ({ ...prev, [idx]: "error" }));
    }
  };

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center space-x-2">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>Loading...</span>
    </div>
  );

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Brain className="w-6 h-6 text-green-500" />
        <h3 className="text-2xl font-bold text-gray-900">AI Recommendations & Actions</h3>
      </div>
      <div className="space-y-8">
        {/* Resource Recommendations */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <MapPin className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-orange-900">Resource Recommendations</h3>
          </div>
          <div className="mb-4 flex items-center space-x-4">
            <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
              Resource Gap: {totalNeeded} unit{totalNeeded === 1 ? '' : 's'} needed
            </span>
            {availableTeamsCount !== null && (
              <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                Available: {availableTeamsCount} team{availableTeamsCount === 1 ? '' : 's'}
              </span>
            )}
          </div>
          {loadingResources ? (
            <div className="text-orange-600 py-4">
              <LoadingSpinner />
            </div>
          ) : errorResources ? (
            <div className="text-red-600">{errorResources}</div>
          ) : resources && resources.length > 0 ? (
            <div className="overflow-y-auto max-h-[320px] pr-2">
              {resources.map((rec, idx) => (
                <div key={idx} className="mb-8 pb-6 border-b last:border-b-0 last:mb-0 last:pb-0 border-orange-100">
                  <div className="font-bold text-base text-orange-900 mb-2">
                    {rec.zoneId ? `Zone: ${rec.zoneId}` : rec.incidentId ? `Incident: ${rec.incidentId}` : "Situation"}
                  </div>
                  {rec.needed === false || !rec.categories || rec.categories.length === 0 ? (
                    <div className="flex items-center bg-green-50 border border-green-100 rounded-lg px-4 py-2 w-fit text-green-800 text-sm font-medium">
                      <CheckCircle className="w-4 h-4 mr-2" /> Sufficient
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm mt-2">
                        <thead>
                          <tr className="text-orange-700 bg-orange-50">
                            <th className="px-3 py-2 text-left font-semibold">Resource</th>
                            <th className="px-3 py-2 text-left font-semibold">Need</th>
                            <th className="px-3 py-2 text-left font-semibold">Reason</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rec.categories.map((cat, i) => (
                            <tr key={i} className="border-b last:border-b-0">
                              <td className="px-3 py-2 font-medium text-orange-900 whitespace-nowrap flex items-center">
                                <AlertTriangle className="w-4 h-4 mr-1 text-orange-500" /> {cat.type}
                              </td>
                              <td className="px-3 py-2">
                                <span className="inline-block bg-red-100 text-red-700 rounded px-2 py-0.5 text-xs font-semibold">Need {cat.count}</span>
                              </td>
                              <td className="px-3 py-2 text-orange-800 text-xs">{cat.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-orange-200 p-8 text-center">
              <MapPin className="w-16 h-16 text-orange-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Resource Recommendations</h4>
              <p className="text-gray-600">All zones have sufficient resources at this time</p>
            </div>
          )}
        </div>

        {/* Suggested Actions */}
        <div className="bg-blue-50 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Suggested Actions</h3>
          </div>
          {loadingActions ? (
            <div className="text-blue-600 py-4">
              <LoadingSpinner />
            </div>
          ) : errorActions ? (
            <div className="text-red-600">{errorActions}</div>
          ) : actions && actions.length > 0 ? (
            <div className="overflow-y-auto max-h-[320px] pr-2">
              <table className="min-w-full text-sm mt-2">
                <thead>
                  <tr className="text-blue-700 bg-blue-50">
                    <th className="px-3 py-2 text-left font-semibold w-[30%]">Action</th>
                    <th className="px-3 py-2 text-left font-semibold w-[50%]">Description</th>
                    <th className="px-3 py-2 text-center font-semibold w-[20%]">Execute</th>
                  </tr>
                </thead>
                <tbody>
                  {actions.map((action, idx) => {
                    const IconComponent = ACTION_ICONS[action.type] || Zap;
                    const executed = executing[idx] === "success";
                    const pending = executing[idx] === "pending";
                    const failed = executing[idx] === "error";
                    return (
                      <tr key={idx} className="border-b last:border-b-0 align-top">
                        <td className="px-3 py-2 font-medium text-blue-900 w-[30%] whitespace-normal break-words align-top flex items-center">
                          <IconComponent className="w-4 h-4 mr-1 text-blue-500 flex-shrink-0" />
                          <span className="whitespace-normal break-words">{action.label}</span>
                        </td>
                        <td className="px-3 py-2 text-blue-800 text-xs w-[50%] whitespace-normal break-words align-top">
                          <span className="whitespace-normal break-words block">{action.description}</span>
                        </td>
                        <td className="px-3 py-2 w-[20%] text-center align-top">
                          {pending ? (
                            <button className="px-4 py-1 rounded bg-gray-300 text-gray-700 font-medium flex items-center space-x-2 cursor-not-allowed" disabled>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Executing...</span>
                            </button>
                          ) : executed ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-4 h-4 mr-1" /> Executed
                            </span>
                          ) : failed ? (
                            <button
                              className="px-4 py-1 rounded bg-red-600 hover:bg-red-700 text-white font-medium transition-all"
                              onClick={() => handleExecute(action, idx)}
                            >
                              Retry
                            </button>
                          ) : (
                            <button
                              className="px-4 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all"
                              onClick={() => handleExecute(action, idx)}
                            >
                              Execute
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Zap className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No actions suggested by AI</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 