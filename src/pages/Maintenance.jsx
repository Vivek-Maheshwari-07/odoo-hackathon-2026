// src/pages/Maintenance.jsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Plus, RefreshCw, Search, LayoutList, Columns,
  X, AlertTriangle, CheckCircle, Info,
  Clock, ThumbsUp, Wrench, CheckCircle2,
} from 'lucide-react';

import useMaintenance     from '../hooks/useMaintenance';
import KanbanBoard        from '../components/maintenance/KanbanBoard';
import MaintenanceModal   from '../components/maintenance/MaintenanceModal';
import RequestDetailsPanel from '../components/maintenance/RequestDetailsPanel';
import MaintenanceTable   from '../components/maintenance/MaintenanceTable';
import { fetchAllocatedAssets } from '../services/maintenanceService';
import { apiFetch } from '../utils/api';
import AppLayout from '../components/layout/AppLayout';

const STAT_CARDS = [
  { key: 'pending',    label: 'Pending',     Icon: Clock,        gradient: 'from-yellow-400 to-yellow-500' },
  { key: 'approved',   label: 'Approved',    Icon: ThumbsUp,     gradient: 'from-blue-500 to-blue-600'    },
  { key: 'inProgress', label: 'In Progress', Icon: Wrench,       gradient: 'from-orange-400 to-orange-500' },
  { key: 'resolved',   label: 'Resolved',    Icon: CheckCircle2, gradient: 'from-green-500 to-green-600'  },
];

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STATUSES   = ['PENDING','APPROVED','TECHNICIAN_ASSIGNED','IN_PROGRESS','RESOLVED','REJECTED'];

const TOAST_CONFIG = {
  success: { Icon: CheckCircle,   bg: 'bg-green-50 border-green-200', text: 'text-green-700' },
  error:   { Icon: AlertTriangle, bg: 'bg-red-50 border-red-200',     text: 'text-red-700'   },
  info:    { Icon: Info,          bg: 'bg-blue-50 border-blue-200',   text: 'text-blue-700'  },
};

