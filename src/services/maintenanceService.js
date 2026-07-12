// src/services/maintenanceService.js
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

async function apiFetch(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultHeaders = { 'Content-Type': 'application/json' };

  const res = await fetch(url, {
    headers: { ...defaultHeaders, ...options.headers },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data.message || 'API request failed');
    err.statusCode = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

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
