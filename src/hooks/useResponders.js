import { useState, useEffect, useCallback } from 'react';
import { respondersAPI } from '../services/api';

export const useResponders = () => {
  const [responders, setResponders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch responders
  const fetchResponders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await respondersAPI.getAll();
      setResponders(response.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching responders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh responders
  const refresh = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await respondersAPI.getAll();
      setResponders(response.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error refreshing responders:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Update responder
  const updateResponder = useCallback(async (responderId, updateData) => {
    try {
      setError(null);
      const response = await respondersAPI.update(responderId, updateData);
      setResponders(prev => 
        prev.map(responder => 
          responder.id === responderId 
            ? { ...responder, ...updateData }
            : responder
        )
      );
      return response;
    } catch (err) {
      setError(err.message);
      console.error('Error updating responder:', err);
      throw err;
    }
  }, []);

  // Assign responder to incident
  const assignToIncident = useCallback(async (responderId, incidentId, eta) => {
    try {
      setError(null);
      const response = await respondersAPI.assignToIncident(responderId, incidentId, eta);
      setResponders(prev => 
        prev.map(responder => 
          responder.id === responderId 
            ? { 
                ...responder, 
                assignedIncident: incidentId,
                status: 'en_route',
                eta
              }
            : responder
        )
      );
      return response;
    } catch (err) {
      setError(err.message);
      console.error('Error assigning responder:', err);
      throw err;
    }
  }, []);

  // Unassign responder
  const unassignResponder = useCallback(async (responderId) => {
    try {
      setError(null);
      await respondersAPI.unassign(responderId);
      setResponders(prev => 
        prev.map(responder => 
          responder.id === responderId 
            ? { 
                ...responder, 
                assignedIncident: null,
                status: 'available',
                eta: null
              }
            : responder
        )
      );
    } catch (err) {
      setError(err.message);
      console.error('Error unassigning responder:', err);
      throw err;
    }
  }, []);

  // Update responder position
  const updatePosition = useCallback(async (responderId, position) => {
    try {
      setError(null);
      const response = await respondersAPI.updatePosition(responderId, position);
      setResponders(prev => 
        prev.map(responder => 
          responder.id === responderId 
            ? { 
                ...responder, 
                position: {
                  ...responder.position,
                  ...position,
                  lastUpdate: new Date()
                }
              }
            : responder
        )
      );
      return response;
    } catch (err) {
      setError(err.message);
      console.error('Error updating responder position:', err);
      throw err;
    }
  }, []);

  // Get responder by ID
  const getResponderById = useCallback(async (responderId) => {
    try {
      setError(null);
      const response = await respondersAPI.getById(responderId);
      return response.data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching responder:', err);
      throw err;
    }
  }, []);

  // Get available responders
  const getAvailableResponders = useCallback(async (type = null) => {
    try {
      setError(null);
      const response = await respondersAPI.getAvailable(type);
      return response.data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching available responders:', err);
      throw err;
    }
  }, []);

  // Get responder analytics
  const getAnalytics = useCallback(async () => {
    try {
      setError(null);
      const response = await respondersAPI.getAnalytics();
      return response.data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching responder analytics:', err);
      throw err;
    }
  }, []);

  // Filter responders by status
  const getRespondersByStatus = useCallback((status) => {
    return responders.filter(responder => responder.status === status);
  }, [responders]);

  // Filter responders by type
  const getRespondersByType = useCallback((type) => {
    return responders.filter(responder => responder.type === type);
  }, [responders]);

  // Get available responders
  const getAvailable = useCallback(() => {
    return responders.filter(responder => responder.status === 'available');
  }, [responders]);

  // Get en route responders
  const getEnRoute = useCallback(() => {
    return responders.filter(responder => responder.status === 'en_route');
  }, [responders]);

  // Get on scene responders
  const getOnScene = useCallback(() => {
    return responders.filter(responder => responder.status === 'on_scene');
  }, [responders]);

  // Get assigned responders
  const getAssigned = useCallback(() => {
    return responders.filter(responder => responder.assignedIncident);
  }, [responders]);

  // Get responders by incident
  const getRespondersByIncident = useCallback((incidentId) => {
    return responders.filter(responder => responder.assignedIncident === incidentId);
  }, [responders]);

  // Get responders with low battery
  const getLowBatteryResponders = useCallback((threshold = 20) => {
    return responders.filter(responder => 
      responder.equipment && 
      responder.equipment.batteryLevel <= threshold
    );
  }, [responders]);

  // Get responders with poor signal
  const getPoorSignalResponders = useCallback((threshold = 2) => {
    return responders.filter(responder => 
      responder.equipment && 
      responder.equipment.signalStrength <= threshold
    );
  }, [responders]);

  // Calculate responder statistics
  const getResponderStats = useCallback(() => {
    const total = responders.length;
    const available = getAvailable().length;
    const enRoute = getEnRoute().length;
    const onScene = getOnScene().length;
    const assigned = getAssigned().length;

    const byType = responders.reduce((acc, responder) => {
      acc[responder.type] = (acc[responder.type] || 0) + 1;
      return acc;
    }, {});

    const byStatus = responders.reduce((acc, responder) => {
      acc[responder.status] = (acc[responder.status] || 0) + 1;
      return acc;
    }, {});

    const lowBattery = getLowBatteryResponders().length;
    const poorSignal = getPoorSignalResponders().length;

    const averageBattery = responders.reduce((sum, responder) => {
      return sum + (responder.equipment?.batteryLevel || 0);
    }, 0) / total;

    const averageSignal = responders.reduce((sum, responder) => {
      return sum + (responder.equipment?.signalStrength || 0);
    }, 0) / total;

    return {
      total,
      available,
      enRoute,
      onScene,
      assigned,
      byType,
      byStatus,
      lowBattery,
      poorSignal,
      averageBattery: Math.round(averageBattery),
      averageSignal: Math.round(averageSignal)
    };
  }, [responders, getAvailable, getEnRoute, getOnScene, getAssigned, getLowBatteryResponders, getPoorSignalResponders]);

  // Initial fetch
  useEffect(() => {
    fetchResponders();
  }, [fetchResponders]);

  // Auto-refresh every 5 seconds for real-time tracking
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        refresh();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [loading, refresh]);

  return {
    // Data
    responders,
    loading,
    error,
    refreshing,
    
    // Actions
    fetchResponders,
    refresh,
    updateResponder,
    assignToIncident,
    unassignResponder,
    updatePosition,
    getResponderById,
    getAvailableResponders,
    getAnalytics,
    
    // Filters
    getRespondersByStatus,
    getRespondersByType,
    getAvailable,
    getEnRoute,
    getOnScene,
    getAssigned,
    getRespondersByIncident,
    getLowBatteryResponders,
    getPoorSignalResponders,
    
    // Statistics
    getResponderStats
  };
}; 