import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, getUser } from '../utils/api';
import AppLayout from '../components/layout/AppLayout';
import PageHeader from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import Button from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import Input from '../components/common/Input';
import { EmptyState } from '../components/common/EmptyState';
import { Pagination } from '../components/common/Pagination';
import Alert, { AlertDescription } from '../components/common/Alert';
import {
  Plus, Search, Eye, CornerDownLeft, ArrowLeftRight,
  Users, Package, AlertTriangle, CheckCircle2, ClipboardList,
  Briefcase, Layers
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_BADGE = {
  Active:      'success',
  Overdue:     'danger',
  Returned:    'secondary',
  Transferred: 'info',
};

const CONDITIONS = ['New', 'Good', 'Fair', 'Poor'];
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
const Allocation = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  // Data
  const [allocations,  setAllocations]  = useState([]);
  const [stats,        setStats]        = useState({ allocated: 0, overdueCount: 0, returnedToday: 0, availableAssets: 0, pendingTransfers: 0 });
  const [recentAllocs, setRecentAllocs] = useState([]);
  const [assets,       setAssets]       = useState([]);
  const [employees,    setEmployees]    = useState([]);
  const [departments,  setDepartments]  = useState([]);

  // UI State
  const [loading,      setLoading]      = useState(true);
  const [notification, setNotification] = useState(null);
  const [submitting,   setSubmitting]   = useState(false);
  const [activeTab,    setActiveTab]    = useState('dashboard'); // dashboard | directory

  // Filters
  const [searchQuery,  setSearchQuery]  = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter,   setDeptFilter]   = useState('');
  const [currentPage,  setCurrentPage]  = useState(1);

  // Modals
  const [allocModal,   setAllocModal]   = useState(false);
  const [returnModal,  setReturnModal]  = useState(false);
  const [targetAlloc,  setTargetAlloc]  = useState(null);

  // Allocate form
  const [allocForm, setAllocForm] = useState({
    assetId: '', employeeId: '', departmentId: '', allocationDate: new Date().toISOString().split('T')[0],
    expectedReturnDate: '', purpose: '', notes: '',
  });
  const [allocErrors, setAllocErrors] = useState({});

  // Return form
  const [returnForm, setReturnForm] = useState({ condition: 'Good', returnNotes: '' });

  // ─── Notification helper ───────────────────────────────────────────────────
  const showNote = useCallback((type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  // ─── Data fetching ─────────────────────────────────────────────────────────
  const fetchAll = useCallback(() => {
    setLoading(true);
    Promise.all([
      apiFetch('/allocations?limit=200'),
      apiFetch('/allocations/stats'),
      apiFetch('/assets'),
      apiFetch('/employees'),
      apiFetch('/departments'),
    ])
      .then(([allocRes, statsRes, assetsRes, empsRes, deptsRes]) => {
        setAllocations(allocRes.allocations || []);
        setStats(statsRes);
        setRecentAllocs((allocRes.allocations || []).slice(0, 8));
        setAssets(Array.isArray(assetsRes) ? assetsRes.filter(a => a.status === 'Available') : []);
        setEmployees(Array.isArray(empsRes) ? empsRes.map(normalizeEmployee).filter(e => e.status === 'Active') : []);
        setDepartments(Array.isArray(deptsRes) ? deptsRes.map(normalizeDepartment).filter(d => d.status === 'Active') : []);
      })
      .catch(err => showNote('danger', err.message || 'Failed to load allocation data.'))
      .finally(() => setLoading(false));
  }, [showNote]);

  useEffect(() => {
    const profile = getUser();
    if (!profile) { navigate('/login'); return; }
    setCurrentUser(profile);
    fetchAll();
  }, [navigate, fetchAll]);

  // ─── Filtered + paginated list ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    return allocations.filter(a => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !searchQuery ||
        a.assetTag.toLowerCase().includes(q) ||
        a.assetName.toLowerCase().includes(q) ||
        a.employeeName.toLowerCase().includes(q);
      const matchStatus = !statusFilter || a.status === statusFilter;
      const matchDept   = !deptFilter   || a.departmentName === deptFilter;
      return matchSearch && matchStatus && matchDept;
    });
  }, [allocations, searchQuery, statusFilter, deptFilter]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  // ─── Allocate form handlers ────────────────────────────────────────────────
  const handleAllocField = (e) => {
    const { name, value } = e.target;
    setAllocForm(p => ({ ...p, [name]: value }));
    setAllocErrors(p => ({ ...p, [name]: null }));
    // Auto-fill department from employee's dept
    if (name === 'employeeId' && value) {
      const emp = employees.find(e => String(e.id) === String(value));
      if (emp) setAllocForm(p => ({ ...p, employeeId: value, departmentId: String(emp.departmentId || '') }));
    }
  };

  const handleAllocSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!allocForm.assetId)      errors.assetId      = 'Select an asset.';
    if (!allocForm.employeeId)   errors.employeeId   = 'Select an employee.';
    if (!allocForm.departmentId) errors.departmentId = 'Select a department.';
    if (!allocForm.allocationDate) errors.allocationDate = 'Allocation date is required.';
    if (Object.keys(errors).length) { setAllocErrors(errors); return; }

    setSubmitting(true);
    apiFetch('/allocations', {
      method: 'POST',
      body: {
        assetId:             Number(allocForm.assetId),
        employeeId:          Number(allocForm.employeeId),
        departmentId:        Number(allocForm.departmentId),
        allocationDate:      allocForm.allocationDate,
        expectedReturnDate:  allocForm.expectedReturnDate || undefined,
        purpose:             allocForm.purpose,
        notes:               allocForm.notes,
      },
    })
      .then(res => {
        showNote('success', res.message || 'Asset allocated successfully.');
        setAllocModal(false);
        setAllocForm({ assetId: '', employeeId: '', departmentId: '', allocationDate: new Date().toISOString().split('T')[0], expectedReturnDate: '', purpose: '', notes: '' });
        fetchAll();
      })
      .catch(err => showNote('danger', err.message || 'Error allocating asset.'))
      .finally(() => setSubmitting(false));
  };

  // ─── Return handlers ───────────────────────────────────────────────────────
  const openReturn = (alloc) => {
    setTargetAlloc(alloc);
    setReturnForm({ condition: 'Good', returnNotes: '' });
    setReturnModal(true);
  };

  const handleReturn = () => {
    if (!targetAlloc) return;
    setSubmitting(true);
    apiFetch(`/allocations/${targetAlloc.id}`, {
      method: 'PUT',
      body: { condition: returnForm.condition, returnNotes: returnForm.returnNotes },
    })
      .then(res => {
        showNote('success', res.message || 'Asset returned successfully.');
        setReturnModal(false);
        setTargetAlloc(null);
        fetchAll();
      })
      .catch(err => showNote('danger', err.message || 'Error processing return.'))
      .finally(() => setSubmitting(false));
  };

  const isAdmin = currentUser?.role === 'Admin';

  // ─── KPI Card component ─────────────────────────────────────────────────────
  const KPICard = ({ icon: Icon, label, value, color, bg, accent }) => (
    <Card className={`p-4 flex flex-col gap-3 border-slate-100 shadow-sm ${accent || ''}`}>
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg ${bg}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <span className="text-2xl font-bold text-text-primary">{value}</span>
      </div>
      <span className="text-xs font-semibold text-text-secondary">{label}</span>
    </Card>
  );

  // ─── Allocation row ─────────────────────────────────────────────────────────
  const AllocRow = ({ a }) => (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-5 py-3.5 font-mono text-xs font-bold text-primary">{a.assetTag}</td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          {a.assetImage
            ? <img src={`http://localhost:5000${a.assetImage}`} alt={a.assetName} className="h-8 w-8 rounded-lg object-cover border border-border shrink-0" onError={e => { e.target.style.display = 'none'; }} />
            : <div className="h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0"><Package className="h-4 w-4 text-slate-400" /></div>
          }
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{a.assetName}</p>
            <p className="text-xs text-text-secondary">{a.assetCategory}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <p className="text-sm font-semibold text-text-primary">{a.employeeName}</p>
        <p className="text-xs text-text-secondary">{a.employeeCode}</p>
      </td>
      <td className="px-5 py-3.5 text-sm text-text-secondary">{a.departmentName}</td>
      <td className="px-5 py-3.5 text-xs text-text-secondary font-mono">{a.allocationDate || '—'}</td>
      <td className="px-5 py-3.5 text-xs text-text-secondary font-mono">
        {a.expectedReturnDate
          ? <span className={a.status === 'Overdue' ? 'text-red-600 font-bold' : ''}>{a.expectedReturnDate}</span>
          : '—'
        }
      </td>
      <td className="px-5 py-3.5">
        <Badge variant={STATUS_BADGE[a.status] || 'secondary'}>{a.status}</Badge>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1.5">
          <button onClick={() => navigate(`/allocations/${a.id}`)} title="View Details"
            className="p-1.5 rounded-lg text-text-secondary hover:text-primary hover:bg-slate-100 transition-colors">
            <Eye className="h-4 w-4" />
          </button>
          {isAdmin && a.status !== 'Returned' && a.status !== 'Transferred' && (
            <button onClick={() => openReturn(a)} title="Return Asset"
              className="p-1.5 rounded-lg text-text-secondary hover:text-green-600 hover:bg-green-50 transition-colors">
              <CornerDownLeft className="h-4 w-4" />
            </button>
          )}
          {isAdmin && (a.status === 'Active' || a.status === 'Overdue') && (
            <button onClick={() => navigate(`/transfers?asset=${a.assetId}`)} title="Request Transfer"
              className="p-1.5 rounded-lg text-text-secondary hover:text-blue-600 hover:bg-blue-50 transition-colors">
              <ArrowLeftRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );

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

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <PageHeader
            title="Asset Allocation & Transfer"
            description="Manage asset assignments, returns, and department transfers across the organization."
          />
          {isAdmin && (
            <Button onClick={() => setAllocModal(true)} className="flex items-center gap-2 self-start sm:self-auto">
              <Plus className="h-4 w-4" /> Allocate Asset
            </Button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border gap-1">
          {[
            { key: 'dashboard', label: 'Dashboard', icon: Layers },
            { key: 'directory', label: 'Allocation Directory', icon: ClipboardList },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <Card className="p-12 flex flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm font-medium text-text-secondary">Loading allocation data...</p>
          </Card>
        ) : (
          <>
            {/* ── DASHBOARD TAB ── */}
            {activeTab === 'dashboard' && (
              <div className="flex flex-col gap-6 animate-fade-in">

                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <KPICard icon={Users}        label="Allocated Assets"   value={stats.allocated}        color="text-blue-600"   bg="bg-blue-50"   />
                  <KPICard icon={AlertTriangle} label="Pending Transfers"  value={stats.pendingTransfers} color="text-amber-600"  bg="bg-amber-50"  />
                  <KPICard icon={AlertTriangle} label="Overdue Returns"    value={stats.overdueCount}     color="text-red-600"    bg="bg-red-50"    />
                  <KPICard icon={CheckCircle2}  label="Returned Today"     value={stats.returnedToday}    color="text-green-600"  bg="bg-green-50"  />
                  <KPICard icon={Package}       label="Available Assets"   value={stats.availableAssets}  color="text-slate-600"  bg="bg-slate-100" />
                </div>

                {/* Recent Allocations */}
                <Card className="bg-white shadow-sm border border-border overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-primary" /> Recent Allocations
                    </h3>
                    <button onClick={() => setActiveTab('directory')} className="text-xs text-primary font-semibold hover:underline">
                      View All →
                    </button>
                  </div>
                  {recentAllocs.length === 0 ? (
                    <div className="p-8 text-center text-sm text-text-secondary">No allocations yet.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-border text-[10px] font-bold uppercase text-text-secondary">
                            {['Asset Tag','Asset','Employee','Department','Date','Expected Return','Status'].map(h => (
                              <th key={h} className="px-5 py-3">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                          {recentAllocs.map(a => (
                            <tr key={a.id} className="hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => navigate(`/allocations/${a.id}`)}>
                              <td className="px-5 py-3 font-mono text-xs font-bold text-primary">{a.assetTag}</td>
                              <td className="px-5 py-3 font-semibold text-text-primary">{a.assetName}</td>
                              <td className="px-5 py-3 text-text-secondary">{a.employeeName}</td>
                              <td className="px-5 py-3 text-text-secondary">{a.departmentName}</td>
                              <td className="px-5 py-3 text-xs font-mono">{a.allocationDate || '—'}</td>
                              <td className="px-5 py-3 text-xs font-mono">{a.expectedReturnDate || '—'}</td>
                              <td className="px-5 py-3"><Badge variant={STATUS_BADGE[a.status] || 'secondary'}>{a.status}</Badge></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* ── DIRECTORY TAB ── */}
            {activeTab === 'directory' && (
              <div className="flex flex-col gap-4 animate-fade-in">

                {/* Filter toolbar */}
                <Card className="p-4 bg-white shadow-sm border border-border">
                  <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
                    {/* Search */}
                    <div className="relative flex-1 min-w-0 w-full lg:max-w-xs">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input type="text" placeholder="Search asset, employee..."
                        value={searchQuery}
                        onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        className="w-full h-10 pl-9 pr-4 bg-white border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text-primary"
                      />
                    </div>

                    {/* Dropdowns */}
                    <div className="grid grid-cols-2 gap-3 w-full lg:w-auto lg:grid-cols-2">
                      {[
                        { label: 'Status',     val: statusFilter, set: setStatusFilter, opts: [{ value:'Active',label:'Active' },{ value:'Overdue',label:'Overdue' },{ value:'Returned',label:'Returned' },{ value:'Transferred',label:'Transferred' }], ph: 'All Statuses' },
                        { label: 'Department', val: deptFilter,   set: setDeptFilter,   opts: departments.map(d => ({ value: d.department_name, label: d.department_name })), ph: 'All Departments' },
                      ].map(({ label, val, set, opts, ph }) => (
                        <div key={label} className="flex flex-col gap-1 min-w-[140px]">
                          <span className="text-[10px] text-text-secondary font-bold uppercase">{label}</span>
                          <RawSelect value={val} onChange={e => { set(e.target.value); setCurrentPage(1); }} options={opts} placeholder={ph} />
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Table */}
                {filtered.length === 0 ? (
                  <EmptyState
                    title="No Allocations Found"
                    description="No allocation records match your search criteria."
                    icon={ClipboardList}
                    actionButton={isAdmin ? (
                      <Button onClick={() => setAllocModal(true)} className="flex items-center gap-2 text-sm">
                        <Plus className="h-4 w-4" /> Allocate Asset
                      </Button>
                    ) : null}
                  />
                ) : (
                  <Card className="bg-white shadow-sm border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-border">
                            {['Asset Tag','Asset','Employee','Department','Alloc. Date','Exp. Return','Status','Actions'].map(h => (
                              <th key={h} className="px-5 py-3.5 text-[10px] font-bold uppercase text-text-secondary tracking-wide">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                          {paginated.map(a => <AllocRow key={a.id} a={a} />)}
                        </tbody>
                      </table>
                    </div>
                    <div className="px-5">
                      <Pagination currentPage={currentPage} totalItems={filtered.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
                    </div>
                  </Card>
                )}
              </div>
            )}
          </>
        )}

        {/* ─── ALLOCATE ASSET MODAL ─────────────────────────────────────────────── */}
        <Modal isOpen={allocModal} onClose={() => setAllocModal(false)} title="Allocate Asset" size="lg">
          <form onSubmit={handleAllocSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Asset */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-primary">Asset *</label>
                <RawSelect
                  name="assetId"
                  value={allocForm.assetId}
                  onChange={handleAllocField}
                  options={assets.map(a => ({ value: a.id, label: `${a.assetTag} — ${a.assetName}` }))}
                  placeholder="Select available asset"
                />
                {allocErrors.assetId && <span className="text-xs text-red-500">{allocErrors.assetId}</span>}
                {assets.length === 0 && (
                  <span className="text-xs text-amber-600 font-medium">No available assets at the moment.</span>
                )}
              </div>

              {/* Employee */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-primary">Employee *</label>
                <RawSelect
                  name="employeeId"
                  value={allocForm.employeeId}
                  onChange={handleAllocField}
                  options={employees.map(e => ({ value: e.id, label: `${e.fullName} (${e.employeeCode})` }))}
                  placeholder="Select employee"
                />
                {allocErrors.employeeId && <span className="text-xs text-red-500">{allocErrors.employeeId}</span>}
              </div>

              {/* Department */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-primary">Department *</label>
                <RawSelect
                  name="departmentId"
                  value={allocForm.departmentId}
                  onChange={handleAllocField}
                  options={departments.map(d => ({ value: d.id, label: d.department_name }))}
                  placeholder="Select department"
                />
                {allocErrors.departmentId && <span className="text-xs text-red-500">{allocErrors.departmentId}</span>}
              </div>

              {/* Allocation Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-primary">Allocation Date *</label>
                <Input name="allocationDate" type="date" value={allocForm.allocationDate} onChange={handleAllocField} error={allocErrors.allocationDate} />
              </div>

              {/* Expected Return Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-primary">Expected Return Date</label>
                <Input name="expectedReturnDate" type="date" value={allocForm.expectedReturnDate} onChange={handleAllocField} />
              </div>

              {/* Purpose */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-primary">Purpose</label>
                <Input name="purpose" placeholder="e.g. Project work, Field assignment..." value={allocForm.purpose} onChange={handleAllocField} />
              </div>
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-primary">Notes</label>
              <textarea name="notes" rows={3} value={allocForm.notes} onChange={handleAllocField}
                placeholder="Additional instructions or notes..."
                className="w-full rounded-lg border border-border p-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setAllocModal(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="flex items-center gap-2">
                {submitting && <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                Allocate Asset
              </Button>
            </div>
          </form>
        </Modal>

        {/* ─── RETURN ASSET MODAL ───────────────────────────────────────────────── */}
        <Modal isOpen={returnModal} onClose={() => setReturnModal(false)} title="Return Asset" size="sm">
          <div className="flex flex-col gap-4">
            {targetAlloc && (
              <div className="p-3 bg-slate-50 rounded-xl border border-border">
                <p className="text-xs font-bold text-text-secondary uppercase mb-1">Returning</p>
                <p className="text-sm font-bold text-text-primary">{targetAlloc.assetTag} — {targetAlloc.assetName}</p>
                <p className="text-xs text-text-secondary mt-0.5">Currently held by: <span className="font-semibold">{targetAlloc.employeeName}</span></p>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-primary">Asset Condition on Return *</label>
              <div className="relative">
                <select
                  value={returnForm.condition}
                  onChange={e => setReturnForm(p => ({ ...p, condition: e.target.value }))}
                  className="w-full h-10 px-3 py-2 bg-white border border-border rounded-lg text-sm outline-none appearance-none focus:border-primary focus:ring-1 focus:ring-primary text-text-primary pr-8"
                >
                  {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-primary">Return Notes</label>
              <textarea rows={3} value={returnForm.returnNotes}
                onChange={e => setReturnForm(p => ({ ...p, returnNotes: e.target.value }))}
                placeholder="Any notes about the return condition, damages, etc."
                className="w-full rounded-lg border border-border p-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setReturnModal(false)}>Cancel</Button>
              <Button onClick={handleReturn} disabled={submitting} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                {submitting && <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                <CornerDownLeft className="h-4 w-4" /> Confirm Return
              </Button>
            </div>
          </div>
        </Modal>

      </div>
    </AppLayout>
  );
};

export default Allocation;
