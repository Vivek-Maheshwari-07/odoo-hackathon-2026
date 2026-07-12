// src/components/maintenance/MaintenanceModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  X, Upload, Wrench, FileText, AlignLeft, Zap, Image, Loader2, AlertTriangle,
} from 'lucide-react';
import { createMaintenanceRequest, updateMaintenanceRequest } from '../../services/maintenanceService';

const PRIORITIES = [
  { value: 'LOW',      label: 'Low',      color: 'text-slate-600' },
  { value: 'MEDIUM',   label: 'Medium',   color: 'text-blue-600'  },
  { value: 'HIGH',     label: 'High',     color: 'text-orange-600'},
  { value: 'CRITICAL', label: 'Critical', color: 'text-red-600'   },
];

const INITIAL_FORM = {
  assetId:    '',
  issueTitle: '',
  description:'',
  priority:   'MEDIUM',
  photo:      null,
};

const Field = ({ label, icon: Icon, error, required, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
      {Icon && <Icon size={13} className="text-slate-400" />}
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && (
      <p className="flex items-center gap-1 text-xs text-red-500">
        <AlertTriangle size={11} /> {error}
      </p>
    )}
  </div>
);

const inputCls = (hasError = false) =>
  `w-full px-3 py-2.5 text-sm rounded-lg border bg-white text-slate-800
   placeholder:text-slate-400 transition-all duration-150
   focus:outline-none focus:ring-2 focus:border-transparent
   ${hasError
     ? 'border-red-400 focus:ring-red-400'
     : 'border-[#E2E8F0] focus:ring-[#2563EB]'}`;

