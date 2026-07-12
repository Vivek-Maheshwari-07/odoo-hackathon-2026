// src/components/booking/BookingDetailsModal.jsx
import React from 'react';
import { X, MapPin, Calendar, Clock, User, FileText, AlignLeft } from 'lucide-react';
import StatusBadge from './StatusBadge';

const Row = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
    <div className="w-7 h-7 flex items-center justify-center rounded-md bg-blue-50 text-blue-600 flex-shrink-0 mt-0.5">
      <Icon size={14} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-slate-800 font-medium break-words">{value || '—'}</p>
    </div>
  </div>
);

const BookingDetailsModal = ({ isOpen, booking, onClose, onEdit, onCancel }) => {
  if (!isOpen || !booking) return null;

  const formatTime = (t) => {
    if (!t) return '—';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const canCancel = booking.status === 'Upcoming';
  const canEdit   = booking.status === 'Upcoming';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="details-modal-title"
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 id="details-modal-title" className="text-lg font-bold text-slate-800">
                Booking Details
              </h2>
              <StatusBadge status={booking.status} />
            </div>
            <p className="text-sm text-slate-500 font-semibold">{booking.resource_name}</p>
          </div>
          <button
            id="close-details-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-2">
          <Row icon={MapPin}     label="Location"    value={booking.location} />
          <Row icon={User}       label="Booked By"   value={`Employee #${booking.employee_id}`} />
          <Row icon={Calendar}   label="Date"        value={formatDate(booking.booking_date)} />
          <Row icon={Clock}      label="Time Slot"   value={`${formatTime(booking.start_time)} – ${formatTime(booking.end_time)}`} />
          <Row icon={FileText}   label="Purpose"     value={booking.purpose} />
          {booking.notes && <Row icon={AlignLeft} label="Notes" value={booking.notes} />}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          {canCancel && (
            <button
              id="cancel-booking-action-btn"
              onClick={() => onCancel?.(booking)}
              className="px-4 py-2.5 text-sm font-medium rounded-lg border border-red-300 text-red-600
                         hover:bg-red-50 active:bg-red-100 transition-colors"
            >
              Cancel Booking
            </button>
          )}
          {canEdit && (
            <button
              id="edit-booking-action-btn"
              onClick={() => onEdit?.(booking)}
              className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-blue-600 text-white
                         hover:bg-blue-700 transition-colors shadow-sm"
            >
              Edit Booking
            </button>
          )}
          {!canEdit && !canCancel && (
            <button
              id="close-details-action-btn"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-slate-100 text-slate-700
                         hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;
