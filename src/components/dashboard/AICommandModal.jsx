import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle, Shield, Users, Clock, CheckCircle, Loader2, Zap, MapPin, AlertCircle } from "lucide-react";

const ACTION_COLORS = {
  dispatch_responder: "border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100",
  send_alert: "border-l-4 border-yellow-500 bg-gradient-to-r from-yellow-50 to-yellow-100",
  lockdown_zone: "border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-red-100",
};

const ACTION_ICONS = {
  dispatch_responder: Users,
  send_alert: AlertTriangle,
  lockdown_zone: Shield,
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

export default function AICommandModal({ 
  open, 
  onClose, 
  summary, 
  actions, 
  resources, 
  loadingSummary, 
  loadingResources, 
  loadingActions, 
  error, 
  onAction, 
  showToast 
}) {
  const [executing, setExecuting] = useState({});

  if (!open) return null;

  const handleExecute = async (action, idx) => {
    setExecuting(prev => ({ ...prev, [idx]: "pending" }));
    try {
      await onAction(action, idx, (msg, type) => {
        if (showToast) showToast(msg, type);
      });
      setExecuting(prev => ({ ...prev, [idx]: "success" }));
    } catch (err) {
      setExecuting(prev => ({ ...prev, [idx]: "error" }));
      if (showToast) showToast("Failed to execute action: " + (err && err.message ? err.message : "Unknown error"), "error");
    }
  };

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center space-x-2">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>Loading...</span>
    </div>
  );

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl relative max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-full p-3">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">AI Command Center</h2>
              <p className="text-blue-100">Emergency Response Management System</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">System Error</h3>
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Situation Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-100 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-900">Situation Summary</h3>
                </div>
                {loadingSummary ? (
                  <div className="text-blue-600 py-4">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-lg border border-blue-200 shadow-sm min-h-[80px]">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-line text-sm">
                      {summary || "No summary available"}
                    </p>
                  </div>
                )}
              </div>

              {/* Resource Recommendations */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-orange-900">Resource Recommendations</h3>
                </div>
                {loadingResources ? (
                  <div className="text-orange-600 py-4">
                    <LoadingSpinner />
                  </div>
                ) : resources && resources.length > 0 ? (
                  <div className="grid gap-4">
                    {resources.map((rec, idx) => (
                      <div key={idx} className="bg-white rounded-xl p-6 border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="bg-orange-100 rounded-full p-2">
                              <MapPin className="w-4 h-4 text-orange-600" />
                            </div>
                            <h4 className="font-semibold text-orange-900 text-lg">
                            {rec.zoneId ? `Zone: ${rec.zoneId}` : rec.incidentId ? `Incident: ${rec.incidentId}` : "Situation"}
                            </h4>
                          </div>
                          {rec.needed === false && (
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                              <CheckCircle className="w-3 h-3" />
                              <span>
                              Sufficient
                              </span>
                            </span>
                          )}
                        </div>
                        {rec.needed && rec.categories && rec.categories.length > 0 ? (
                          <div className="space-y-3">
                            {rec.categories.map((cat, i) => (
                              <div key={i} className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <AlertTriangle className="w-4 h-4 text-red-600" />
                                      <span className="font-semibold text-red-900">{cat.type}</span>
                                    </div>
                                    {cat.reason && (
                                      <p className="text-sm text-red-700 bg-red-50 p-2 rounded border border-red-200">
                                        <strong>Reason:</strong> {cat.reason}
                                      </p>
                                    )}
                                  </div>
                                  <div className="ml-4">
                                    <span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-sm">
                                      Need {cat.count}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center space-x-3 text-green-700">
                              <CheckCircle className="w-5 h-5" />
                              <span className="font-medium">No additional resources needed</span>
                            </div>
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
                ) : actions && actions.length > 0 ? (
                  <div className="space-y-4">
                    {actions.map((action, idx) => {
                      const colorClass = ACTION_COLORS[action.type] || "border-l-4 border-gray-400 bg-gradient-to-r from-gray-50 to-gray-100";
                      const IconComponent = ACTION_ICONS[action.type] || Zap;
                      const executed = executing[idx] === "success";
                      const pending = executing[idx] === "pending";
                      const failed = executing[idx] === "error";

                      return (
                        <div key={idx} className={`${colorClass} rounded-lg shadow-sm border border-gray-200 overflow-hidden`}>
                          <div className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-3">
                                  <div className={`p-2 rounded-full ${
                                    action.type === "dispatch_responder" ? "bg-blue-100 text-blue-600" :
                                    action.type === "send_alert" ? "bg-yellow-100 text-yellow-600" :
                                    "bg-red-100 text-red-600"
                                  }`}>
                                    <IconComponent className="w-5 h-5" />
                                  </div>
                                  <h4 className="text-lg font-semibold text-gray-900">{action.label}</h4>
                                </div>
                                <p className="text-gray-700 mb-4">{action.description}</p>
                                
                                {/* Action-specific details */}
                                {action.type === "dispatch_responder" && action.parameters && (
                                  <div className="bg-blue-50 p-3 rounded-lg">
                                    <div className="flex items-center space-x-4 text-sm">
                                      <div>
                                        <span className="font-medium text-blue-900">Responder:</span>
                                        <span className="ml-1 text-blue-800">{action.parameters.responderName}</span>
                                      </div>
                                      <div>
                                        <span className="font-medium text-blue-900">Type:</span>
                                        <span className="ml-1 text-blue-800">{action.parameters.responderType}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                {action.type === "lockdown_zone" && action.parameters && (
                                  <div className="bg-red-50 p-3 rounded-lg">
                                    <div className="text-sm">
                                      <span className="font-medium text-red-900">Lockdown Reason:</span>
                                      <span className="ml-1 text-red-800">{action.parameters.reason}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              <div className="ml-6 flex-shrink-0">
                                {pending ? (
                                  <button className="px-6 py-3 rounded-lg bg-gray-300 text-gray-700 font-semibold flex items-center space-x-2 cursor-not-allowed" disabled>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Executing...</span>
                                  </button>
                                ) : executed ? (
                                  <div className="px-6 py-3 rounded-lg bg-green-600 text-white font-semibold flex items-center space-x-2">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Executed</span>
                                  </div>
                                ) : failed ? (
                                  <button
                                    className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-all transform hover:scale-105"
                                    onClick={() => handleExecute(action, idx)}
                                  >
                                    Retry
                                  </button>
                                ) : (
                                  <button
                                    className={`px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${ACTION_BUTTON_STYLES[action.type] || "bg-gray-600 hover:bg-gray-700 text-white"}`}
                                    onClick={() => handleExecute(action, idx)}
                                  >
                                    {ACTION_LABELS[action.type] || "Execute"}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Zap className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No actions suggested by AI</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}