const MaintenanceModal = ({
  isOpen,
  onClose,
  onSuccess,
  assets       = [],
  requestData  = null,
  currentUserId = 1,
}) => {
  const [form,       setForm]       = useState(INITIAL_FORM);
  const [errors,     setErrors]     = useState({});
  const [loading,    setLoading]    = useState(false);
  const [apiError,   setApiError]   = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [photoName,  setPhotoName]  = useState('');
  const fileRef = useRef(null);
  const isEdit  = Boolean(requestData);

  useEffect(() => {
    if (isOpen) {
      setApiError('');
      setSuccessMsg('');
      setErrors({});
      if (requestData) {
        setForm({
          assetId:     String(requestData.assetId ?? ''),
          issueTitle:  requestData.issueTitle  ?? '',
          description: requestData.description ?? '',
          priority:    requestData.priority    ?? 'MEDIUM',
          photo:       null,
        });
        setPhotoName('');
      } else {
        setForm(INITIAL_FORM);
        setPhotoName('');
      }
    }
  }, [isOpen, requestData]);

  const validate = () => {
    const e = {};
    if (!form.assetId)              e.assetId     = 'Please select an asset.';
    if (!form.issueTitle.trim())    e.issueTitle  = 'Issue title is required.';
    if (!form.description.trim())   e.description = 'Description is required.';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setApiError('');
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm(prev => ({ ...prev, photo: file }));
    setPhotoName(file.name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }

    setLoading(true);
    setApiError('');
    try {
      const payload = {
        assetId:     parseInt(form.assetId),
        employeeId:  currentUserId,
        issueTitle:  form.issueTitle.trim(),
        description: form.description.trim(),
        priority:    form.priority,
      };

      if (isEdit) {
        await updateMaintenanceRequest(requestData.id, payload);
      } else {
        await createMaintenanceRequest(payload);
      }

      setSuccessMsg(isEdit ? 'Request updated!' : 'Request raised successfully!');
      setTimeout(() => { onSuccess?.(); onClose(); }, 900);
    } catch (err) {
      setApiError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="maint-modal-title"
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4
                        bg-gradient-to-r from-[#2563EB] to-blue-700 border-b border-blue-800/20">
          <div>
            <h2 id="maint-modal-title" className="text-lg font-bold text-white">
              {isEdit ? 'Edit Maintenance Request' : 'Raise Maintenance Request'}
            </h2>
            <p className="text-xs text-blue-200 mt-0.5">
              {isEdit ? 'Update details for this request.' : 'Report an asset issue for review and repair.'}
            </p>
          </div>
          <button
            id="close-maint-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-600 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="px-6 py-5 space-y-4 max-h-[72vh] overflow-y-auto">
            {apiError && (
              <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                ✅ <span>{successMsg}</span>
              </div>
            )}

            <Field label="Select Asset" icon={Wrench} error={errors.assetId} required>
              <select
                id="maint-asset-select"
                name="assetId"
                value={form.assetId}
                onChange={handleChange}
                className={inputCls(Boolean(errors.assetId))}
                disabled={isEdit}
              >
                <option value="">— Choose an asset —</option>
                {assets.map(a => (
                  <option key={a.id} value={a.id}>
                    [{a.assetTag}] {a.assetName || a.name}
                    {a.location ? ` · ${a.location}` : ''}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Issue Title" icon={FileText} error={errors.issueTitle} required>
              <input
                id="maint-issue-title"
                type="text"
                name="issueTitle"
                value={form.issueTitle}
                onChange={handleChange}
                placeholder="e.g. Laptop screen flickering"
                maxLength={300}
                className={inputCls(Boolean(errors.issueTitle))}
              />
            </Field>

            <Field label="Description" icon={AlignLeft} error={errors.description} required>
              <textarea
                id="maint-description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the issue in detail..."
                rows={4}
                className={`${inputCls(Boolean(errors.description))} resize-none`}
              />
            </Field>

            <Field label="Priority" icon={Zap} error={errors.priority} required>
              <div className="grid grid-cols-4 gap-2">
                {PRIORITIES.map(p => (
                  <label
                    key={p.value}
                    htmlFor={`priority-${p.value}`}
                    className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border-2
                                cursor-pointer transition-all text-xs font-semibold select-none
                                ${form.priority === p.value
                                  ? `border-[#2563EB] bg-blue-50 ${p.color}`
                                  : 'border-[#E2E8F0] bg-white text-slate-500 hover:border-slate-300'}
                              `}
                  >
                    <input
                      id={`priority-${p.value}`}
                      type="radio"
                      name="priority"
                      value={p.value}
                      checked={form.priority === p.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className={`w-2 h-2 rounded-full ${
                      p.value === 'LOW'      ? 'bg-slate-400' :
                      p.value === 'MEDIUM'   ? 'bg-blue-500'  :
                      p.value === 'HIGH'     ? 'bg-orange-500':
                                               'bg-red-500'
                    }`} />
                    {p.label}
                  </label>
                ))}
              </div>
            </Field>

            <Field label="Photo (optional)" icon={Image}>
              <div
                onClick={() => fileRef.current?.click()}
                className={`flex flex-col items-center gap-2 px-4 py-5 rounded-xl border-2 border-dashed
                            cursor-pointer transition-colors
                            ${photoName
                              ? 'border-blue-300 bg-blue-50'
                              : 'border-[#E2E8F0] bg-[#F8FAFC] hover:border-blue-300 hover:bg-blue-50/40'}
                          `}
              >
                <Upload size={22} className={photoName ? 'text-blue-500' : 'text-slate-400'} />
                <p className="text-sm text-slate-500 text-center">
                  {photoName
                    ? <span className="text-blue-700 font-medium">{photoName}</span>
                    : <><span className="font-medium text-blue-600">Click to upload</span> or drag &amp; drop</>
                  }
                </p>
                <p className="text-xs text-slate-400">PNG, JPG, WEBP — max 5 MB</p>
              </div>
              <input
                id="maint-photo-upload"
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFile}
                className="sr-only"
              />
            </Field>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4
                          border-t border-[#E2E8F0] bg-[#F8FAFC]">
            <button
              id="cancel-maint-modal"
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 text-sm font-semibold rounded-lg border border-[#E2E8F0]
                         text-slate-700 hover:bg-slate-100 active:bg-slate-200
                         transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              id="submit-maint-request"
              type="submit"
              disabled={loading || Boolean(successMsg)}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-lg
                         bg-[#2563EB] text-white hover:bg-blue-700 active:bg-blue-800
                         shadow-sm hover:shadow-md transition-all duration-150 disabled:opacity-60"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? 'Submitting…' : isEdit ? 'Save Changes' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceModal;
