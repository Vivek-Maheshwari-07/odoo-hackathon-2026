// src/pages/ResourceBooking.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus, Search, RefreshCw, LayoutList, CalendarDays,
  Bell, X, CheckCircle, AlertTriangle, Info,
  CalendarCheck, Clock, Ban, Archive,
} from 'lucide-react';

import { fetchAllBookings, fetchAllResources, cancelBooking } from '../services/bookingService';
import BookingTable       from '../components/booking/BookingTable';
import CalendarView       from '../components/booking/CalendarView';
import BookingModal       from '../components/booking/BookingModal';
import BookingDetailsModal from '../components/booking/BookingDetailsModal';

const RESOURCE_TYPES = [
  'Meeting Room', 'Conference Room', 'Projector',
  'Company Vehicle', 'Shared Equipment',
];
const STATUSES = ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'];

const TOAST_ICONS = {
  success: <CheckCircle size={16} className="text-green-600" />,
  error:   <AlertTriangle size={16} className="text-red-600" />,
  info:    <Info size={16} className="text-blue-600" />,
};
const TOAST_BG = {
  success: 'bg-green-50 border-green-200',
  error:   'bg-red-50 border-red-200',
  info:    'bg-blue-50 border-blue-200',
};

const Toast = ({ toasts, removeToast }) => (
  <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
    {toasts.map(t => (
      <div
        key={t.id}
        className={`flex items-start gap-2 px-4 py-3 rounded-xl border shadow-lg text-sm
                    max-w-xs pointer-events-auto animate-in slide-in-from-right-4 duration-200
                    ${TOAST_BG[t.type]}`}
      >
        {TOAST_ICONS[t.type]}
        <span className="flex-1 text-slate-700">{t.message}</span>
        <button
          onClick={() => removeToast(t.id)}
          className="text-slate-400 hover:text-slate-600 ml-1"
        >
          <X size={13} />
        </button>
      </div>
    ))}
  </div>
);

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
    </div>
  </div>
);

const ReminderBanner = ({ bookings, onView }) => {
  const [dismissed, setDismissed] = useState(false);

  const now = new Date();
  const soon = bookings.filter(b => {
    if (b.status !== 'Upcoming') return false;
    const dateStr  = b.booking_date?.slice(0, 10);
    const today    = now.toISOString().split('T')[0];
    if (dateStr !== today) return false;
    const [h, m]   = (b.start_time || '00:00').split(':');
    const start    = new Date();
    start.setHours(parseInt(h), parseInt(m), 0, 0);
    const diffMins = (start - now) / 60000;
    return diffMins > 0 && diffMins <= 60;
  });

  if (dismissed || soon.length === 0) return null;

  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-orange-200 bg-orange-50">
      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
        <Bell size={16} className="text-orange-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-orange-800">Upcoming booking reminder</p>
        {soon.map(b => (
          <p key={b.id} className="text-xs text-orange-700 mt-0.5">
            <span className="font-medium">{b.resource_name}</span>
            {' '}starts at <span className="font-medium">{b.start_time}</span>
            {' '}— {b.purpose}
            {' '}
            <button
              onClick={() => onView(b)}
              className="underline underline-offset-2 font-semibold hover:text-orange-900"
            >
              View
            </button>
          </p>
        ))}
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-orange-400 hover:text-orange-700 p-0.5 flex-shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
};

