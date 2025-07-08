import { useState, useEffect, useCallback } from 'react';
import { zonesAPI } from '../services/api';

export const useZones = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch zones
  const fetchZones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await zonesAPI.getAll();
      setZones(response.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching zones:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh zones
  const refresh = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await zonesAPI.getAll();
      setZones(response.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error refreshing zones:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Update zone
  const updateZone = useCallback(async (zoneId, updateData) => {
    try {
      setError(null);
      const response = await zonesAPI.update(zoneId, updateData);
      setZones(prev => 
        prev.map(zone => 
          zone.id === zoneId 
            ? { ...zone, ...updateData }
            : zone
        )
      );
      return response;
    } catch (err) {
      setError(err.message);
      console.error('Error updating zone:', err);
      throw err;
    }
  }, []);

  // Get zone by ID
  const getZoneById = useCallback(async (zoneId) => {
    try {
      setError(null);
      const response = await zonesAPI.getById(zoneId);
      return response.data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching zone:', err);
      throw err;
    }
  }, []);

  // Get zone sensors
  const getZoneSensors = useCallback(async (zoneId, type = null) => {
    try {
      setError(null);
      const response = await zonesAPI.getSensors(zoneId, type);
      return response.data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching zone sensors:', err);
      throw err;
    }
  }, []);

  // Add sensor reading
  const addSensorReading = useCallback(async (zoneId, sensorData) => {
    try {
      setError(null);
      const response = await zonesAPI.addSensorReading(zoneId, sensorData);
      return response;
    } catch (err) {
      setError(err.message);
      console.error('Error adding sensor reading:', err);
      throw err;
    }
  }, []);

  // Get zone analytics
  const getZoneAnalytics = useCallback(async (zoneId, days = 7) => {
    try {
      setError(null);
      const response = await zonesAPI.getAnalytics(zoneId, days);
      return response.data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching zone analytics:', err);
      throw err;
    }
  }, []);

  // Filter zones by status
  const getZonesByStatus = useCallback((status) => {
    return zones.filter(zone => zone.status === status);
  }, [zones]);

  // Get zones with high occupancy
  const getHighOccupancyZones = useCallback((threshold = 80) => {
    return zones.filter(zone => 
      zone.capacity && 
      zone.capacity.crowdDensity >= threshold
    );
  }, [zones]);

  // Get critical zones
  const getCriticalZones = useCallback(() => {
    return zones.filter(zone => zone.status === 'critical');
  }, [zones]);

  // Get normal zones
  const getNormalZones = useCallback(() => {
    return zones.filter(zone => zone.status === 'normal');
  }, [zones]);

  // Get active zones
  const getActiveZones = useCallback(() => {
    return zones.filter(zone => zone.status === 'active');
  }, [zones]);

  // Calculate zone statistics
  const getZoneStats = useCallback(() => {
    const total = zones.length;
    const normal = getNormalZones().length;
    const active = getActiveZones().length;
    const critical = getCriticalZones().length;

    const totalOccupancy = zones.reduce((sum, zone) => {
      return sum + (zone.capacity?.currentOccupancy || 0);
    }, 0);

    const totalCapacity = zones.reduce((sum, zone) => {
      return sum + (zone.capacity?.maxOccupancy || 0);
    }, 0);

    const averageOccupancy = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;

    const byStatus = zones.reduce((acc, zone) => {
      acc[zone.status] = (acc[zone.status] || 0) + 1;
      return acc;
    }, {});

    const highOccupancy = getHighOccupancyZones().length;

    return {
      total,
      normal,
      active,
      critical,
      totalOccupancy,
      totalCapacity,
      averageOccupancy,
      highOccupancy,
      byStatus
    };
  }, [zones, getNormalZones, getActiveZones, getCriticalZones, getHighOccupancyZones]);

  // Update zone occupancy
  const updateZoneOccupancy = useCallback(async (zoneId, currentOccupancy) => {
    try {
      const zone = zones.find(z => z.id === zoneId);
      if (!zone) throw new Error('Zone not found');

      const maxOccupancy = zone.capacity?.maxOccupancy || 1000;
      const crowdDensity = Math.round((currentOccupancy / maxOccupancy) * 100);

      // Determine status based on occupancy
      let status = zone.status;
      if (crowdDensity >= 90) status = 'critical';
      else if (crowdDensity >= 70) status = 'active';
      else status = 'normal';

      await updateZone(zoneId, {
        capacity: {
          ...zone.capacity,
          currentOccupancy,
          crowdDensity
        },
        status
      });
    } catch (err) {
      setError(err.message);
      console.error('Error updating zone occupancy:', err);
      throw err;
    }
  }, [zones, updateZone]);

  // Initial fetch
  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  // Auto-refresh every 10 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        refresh();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [loading, refresh]);

  return {
    // Data
    zones,
    loading,
    error,
    refreshing,
    
    // Actions
    fetchZones,
    refresh,
    updateZone,
    getZoneById,
    getZoneSensors,
    addSensorReading,
    getZoneAnalytics,
    updateZoneOccupancy,
    
    // Filters
    getZonesByStatus,
    getHighOccupancyZones,
    getCriticalZones,
    getNormalZones,
    getActiveZones,
    
    // Statistics
    getZoneStats
  };
}; 