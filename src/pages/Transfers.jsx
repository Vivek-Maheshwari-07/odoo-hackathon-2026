import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch, getUser } from '../utils/api';
import AppLayout from '../components/layout/AppLayout';
import PageHeader from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import Button from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { Pagination } from '../components/common/Pagination';
import Alert, { AlertDescription } from '../components/common/Alert';
import {
  Plus, Search, CheckCircle2, XCircle, ArrowLeftRight
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_BADGE = {
  Pending:  'warning',
  Approved: 'success',
  Rejected: 'danger',
};
const ITEMS_PER_PAGE = 8;

const normalizeEmployee = (e) => ({
  ...e,
  id: e.dbId || e.id,
  fullName: e.fullName || e.name || '',
  departmentId: e.departmentId || e.deptId || '',
});

const normalizeDepartment = (d) => ({
  ...d,
  id: d.dbId || d.id,
  department_name: d.department_name || d.name || '',
});

const RawSelect = ({ name, value, onChange, options = [], placeholder = 'Select…' }) => (
  <div className="relative">
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full h-10 px-3 py-2 bg-white border border-border rounded-lg text-sm outline-none appearance-none focus:border-primary focus:ring-1 focus:ring-primary text-text-primary pr-8"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-slate-400">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────
const Transfers = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentUser, setCurrentUser] = useState(null);

  // Data
  const [transfers,   setTransfers]   = useState([]);
  const [allocatedAssets, setAllocatedAssets] = useState([]);
  const [employees,   setEmployees]   = useState([]);
  const [departments, setDepartments] = useState([]);

  // UI
  const [loading,      setLoading]      = useState(true);
  const [notification, setNotification] = useState(null);
  const [submitting,   setSubmitting]   = useState(false);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage,  setCurrentPage]  = useState(1);

  // Create Transfer Modal
  const [createModal, setCreateModal] = useState(false);
  const [createForm,  setCreateForm]  = useState({
    assetId: searchParams.get('asset') || '', requestedEmployeeId: '', requestedDepartmentId: '', reason: '',
  });
  const [createErrors, setCreateErrors] = useState({});

  // Approve/Reject confirm
  const [confirmModal, setConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // { id, type: 'approve'|'reject', name }

  // ─── Notifications ─────────────────────────────────────────────────────────
  const showNote = useCallback((type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  // ─── Fetch data ────────────────────────────────────────────────────────────
  const fetchAll = useCallback(() => {
    setLoading(true);
    Promise.all([
      apiFetch('/transfers'),
      apiFetch('/allocations?limit=200'),
      apiFetch('/assets'),
      apiFetch('/employees'),
      apiFetch('/departments'),
    ])
      .then(([tRes, aRes, assetsRes, eRes, dRes]) => {
        setTransfers(Array.isArray(tRes) ? tRes : []);
        // Only allocated assets can be transferred
        const allocs = aRes.allocations || [];
        const allocatedIds = new Set(
          allocs.filter(a => a.status === 'Active' || a.status === 'Overdue').map(a => a.assetId)
        );
        setAllocatedAssets(Array.isArray(assetsRes) ? assetsRes.filter(a => allocatedIds.has(a.id)) : []);
        setEmployees(Array.isArray(eRes) ? eRes.map(normalizeEmployee).filter(e => e.status === 'Active') : []);
        setDepartments(Array.isArray(dRes) ? dRes.map(normalizeDepartment).filter(d => d.status === 'Active') : []);
      })
      .catch(err => showNote('danger', err.message || 'Failed to load transfer data.'))
      .finally(() => setLoading(false));
  }, [showNote]);

  useEffect(() => {
    const profile = getUser();
    if (!profile) { navigate('/login'); return; }
    setCurrentUser(profile);
    fetchAll();
    // Pre-open modal if ?asset= param is present
    if (searchParams.get('asset')) setCreateModal(true);
  }, [navigate, fetchAll, searchParams]);

  // ─── Filtered ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return transfers.filter(t => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !searchQuery ||
        t.assetTag.toLowerCase().includes(q) ||
        t.assetName.toLowerCase().includes(q) ||
        t.currentEmployeeName.toLowerCase().includes(q) ||
        t.requestedEmployeeName.toLowerCase().includes(q);
      const matchStatus = !statusFilter || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [transfers, searchQuery, statusFilter]);

  // ─── Create transfer form ──────────────────────────────────────────────────
  const handleCreateField = (e) => {
    const { name, value } = e.target;
    setCreateForm(p => ({ ...p, [name]: value }));
    setCreateErrors(p => ({ ...p, [name]: null }));
    // Auto-fill department from employee
    if (name === 'requestedEmployeeId' && value) {
      const emp = employees.find(e => String(e.id) === String(value));
      if (emp) setCreateForm(p => ({ ...p, requestedEmployeeId: value, requestedDepartmentId: String(emp.departmentId || '') }));
    }
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!createForm.assetId)             errors.assetId             = 'Select an asset.';
    if (!createForm.requestedEmployeeId) errors.requestedEmployeeId = 'Select an employee.';
    if (!createForm.requestedDepartmentId) errors.requestedDepartmentId = 'Select a department.';
    if (Object.keys(errors).length) { setCreateErrors(errors); return; }

    setSubmitting(true);
    apiFetch('/transfers', {
      method: 'POST',
      body: {
        assetId:               Number(createForm.assetId),
        requestedEmployeeId:   Number(createForm.requestedEmployeeId),
        requestedDepartmentId: Number(createForm.requestedDepartmentId),
        reason:                createForm.reason,
      },
    })
      .then(res => {
        showNote('success', res.message || 'Transfer request submitted.');
        setCreateModal(false);
        setCreateForm({ assetId: '', requestedEmployeeId: '', requestedDepartmentId: '', reason: '' });
        fetchAll();
      })
      .catch(err => showNote('danger', err.message || 'Error creating transfer request.'))
      .finally(() => setSubmitting(false));
  };

  // ─── Approve / Reject ──────────────────────────────────────────────────────
  const triggerAction = (transfer, type) => {
    setConfirmAction({ id: transfer.id, type, name: transfer.assetName });
    setConfirmModal(true);
  };

  const executeAction = () => {
    if (!confirmAction) return;
    const endpoint = `/transfers/${confirmAction.id}/${confirmAction.type}`;
    setSubmitting(true);
    apiFetch(endpoint, { method: 'PUT' })
      .then(res => {
        showNote('success', res.message || `Transfer ${confirmAction.type}d.`);
        setConfirmModal(false);
        setConfirmAction(null);
        fetchAll();
      })
      .catch(err => {
        showNote('danger', err.message || `Error: could not ${confirmAction.type} transfer.`);
        setConfirmModal(false);
      })
      .finally(() => setSubmitting(false));
  };

  const isAdmin = currentUser?.role === 'Admin';

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <AppLayout>
      <div className="flex flex-col gap-6 max-w-[1400px] mx-auto animate-fade-in">

        {/* Toast */}
        {notification && (
          <div className="fixed top-6 right-6 z-50 w-full max-w-md shadow-lg animate-fade-in">
            <Alert variant={notification.type}>
              <div className="flex items-center justify-between gap-3">
                <AlertDescription className="font-semibold text-sm">{notification.message}</AlertDescription>
                <button onClick={() => setNotification(null)} className="text-xs opacity-70 hover:opacity-100 font-bold shrink-0">✕</button>
              </div>
            </Alert>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <PageHeader
            title="Transfer Requests"
            description="Manage asset handover requests between employees and departments."
          />
          {isAdmin && (
            <Button onClick={() => setCreateModal(true)} className="flex items-center gap-2 self-start sm:self-auto">
              <Plus className="h-4 w-4" /> New Transfer Request
            </Button>
          )}
        </div>

        {/* Filter bar */}
        <Card className="p-4 bg-white shadow-sm border border-border">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="relative flex-1 min-w-0 w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search by asset or employee..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full h-10 pl-9 pr-4 bg-white border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text-primary"
              />
            </div>
            <div className="flex flex-col gap-1 min-w-[160px]">
              <span className="text-[10px] text-text-secondary font-bold uppercase">Status</span>
              <RawSelect
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                options={[{ value:'Pending',label:'Pending' },{ value:'Approved',label:'Approved' },{ value:'Rejected',label:'Rejected' }]}
                placeholder="All Statuses"
              />
            </div>
          </div>
        </Card>

        {/* Table */}
        {loading ? (
          <Card className="p-12 flex flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm font-medium text-text-secondary">Loading transfer requests...</p>
          </Card>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No Transfer Requests"
            description="There are no transfer requests matching your criteria."
            icon={ArrowLeftRight}
            actionButton={isAdmin ? (
              <Button onClick={() => setCreateModal(true)} className="flex items-center gap-2 text-sm">
                <Plus className="h-4 w-4" /> New Transfer Request
              </Button>
            ) : null}
          />
        ) : (
          <Card className="bg-white shadow-sm border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-border">
                    {['#','Asset','Current Holder','→ New Holder','→ Department','Reason','Status','Actions'].map(h => (
                      <th key={h} className="px-5 py-3.5 text-[10px] font-bold uppercase text-text-secondary tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map(t => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs font-bold text-primary">TR-{String(t.id).padStart(4,'0')}</td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-text-primary">{t.assetTag}</p>
                        <p className="text-xs text-text-secondary">{t.assetName}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-text-primary">{t.currentEmployeeName}</p>
                        <p className="text-xs text-text-secondary">{t.currentDepartmentName}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-primary">{t.requestedEmployeeName}</p>
                        <p className="text-xs text-text-secondary">{t.requestedEmployeeCode}</p>
                      </td>
                      <td className="px-5 py-3.5 text-text-secondary">{t.requestedDepartmentName}</td>
                      <td className="px-5 py-3.5 max-w-[180px]">
                        <p className="text-xs text-text-secondary truncate" title={t.reason}>{t.reason || '—'}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={STATUS_BADGE[t.status] || 'secondary'}>{t.status}</Badge>
                        {t.approvedByName && (
                          <p className="text-[10px] text-text-secondary mt-0.5">by {t.approvedByName}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {isAdmin && t.status === 'Pending' ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => triggerAction(t, 'approve')}
                              title="Approve"
                              className="p-1.5 rounded-lg text-text-secondary hover:text-green-600 hover:bg-green-50 transition-colors"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => triggerAction(t, 'reject')}
                              title="Reject"
                              className="p-1.5 rounded-lg text-text-secondary hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-text-secondary">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5">
              <Pagination currentPage={currentPage} totalItems={filtered.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
            </div>
          </Card>
        )}

        {/* ─── CREATE TRANSFER MODAL ────────────────────────────────────────────── */}
        <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Create Transfer Request" size="md">
          <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">

            {/* Asset */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-primary">Asset *</label>
              <RawSelect
                name="assetId"
                value={createForm.assetId}
                onChange={handleCreateField}
                options={allocatedAssets.map(a => ({ value: a.id, label: `${a.assetTag} — ${a.assetName}` }))}
                placeholder="Select allocated asset"
              />
              {createErrors.assetId && <span className="text-xs text-red-500">{createErrors.assetId}</span>}
              {allocatedAssets.length === 0 && (
                <span className="text-xs text-amber-600 font-medium">No currently allocated assets available.</span>
              )}
            </div>

            {/* New Employee */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-primary">Transfer To Employee *</label>
              <RawSelect
                name="requestedEmployeeId"
                value={createForm.requestedEmployeeId}
                onChange={handleCreateField}
                options={employees.map(e => ({ value: e.id, label: `${e.fullName} (${e.employeeCode})` }))}
                placeholder="Select new holder"
              />
              {createErrors.requestedEmployeeId && <span className="text-xs text-red-500">{createErrors.requestedEmployeeId}</span>}
            </div>

            {/* New Department */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-primary">Transfer To Department *</label>
              <RawSelect
                name="requestedDepartmentId"
                value={createForm.requestedDepartmentId}
                onChange={handleCreateField}
                options={departments.map(d => ({ value: d.id, label: d.department_name }))}
                placeholder="Select department"
              />
              {createErrors.requestedDepartmentId && <span className="text-xs text-red-500">{createErrors.requestedDepartmentId}</span>}
            </div>

            {/* Reason */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-primary">Reason</label>
              <textarea name="reason" rows={3} value={createForm.reason}
                onChange={handleCreateField}
                placeholder="Reason for transfer request..."
                className="w-full rounded-lg border border-border p-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setCreateModal(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="flex items-center gap-2">
                {submitting && <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                Submit Request
              </Button>
            </div>
          </form>
        </Modal>

        {/* ─── CONFIRM ACTION MODAL ──────────────────────────────────────────────── */}
        <Modal isOpen={confirmModal} onClose={() => setConfirmModal(false)} title={`${confirmAction?.type === 'approve' ? 'Approve' : 'Reject'} Transfer`} size="sm">
          <div className="flex flex-col gap-4">
            <div className={`flex items-start gap-3 p-3 rounded-xl border ${
              confirmAction?.type === 'approve'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {confirmAction?.type === 'approve'
                ? <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                : <XCircle className="h-5 w-5 shrink-0 mt-0.5" />
              }
              <p className="text-xs font-semibold leading-relaxed">
                {confirmAction?.type === 'approve'
                  ? 'Approving this transfer will reallocate the asset to the requested employee and update the department.'
                  : 'Rejecting this transfer request will close it without any changes.'
                }
              </p>
            </div>
            <p className="text-sm text-text-secondary">
              {confirmAction?.type === 'approve' ? 'Approve' : 'Reject'} transfer for asset{' '}
              <strong>"{confirmAction?.name}"</strong>?
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setConfirmModal(false)}>Cancel</Button>
              <button
                onClick={executeAction}
                disabled={submitting}
                className={`inline-flex items-center gap-2 h-10 px-4 text-sm font-medium rounded-lg text-white transition-colors disabled:opacity-50 ${
                  confirmAction?.type === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {submitting && <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                {confirmAction?.type === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </Modal>

      </div>
    </AppLayout>
  );
};

export default Transfers;
