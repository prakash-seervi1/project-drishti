import { useState, useEffect, useCallback } from 'react';
import { incidentsAPI } from '../services/api';

export const useIncidents = (filters = {}) => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch incidents
  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await incidentsAPI.getAll(filters);
      setIncidents(response.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching incidents:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Refresh incidents
  const refresh = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await incidentsAPI.getAll(filters);
      setIncidents(response.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error refreshing incidents:', err);
    } finally {
      setRefreshing(false);
    }
  }, [filters]);

  // Create new incident
  const createIncident = useCallback(async (incidentData) => {
    try {
      setError(null);
      const response = await incidentsAPI.create(incidentData);
      setIncidents(prev => [response.data, ...prev]);
      return response;
    } catch (err) {
      setError(err.message);
      console.error('Error creating incident:', err);
      throw err;
    }
  }, []);

  // Update incident
  const updateIncident = useCallback(async (incidentId, updateData) => {
    try {
      setError(null);
      const response = await incidentsAPI.update(incidentId, updateData);
      setIncidents(prev => 
        prev.map(incident => 
          incident.id === incidentId 
            ? { ...incident, ...updateData }
            : incident
        )
      );
      return response;
    } catch (err) {
      setError(err.message);
      console.error('Error updating incident:', err);
      throw err;
    }
  }, []);

  // Delete incident
  const deleteIncident = useCallback(async (incidentId) => {
    try {
      setError(null);
      await incidentsAPI.delete(incidentId);
      setIncidents(prev => prev.filter(incident => incident.id !== incidentId));
    } catch (err) {
      setError(err.message);
      console.error('Error deleting incident:', err);
      throw err;
    }
  }, []);

  // Get incident by ID
  const getIncidentById = useCallback(async (incidentId) => {
    try {
      setError(null);
      const response = await incidentsAPI.getById(incidentId);
      return response.data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching incident:', err);
      throw err;
    }
  }, []);

  // Get incident notes
  const getIncidentNotes = useCallback(async (incidentId) => {
    try {
      setError(null);
      const response = await incidentsAPI.getNotes(incidentId);
      return response.data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching incident notes:', err);
      throw err;
    }
  }, []);

  // Add note to incident
  const addIncidentNote = useCallback(async (incidentId, noteData) => {
    try {
      setError(null);
      const response = await incidentsAPI.addNote(incidentId, noteData);
      return response;
    } catch (err) {
      setError(err.message);
      console.error('Error adding incident note:', err);
      throw err;
    }
  }, []);

  // Filter incidents by status
  const getIncidentsByStatus = useCallback((status) => {
    return incidents.filter(incident => incident.status === status);
  }, [incidents]);

  // Filter incidents by priority
  const getIncidentsByPriority = useCallback((priority) => {
    return incidents.filter(incident => incident.priority === priority);
  }, [incidents]);

  // Filter incidents by zone
  const getIncidentsByZone = useCallback((zone) => {
    return incidents.filter(incident => incident.zone === zone);
  }, [incidents]);

  // Get critical incidents
  const getCriticalIncidents = useCallback(() => {
    return incidents.filter(incident => incident.severity >= 4);
  }, [incidents]);

  // Get active incidents
  const getActiveIncidents = useCallback(() => {
    return incidents.filter(incident => 
      ['active', 'ongoing', 'investigating'].includes(incident.status)
    );
  }, [incidents]);

  // Get resolved incidents
  const getResolvedIncidents = useCallback(() => {
    return incidents.filter(incident => incident.status === 'resolved');
  }, [incidents]);

  // Calculate incident statistics
  const getIncidentStats = useCallback(() => {
    const total = incidents.length;
    const active = getActiveIncidents().length;
    const resolved = getResolvedIncidents().length;
    const critical = getCriticalIncidents().length;

    const byStatus = incidents.reduce((acc, incident) => {
      acc[incident.status] = (acc[incident.status] || 0) + 1;
      return acc;
    }, {});

    const byPriority = incidents.reduce((acc, incident) => {
      acc[incident.priority] = (acc[incident.priority] || 0) + 1;
      return acc;
    }, {});

    const byType = incidents.reduce((acc, incident) => {
      acc[incident.type] = (acc[incident.type] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      active,
      resolved,
      critical,
      byStatus,
      byPriority,
      byType
    };
  }, [incidents, getActiveIncidents, getResolvedIncidents, getCriticalIncidents]);

  // Initial fetch
  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        refresh();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loading, refresh]);

  return {
    // Data
    incidents,
    loading,
    error,
    refreshing,
    
    // Actions
    fetchIncidents,
    refresh,
    createIncident,
    updateIncident,
    deleteIncident,
    getIncidentById,
    getIncidentNotes,
    addIncidentNote,
    
    // Filters
    getIncidentsByStatus,
    getIncidentsByPriority,
    getIncidentsByZone,
    getCriticalIncidents,
    getActiveIncidents,
    getResolvedIncidents,
    
    // Statistics
    getIncidentStats
  };
}; 