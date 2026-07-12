// src/components/maintenance/RequestDetailsPanel.jsx
import React, { useState } from 'react';
import {
  X, Tag, MapPin, User, Wrench, FileText, Send,
  ThumbsUp, XCircle, UserCheck, CheckCircle2,
} from 'lucide-react';
import StatusBadge   from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import Timeline      from './Timeline';

const ACTIONS = {
  PENDING: [
    { label: 'Approve',   newStatus: 'APPROVED',  icon: ThumbsUp,     style: 'bg-blue-600 text-white hover:bg-blue-700'   },
    { label: 'Reject',    newStatus: 'REJECTED',  icon: XCircle,      style: 'bg-red-50 text-red-600 border border-red-300 hover:bg-red-100' },
  ],
  APPROVED: [
    { label: 'Assign Technician', newStatus: 'TECHNICIAN_ASSIGNED', icon: UserCheck, style: 'bg-purple-600 text-white hover:bg-purple-700', needsTech: true },
    { label: 'Reject',            newStatus: 'REJECTED',            icon: XCircle,   style: 'bg-red-50 text-red-600 border border-red-300 hover:bg-red-100' },
  ],
  TECHNICIAN_ASSIGNED: [
    { label: 'Mark In-Progress', newStatus: 'IN_PROGRESS', icon: Wrench,       style: 'bg-orange-500 text-white hover:bg-orange-600' },
    { label: 'Reject',           newStatus: 'REJECTED',    icon: XCircle,      style: 'bg-red-50 text-red-600 border border-red-300 hover:bg-red-100' },
  ],
  IN_PROGRESS: [
    { label: 'Mark Resolved', newStatus: 'RESOLVED', icon: CheckCircle2, style: 'bg-green-600 text-white hover:bg-green-700' },
    { label: 'Reject',        newStatus: 'REJECTED', icon: XCircle,      style: 'bg-red-50 text-red-600 border border-red-300 hover:bg-red-100' },
  ],
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
    <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon size={12} className="text-blue-600" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{label}</p>
      <p className="text-sm text-slate-800 font-medium mt-0.5 break-words">{value || '—'}</p>
    </div>
  </div>
);

const RequestDetailsPanel = ({
  request,
  isOpen,
  onClose,
  onStatusChange,
  onEdit,
  technicians = [],
  currentUserId = 1,
}) => {
  const [techId,     setTechId]     = useState('');
  const [note,       setNote]       = useState('');
  const [comment,    setComment]    = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !request) return null;

  const actions = ACTIONS[request.status] ?? [];

  const handleAction = async (action) => {
    if (action.needsTech && !techId) {
      alert('Please select a technician first.');
      return;
    }
    setSubmitting(true);
    try {
      await onStatusChange(request.id, {
        newStatus:    action.newStatus,
        changedById:  currentUserId,
        technicianId: action.needsTech ? parseInt(techId) : undefined,
        note:         note.trim() || undefined,
      });
      setNote('');
      setTechId('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg h-full bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-200">
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100 bg-[#F8FAFC]">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge   status={request.status}   />
              <PriorityBadge priority={request.priority} />
            </div>
            <h2 className="text-base font-bold text-slate-800 mt-2 leading-tight">
              {request.issueTitle}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Raised on {formatDate(request.createdAt)}
            </p>
          </div>
          <button
            id="close-details-panel"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-3 flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          <section>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Asset & Reporter</h3>
            <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] px-4 py-1">
              <InfoRow icon={Tag}     label="Asset Tag"   value={request.asset?.assetTag} />
              <InfoRow icon={Wrench}  label="Asset Name"  value={request.asset?.name} />
              <InfoRow icon={MapPin}  label="Location"    value={request.asset?.location} />
              <InfoRow icon={User}    label="Reported By" value={request.employee?.name} />
              {request.technician && (
                <InfoRow icon={UserCheck} label="Technician" value={request.technician.name} />
              )}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Description</h3>
            <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] px-4 py-3">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {request.description}
              </p>
            </div>
          </section>

          {request.photo && (
            <section>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Photo</h3>
              <img
                src={request.photo}
                alt="Issue photo"
                className="w-full rounded-xl border border-[#E2E8F0] object-cover max-h-52"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </section>
          )}

          {actions.length > 0 && (
            <section>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Actions</h3>

              {request.status === 'APPROVED' && (
                <div className="mb-3">
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">
                    Assign Technician <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="tech-select"
                    value={techId}
                    onChange={e => setTechId(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-[#E2E8F0]
                               focus:outline-none focus:ring-2 focus:ring-[#2563EB] bg-white"
                  >
                    <option value="">— Select a technician —</option>
                    {technicians.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mb-3">
                <label className="text-xs font-semibold text-slate-600 mb-1 block">
                  Note (optional)
                </label>
                <input
                  id="action-note"
                  type="text"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Add a note for the timeline…"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-[#E2E8F0]
                             focus:outline-none focus:ring-2 focus:ring-[#2563EB] bg-white"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {actions.map(action => {
                  const { Icon } = action;
                  return (
                    <button
                      key={action.newStatus}
                      id={`action-${action.newStatus}`}
                      onClick={() => handleAction(action)}
                      disabled={submitting}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold
                                  transition-colors disabled:opacity-60 ${action.style}`}
                    >
                      <Icon size={14} />
                      {action.label}
                    </button>
                  );
                })}
                {request.status === 'PENDING' && (
                  <button
                    id="edit-request-btn"
                    onClick={() => { onClose(); onEdit?.(request); }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold
                               border border-[#E2E8F0] text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <FileText size={14} /> Edit
                  </button>
                )}
              </div>
            </section>
          )}

          <section>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Timeline</h3>
            <Timeline timeline={request.timeline ?? []} />
          </section>

          <section>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Comments</h3>
            <div className="space-y-2 mb-3">
              {(request.comments ?? []).length === 0 ? (
                <p className="text-xs text-slate-400 italic">No comments yet.</p>
              ) : (
                (request.comments ?? []).map(c => (
                  <div key={c.id} className="bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] px-3 py-2.5">
                    <p className="text-xs font-semibold text-slate-600 mb-0.5">
                      Employee #{c.authorId}
                      <span className="font-normal text-slate-400 ml-2">{formatDate(c.createdAt)}</span>
                    </p>
                    <p className="text-sm text-slate-700">{c.body}</p>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <input
                id="new-comment-input"
                type="text"
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Write a comment…"
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-[#E2E8F0]
                           focus:outline-none focus:ring-2 focus:ring-[#2563EB] bg-white"
              />
              <button
                id="send-comment-btn"
                onClick={() => setComment('')}
                className="px-3 py-2 rounded-lg bg-[#2563EB] text-white hover:bg-blue-700
                           transition-colors flex items-center"
              >
                <Send size={14} />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailsPanel;
