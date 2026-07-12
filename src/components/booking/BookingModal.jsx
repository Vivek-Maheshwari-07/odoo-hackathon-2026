// src/components/booking/BookingModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, FileText, AlignLeft, Briefcase, Loader2 } from 'lucide-react';
import { createBooking, updateBooking } from '../../services/bookingService';

const RESOURCE_TYPES = [
  'Meeting Room',
  'Conference Room',
  'Projector',
  'Company Vehicle',
  'Shared Equipment',
];

const INITIAL_FORM = {
  resource_id:  '',
  booking_date: '',
  start_time:   '',
  end_time:     '',
  purpose:      '',
  notes:        '',
};

const Field = ({ label, icon: Icon, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
      {Icon && <Icon size={14} className="text-slate-400" />}
      {label}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
  </div>
);

const inputCls =
  'w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 ' +
  'placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ' +
  'transition-all duration-150 disabled:bg-slate-50 disabled:text-slate-500';

const BookingModal = ({
  isOpen,
  onClose,
  onSuccess,
  resources = [],
  editData  = null,
}) => {
  const [form,   setForm]   = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isEdit = Boolean(editData);

  useEffect(() => {
    if (isOpen) {
      setApiError('');
      setSuccessMsg('');
      setErrors({});
      if (editData) {
        setForm({
          resource_id:  String(editData.resource_id ?? ''),
          booking_date: editData.booking_date?.slice(0, 10) ?? '',
          start_time:   editData.start_time ?? '',
          end_time:     editData.end_time ?? '',
          purpose:      editData.purpose ?? '',
          notes:        editData.notes ?? '',
        });
      } else {
        setForm(INITIAL_FORM);
      }
    }
  }, [isOpen, editData]);

  const todayStr = new Date().toISOString().split('T')[0];

  const validate = () => {
    const e = {};
    if (!form.resource_id)  e.resource_id  = 'Please select a resource.';
    if (!form.booking_date) e.booking_date = 'Booking date is required.';
    else if (form.booking_date < todayStr) e.booking_date = 'Date cannot be in the past.';
    if (!form.start_time)   e.start_time   = 'Start time is required.';
    if (!form.end_time)     e.end_time     = 'End time is required.';
    if (form.start_time && form.end_time && form.start_time >= form.end_time) {
      e.end_time = 'End time must be after start time.';
    }
    if (!form.purpose.trim()) e.purpose = 'Purpose is required.';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      const payload = {
        resource_id:  parseInt(form.resource_id),
        employee_id:  1,
        booking_date: form.booking_date,
        start_time:   form.start_time,
        end_time:     form.end_time,
        purpose:      form.purpose.trim(),
        notes:        form.notes.trim() || null,
      };

      if (isEdit) {
        await updateBooking(editData.id, payload);
      } else {
        await createBooking(payload);
      }

      setSuccessMsg(isEdit ? 'Booking updated successfully!' : 'Resource booked successfully!');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 900);
    } catch (err) {
      setApiError(err.message || 'Overlap detected or network error.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const activeResources = resources.filter(r => r.status === 'Active');
  const grouped = RESOURCE_TYPES.reduce((acc, type) => {
    const list = activeResources.filter(r => r.resource_type === type);
    if (list.length) acc[type] = list;
    return acc;
  }, {});

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-blue-700">
          <div>
            <h2 id="booking-modal-title" className="text-lg font-bold text-white">
              {isEdit ? 'Edit Booking' : 'Book a Resource'}
            </h2>
            <p className="text-xs text-blue-200 mt-0.5">
              {isEdit ? 'Update the booking details below.' : 'Fill in the details to reserve a resource.'}
            </p>
          </div>
          <button
            id="close-booking-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-500 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {apiError && (
              <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <span className="mt-0.5 flex-shrink-0">⚠️</span>
                <span>{apiError}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                <span>✅</span>
                <span>{successMsg}</span>
              </div>
            )}

            <Field label="Resource" icon={Briefcase} error={errors.resource_id}>
              <select
                id="booking-resource"
                name="resource_id"
                value={form.resource_id}
                onChange={handleChange}
                className={`${inputCls} ${errors.resource_id ? 'border-red-400 focus:ring-red-400' : ''}`}
              >
                <option value="">— Select a resource —</option>
                {Object.entries(grouped).map(([type, list]) => (
                  <optgroup key={type} label={type}>
                    {list.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.resource_name}{r.location ? ` (${r.location})` : ''}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </Field>

            <Field label="Booking Date" icon={Calendar} error={errors.booking_date}>
              <input
                id="booking-date"
                type="date"
                name="booking_date"
                value={form.booking_date}
                min={todayStr}
                onChange={handleChange}
                className={`${inputCls} ${errors.booking_date ? 'border-red-400 focus:ring-red-400' : ''}`}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Start Time" icon={Clock} error={errors.start_time}>
                <input
                  id="booking-start-time"
                  type="time"
                  name="start_time"
                  value={form.start_time}
                  onChange={handleChange}
                  className={`${inputCls} ${errors.start_time ? 'border-red-400 focus:ring-red-400' : ''}`}
                />
              </Field>
              <Field label="End Time" icon={Clock} error={errors.end_time}>
                <input
                  id="booking-end-time"
                  type="time"
                  name="end_time"
                  value={form.end_time}
                  onChange={handleChange}
                  className={`${inputCls} ${errors.end_time ? 'border-red-400 focus:ring-red-400' : ''}`}
                />
              </Field>
            </div>

            <Field label="Purpose" icon={FileText} error={errors.purpose}>
              <input
                id="booking-purpose"
                type="text"
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
                placeholder="e.g. Weekly team standup"
                maxLength={300}
                className={`${inputCls} ${errors.purpose ? 'border-red-400 focus:ring-red-400' : ''}`}
              />
            </Field>

            <Field label="Notes (optional)" icon={AlignLeft}>
              <textarea
                id="booking-notes"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Additional information or requirements…"
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </Field>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
            <button
              id="cancel-booking-btn"
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium rounded-lg border border-slate-300 text-slate-700
                         hover:bg-slate-100 active:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              id="submit-booking-btn"
              type="submit"
              disabled={loading || Boolean(successMsg)}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg
                         bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800
                         shadow-sm hover:shadow-md transition-all duration-150 disabled:opacity-60"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? 'Submitting…' : isEdit ? 'Save Changes' : 'Book Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