const ResourceBooking = () => {
  const [bookings,   setBookings]   = useState([]);
  const [resources,  setResources]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [view,       setView]       = useState('table');

  const [search,       setSearch]       = useState('');
  const [filterType,   setFilterType]   = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate,   setFilterDate]   = useState('');

  const [bookModalOpen,   setBookModalOpen]   = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [editBooking,     setEditBooking]     = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling,   setCancelling]   = useState(false);

  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchAllBookings();
      setBookings(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadResources = useCallback(async () => {
    try {
      const res = await fetchAllResources();
      setResources(res.data || []);
    } catch { /* Silent */ }
  }, []);

  useEffect(() => {
    loadBookings();
    loadResources();
  }, [loadBookings, loadResources]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return bookings.filter(b => {
      if (q && !(
        b.resource_name?.toLowerCase().includes(q) ||
        b.purpose?.toLowerCase().includes(q) ||
        b.resource_type?.toLowerCase().includes(q)
      )) return false;
      if (filterType   && b.resource_type !== filterType)   return false;
      if (filterStatus && b.status        !== filterStatus) return false;
      if (filterDate   && b.booking_date?.slice(0, 10) !== filterDate) return false;
      return true;
    });
  }, [bookings, search, filterType, filterStatus, filterDate]);

  const stats = useMemo(() => ({
    total:     bookings.length,
    upcoming:  bookings.filter(b => b.status === 'Upcoming').length,
    ongoing:   bookings.filter(b => b.status === 'Ongoing').length,
    cancelled: bookings.filter(b => b.status === 'Cancelled').length,
  }), [bookings]);

  const handleView = (booking) => {
    setSelectedBooking(booking);
    setDetailsModalOpen(true);
  };

  const handleEdit = (booking) => {
    setEditBooking(booking);
    setDetailsModalOpen(false);
    setBookModalOpen(true);
  };

  const handleBookSuccess = () => {
    loadBookings();
    setEditBooking(null);
    addToast(editBooking ? 'Booking updated!' : 'Resource booked successfully!', 'success');
  };

  const handleOpenNewBooking = (preselectedResource = null) => {
    setEditBooking(preselectedResource ? { resource_id: preselectedResource.id } : null);
    setBookModalOpen(true);
  };

  const handleCancelBooking = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await cancelBooking(cancelTarget.id);
      addToast('Booking cancelled.', 'success');
      setCancelTarget(null);
      setDetailsModalOpen(false);
      loadBookings();
    } catch (err) {
      addToast(err.message || 'Could not cancel booking.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setFilterType('');
    setFilterStatus('');
    setFilterDate('');
  };
  const hasFilters = search || filterType || filterStatus || filterDate;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1 h-7 bg-blue-600 rounded-full block" />
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                Resource Booking
              </h1>
            </div>
            <p className="text-sm text-slate-500 ml-4">
              Reserve shared assets — rooms, vehicles, equipment and more.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="refresh-bookings-btn"
              onClick={loadBookings}
              disabled={loading}
              title="Refresh"
              className="p-2.5 rounded-lg border border-slate-200 bg-white text-slate-600
                         hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm
                         disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              id="open-book-modal-btn"
              onClick={() => handleOpenNewBooking()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white
                         text-sm font-semibold hover:bg-blue-700 active:bg-blue-800
                         shadow-sm hover:shadow-md transition-all duration-150"
            >
              <Plus size={16} />
              Book Resource
            </button>
          </div>
        </div>

        <ReminderBanner bookings={bookings} onView={handleView} />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Archive}      label="Total Bookings"     value={stats.total}     color="bg-slate-600" />
          <StatCard icon={CalendarCheck} label="Upcoming"          value={stats.upcoming}  color="bg-blue-600"  />
          <StatCard icon={Clock}         label="Ongoing"           value={stats.ongoing}   color="bg-green-600" />
          <StatCard icon={Ban}           label="Cancelled"         value={stats.cancelled} color="bg-red-500"   />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="booking-search-input"
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search resource or purpose…"
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-200
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <select
              id="filter-type-select"
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="px-3 py-2.5 text-sm rounded-lg border border-slate-200 text-slate-700
                         focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[170px]"
            >
              <option value="">All Resource Types</option>
              {RESOURCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <select
              id="filter-status-select"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 text-sm rounded-lg border border-slate-200 text-slate-700
                         focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[140px]"
            >
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <input
              id="filter-date-input"
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="px-3 py-2.5 text-sm rounded-lg border border-slate-200 text-slate-700
                         focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />

            {hasFilters && (
              <button
                id="clear-filters-btn"
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium rounded-lg
                           border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <X size={14} /> Clear
              </button>
            )}
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              {filtered.length} {filtered.length === 1 ? 'booking' : 'bookings'} found
              {hasFilters && <span className="text-blue-600 font-medium"> (filtered)</span>}
            </p>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                id="view-toggle-table"
                onClick={() => setView('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold
                            transition-all ${view === 'table'
                              ? 'bg-white text-blue-700 shadow-sm'
                              : 'text-slate-500 hover:text-slate-700'}`}
              >
                <LayoutList size={13} /> Table
              </button>
              <button
                id="view-toggle-calendar"
                onClick={() => setView('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold
                            transition-all ${view === 'calendar'
                              ? 'bg-white text-blue-700 shadow-sm'
                              : 'text-slate-500 hover:text-slate-700'}`}
              >
                <CalendarDays size={13} /> Calendar
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          {view === 'table' ? (
            <BookingTable
              bookings={filtered}
              loading={loading}
              onView={handleView}
            />
          ) : (
            <CalendarView
              bookings={filtered}
              resources={resources}
              onView={handleView}
            />
          )}
        </div>
      </div>

      {cancelTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-150">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Cancel Booking?</h3>
              <p className="text-sm text-slate-500">
                Are you sure you want to cancel the booking for{' '}
                <span className="font-semibold text-slate-700">{cancelTarget.resource_name}</span>?
                This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                id="confirm-cancel-no"
                onClick={() => setCancelTarget(null)}
                disabled={cancelling}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium
                           text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Keep It
              </button>
              <button
                id="confirm-cancel-yes"
                onClick={handleCancelBooking}
                disabled={cancelling}
                className="flex-1 py-2.5 rounded-lg bg-red-600 text-sm font-semibold text-white
                           hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {cancelling ? 'Cancelling…' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BookingModal
        isOpen={bookModalOpen}
        onClose={() => { setBookModalOpen(false); setEditBooking(null); }}
        onSuccess={handleBookSuccess}
        resources={resources}
        editData={editBooking}
      />

      <BookingDetailsModal
        isOpen={detailsModalOpen}
        booking={selectedBooking}
        onClose={() => setDetailsModalOpen(false)}
        onEdit={handleEdit}
        onCancel={(b) => { setCancelTarget(b); setDetailsModalOpen(false); }}
      />

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default ResourceBooking;
