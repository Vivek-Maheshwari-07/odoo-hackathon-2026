// src/services/bookingService.js
import { apiFetch } from '../utils/api';

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
