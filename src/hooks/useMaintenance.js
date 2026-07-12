// src/hooks/useMaintenance.js
import { useState, useEffect, useCallback } from 'react';
import {
  fetchAllRequests,
  fetchMaintenanceStats,
  updateRequestStatus,
  deleteMaintenanceRequest,
} from '../services/maintenanceService';

const useMaintenance = () => {
  const [requests,   setRequests]   = useState([]);
  const [stats,      setStats]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [reqRes, statsRes] = await Promise.all([
        fetchAllRequests(),
        fetchMaintenanceStats(),
      ]);
      setRequests(reqRes.data  ?? []);
      setStats(statsRes.data   ?? null);
    } catch (err) {
      setError(err.message || 'Failed to load maintenance data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const changeStatus = useCallback(async (id, payload) => {
    const res = await updateRequestStatus(id, payload);
    await loadAll();
    return res;
  }, [loadAll]);

  const remove = useCallback(async (id) => {
    await deleteMaintenanceRequest(id);
    await loadAll();
  }, [loadAll]);

  return { requests, stats, loading, error, refresh: loadAll, changeStatus, remove };
};

export default useMaintenance;
