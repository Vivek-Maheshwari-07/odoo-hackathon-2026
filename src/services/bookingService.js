// src/services/bookingService.js
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

export const fetchAllBookings = (params = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
  ).toString();
  return apiFetch(`/bookings${qs ? `?${qs}` : ''}`);
};

export const fetchBookingById = (id) =>
  apiFetch(`/bookings/${id}`);

export const createBooking = (payload) =>
  apiFetch('/bookings', {
    method: 'POST',
    body:   JSON.stringify(payload),
  });

export const updateBooking = (id, payload) =>
  apiFetch(`/bookings/${id}`, {
    method: 'PUT',
    body:   JSON.stringify(payload),
  });

export const cancelBooking = (id) =>
  apiFetch(`/bookings/${id}`, { method: 'DELETE' });

export const fetchAllResources = (params = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
  ).toString();
  return apiFetch(`/resources${qs ? `?${qs}` : ''}`);
};
