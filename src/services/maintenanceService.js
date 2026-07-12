// src/services/maintenanceService.js
import { apiFetch } from '../utils/api';

export const fetchMaintenanceStats = () =>
  apiFetch('/maintenance/stats');

export const fetchAllRequests = (params = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
  ).toString();
  return apiFetch(`/maintenance${qs ? `?${qs}` : ''}`);
};

export const fetchRequestById = (id) =>
  apiFetch(`/maintenance/${id}`);

export const createMaintenanceRequest = (payload) =>
  apiFetch('/maintenance', {
    method: 'POST',
    body:   JSON.stringify(payload),
  });

export const updateMaintenanceRequest = (id, payload) =>
  apiFetch(`/maintenance/${id}`, {
    method: 'PUT',
    body:   JSON.stringify(payload),
  });

export const updateRequestStatus = (id, payload) =>
  apiFetch(`/maintenance/${id}/status`, {
    method: 'PUT',
    body:   JSON.stringify(payload),
  });

export const deleteMaintenanceRequest = (id) =>
  apiFetch(`/maintenance/${id}`, { method: 'DELETE' });

export const addComment = (id, payload) =>
  apiFetch(`/maintenance/${id}/comments`, {
    method: 'POST',
    body:   JSON.stringify(payload),
  });

export const fetchAllocatedAssets = () =>
  apiFetch('/assets?status=Allocated');