const Toast = ({ toasts, remove }) => (
  <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
    {toasts.map(t => {
      const cfg = TOAST_CONFIG[t.type] ?? TOAST_CONFIG.info;
      const { Icon } = cfg;
      return (
        <div key={t.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm
                      max-w-sm pointer-events-auto ${cfg.bg} ${cfg.text}`}>
          <Icon size={15} className="mt-0.5 flex-shrink-0" />
          <span className="flex-1">{t.message}</span>
          <button onClick={() => remove(t.id)} className="opacity-60 hover:opacity-100">
            <X size={13} />
          </button>
        </div>
      );
    })}
  </div>
);

const StatCard = ({ Icon, label, value, gradient, loading }) => (
  <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden
                  hover:shadow-md transition-shadow">
    <div className={`h-1.5 w-full bg-gradient-to-r ${gradient}`} />
    <div className="p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center
                       bg-gradient-to-br ${gradient} shadow-sm flex-shrink-0`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        {loading
          ? <div className="h-7 w-12 bg-slate-200 animate-pulse rounded mb-1" />
          : <p className="text-2xl font-extrabold text-slate-800">{value ?? 0}</p>
        }
        <p className="text-xs text-slate-500 font-medium">{label}</p>
      </div>
    </div>
  </div>
);

const Maintenance = () => {
  const { requests, stats, loading, error, refresh, changeStatus, remove } = useMaintenance();

  const [assets,          setAssets]          = useState([]);
  const [technicians,     setTechnicians]     = useState([]);

  const [view,            setView]            = useState('kanban');
  const [search,          setSearch]          = useState('');
  const [filterStatus,    setFilterStatus]    = useState('');
  const [filterPriority,  setFilterPriority]  = useState('');

  const [raiseModalOpen,  setRaiseModalOpen]  = useState(false);
  const [editRequest,     setEditRequest]     = useState(null);
  const [detailsOpen,     setDetailsOpen]     = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [deleteTarget,    setDeleteTarget]    = useState(null);
  const [deleting,        setDeleting]        = useState(false);

  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  // Load assets and technicians for selectors
  useEffect(() => {
    const loadSelectData = async () => {
      try {
        const assetsData = await fetchAllocatedAssets();
        setAssets(assetsData || []);

        // Load employees to filter technicians
        const employees = await apiFetch('/employees');
        // filter technician designation/role
        const techs = (Array.isArray(employees) ? employees : []).filter(e => e.designation?.toLowerCase().includes('tech') || e.user?.role?.toLowerCase().includes('tech') || e.role === 'Technician');
        setTechnicians(techs.map(t => ({ id: t.user_id, name: t.user?.full_name || t.employee_code })));
      } catch (err) {
        console.error('Error loading selection data:', err);
      }
    };
    loadSelectData();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return requests.filter(r => {
      if (q && !(
        r.issueTitle?.toLowerCase().includes(q)  ||
        r.asset?.name?.toLowerCase().includes(q) ||
        r.employee?.name?.toLowerCase().includes(q)
      )) return false;
      if (filterStatus   && r.status   !== filterStatus)   return false;
      if (filterPriority && r.priority !== filterPriority) return false;
      return true;
    });
  }, [requests, search, filterStatus, filterPriority]);

  const handleStatusChange = useCallback(async (id, payload) => {
    try {
      await changeStatus(id, payload);
      addToast(`Status updated to ${payload.newStatus.replace('_', ' ')}.`, 'success');
      if (selectedRequest?.id === id) {
        const updated = requests.find(r => r.id === id);
        if (updated) setSelectedRequest({ ...updated, status: payload.newStatus });
      }
    } catch (err) {
      addToast(err.message || 'Status update failed.', 'error');
    }
  }, [changeStatus, addToast, selectedRequest, requests]);

  const handleView = (request) => {
    setSelectedRequest(request);
    setDetailsOpen(true);
  };

  const handleEdit = (request) => {
    setEditRequest(request);
    setRaiseModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await remove(deleteTarget.id);
      addToast('Request deleted.', 'success');
      setDeleteTarget(null);
    } catch (err) {
      addToast(err.message || 'Delete failed.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleRaiseSuccess = () => {
    refresh();
    setEditRequest(null);
    addToast(editRequest ? 'Request updated!' : 'Maintenance request raised!', 'success');
  };

  const clearFilters = () => {
    setSearch('');
    setFilterStatus('');
    setFilterPriority('');
  };
  const hasFilters = search || filterStatus || filterPriority;

  return (
    <AppLayout>
      <div className="max-w-screen-2xl mx-auto py-2 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="w-1 h-7 bg-[#2563EB] rounded-full" />
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                Maintenance Management
              </h1>
            </div>
            <p className="text-sm text-slate-500 ml-4">
              Report, track, and resolve asset maintenance issues end-to-end.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="refresh-maintenance"
              onClick={refresh}
              disabled={loading}
              title="Refresh"
              className="p-2.5 rounded-lg border border-[#E2E8F0] bg-white text-slate-600
                         hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              id="raise-request-btn"
              onClick={() => { setEditRequest(null); setRaiseModalOpen(true); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2563EB] text-white
                         text-sm font-bold hover:bg-blue-700 active:bg-blue-800
                         shadow-sm hover:shadow-md transition-all"
            >
              <Plus size={16} />
              Raise Request
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            Icon={STAT_CARDS[0].Icon} label="Pending"
            value={stats?.pending}    gradient={STAT_CARDS[0].gradient} loading={loading}
          />
          <StatCard
            Icon={STAT_CARDS[1].Icon} label="Approved"
            value={stats?.approved}   gradient={STAT_CARDS[1].gradient} loading={loading}
          />
          <StatCard
            Icon={STAT_CARDS[2].Icon} label="In Progress"
            value={stats?.inProgress} gradient={STAT_CARDS[2].gradient} loading={loading}
          />
          <StatCard
            Icon={STAT_CARDS[3].Icon} label="Resolved"
            value={stats?.resolved}   gradient={STAT_CARDS[3].gradient} loading={loading}
          />
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="maint-search"
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search issue, asset, or reporter…"
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-[#E2E8F0]
                           focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent
                           text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <select
              id="filter-status"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 text-sm rounded-lg border border-[#E2E8F0] text-slate-700
                         focus:outline-none focus:ring-2 focus:ring-[#2563EB] bg-white min-w-[160px]"
            >
              <option value="">All Statuses</option>
              {STATUSES.map(s => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>

            <select
              id="filter-priority"
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
              className="px-3 py-2.5 text-sm rounded-lg border border-[#E2E8F0] text-slate-700
                         focus:outline-none focus:ring-2 focus:ring-[#2563EB] bg-white min-w-[140px]"
            >
              <option value="">All Priorities</option>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            {hasFilters && (
              <button
                id="clear-maint-filters"
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium rounded-lg
                           border border-[#E2E8F0] text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <X size={13} /> Clear
              </button>
            )}
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E2E8F0]">
            <p className="text-xs text-slate-500">
              {filtered.length} request{filtered.length !== 1 ? 's' : ''}
              {hasFilters && <span className="text-[#2563EB] font-semibold"> (filtered)</span>}
            </p>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                id="view-kanban"
                onClick={() => setView('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold
                            transition-all ${view === 'kanban'
                              ? 'bg-white text-[#2563EB] shadow-sm'
                              : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Columns size={13} /> Kanban
              </button>
              <button
                id="view-table"
                onClick={() => setView('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold
                            transition-all ${view === 'table'
                              ? 'bg-white text-[#2563EB] shadow-sm'
                              : 'text-slate-500 hover:text-slate-700'}`}
              >
                <LayoutList size={13} /> Table
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
            <AlertTriangle size={15} /> {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5">
          {view === 'kanban' ? (
            <KanbanBoard
              requests={filtered}
              onView={handleView}
              onDelete={(r) => setDeleteTarget(r)}
              onStatusChange={handleStatusChange}
            />
          ) : (
            <MaintenanceTable
              requests={filtered}
              loading={loading}
              onView={handleView}
              onDelete={(r) => setDeleteTarget(r)}
            />
          )}
        </div>
      </div>

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle size={26} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Delete Request?</h3>
              <p className="text-sm text-slate-500">
                Are you sure you want to permanently delete{' '}
                <span className="font-semibold text-slate-700">
                  "{deleteTarget.issueTitle}"
                </span>
                ? This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                id="delete-cancel"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-lg border border-[#E2E8F0] text-sm
                           font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Keep It
              </button>
              <button
                id="delete-confirm"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-lg bg-red-600 text-sm font-bold text-white
                           hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <MaintenanceModal
        isOpen={raiseModalOpen}
        onClose={() => { setRaiseModalOpen(false); setEditRequest(null); }}
        onSuccess={handleRaiseSuccess}
        assets={assets}
        requestData={editRequest}
        currentUserId={1}
      />

      <RequestDetailsPanel
        isOpen={detailsOpen}
        request={selectedRequest}
        onClose={() => setDetailsOpen(false)}
        onStatusChange={handleStatusChange}
        onEdit={handleEdit}
        technicians={technicians}
        currentUserId={1}
      />

      <Toast toasts={toasts} remove={removeToast} />
    </AppLayout>
  );
};

export default Maintenance;
