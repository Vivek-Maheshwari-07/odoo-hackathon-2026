import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, getUser } from '../utils/api';
import AppLayout from '../components/layout/AppLayout';
import PageHeader from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import Input from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import Button from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { Pagination } from '../components/common/Pagination';
import Alert, { AlertDescription } from '../components/common/Alert';

import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Upload,
  AlertTriangle
} from 'lucide-react';

// Status colors map
const STATUS_BADGE = {
  Available:         'success',
  Allocated:         'primary',
  Reserved:          'warning',
  'Under Maintenance': 'warning',
  Lost:              'danger',
  Retired:           'danger',
  Disposed:          'danger',
};

const STATUSES   = ['Available', 'Allocated', 'Reserved', 'Under Maintenance', 'Lost', 'Retired', 'Disposed'];
const CONDITIONS = ['New', 'Good', 'Fair', 'Poor'];

const ITEMS_PER_PAGE = 6;

const Assets = () => {
  const navigate = useNavigate();

  // -------------------------------------------------------
  // State
  // -------------------------------------------------------
  const [assets,      setAssets]      = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [departments, setDepartments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [loading,       setLoading]       = useState(true);
  const [notification,  setNotification]  = useState(null);
  const [submitting,    setSubmitting]     = useState(false);

  // Filters
  const [searchQuery,    setSearchQuery]    = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter,   setStatusFilter]   = useState('');
  const [deptFilter,     setDeptFilter]     = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  // Modal
  const [isModalOpen,   setIsModalOpen]   = useState(false);
  const [editingAsset,  setEditingAsset]  = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);

  // Form
  const [form, setForm] = useState({
    assetName:    '',
    category:     '',
    serialNumber: '',
    purchaseDate: '',
    purchaseCost: '',
    condition:    'Good',
    location:     '',
    department:   '',
    isShared:     false,
    description:  '',
    status:       'Available',
  });
  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formErrors,   setFormErrors]   = useState({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // -------------------------------------------------------
  // Helpers
  // -------------------------------------------------------
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      apiFetch('/assets'),
      apiFetch('/categories'),
      apiFetch('/departments'),
    ])
      .then(([a, c, d]) => {
        setAssets(Array.isArray(a) ? a : []);
        setCategories(Array.isArray(c) ? c.filter(x => x.status === 'Active') : []);
        setDepartments(Array.isArray(d) ? d.filter(x => x.status === 'Active') : []);
      })
      .catch(err => showNotification('danger', err.message || 'Failed to load asset data.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const profile = getUser();
    if (!profile) { navigate('/login'); return; }
    setCurrentUser(profile);
    fetchAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------------------------------------
  // KPI metrics
  // -------------------------------------------------------
  const metrics = useMemo(() => ({
    total:       assets.length,
    available:   assets.filter(a => a.status === 'Available').length,
    allocated:   assets.filter(a => a.status === 'Allocated').length,
    maintenance: assets.filter(a => a.status === 'Under Maintenance').length,
    lost:        assets.filter(a => a.status === 'Lost').length,
    retired:     assets.filter(a => a.status === 'Retired').length,
  }), [assets]);

  // unique locations for filter
  const locationOptions = useMemo(() => {
    return [...new Set(assets.map(a => a.location).filter(Boolean))];
  }, [assets]);

  // -------------------------------------------------------
  // Filtered list
  // -------------------------------------------------------
  const filtered = useMemo(() => {
    return assets.filter(a => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !searchQuery ||
        a.assetName.toLowerCase().includes(q) ||
        a.assetTag.toLowerCase().includes(q) ||
        a.serialNumber.toLowerCase().includes(q);
      const matchCat  = !categoryFilter || a.category  === categoryFilter;
      const matchStat = !statusFilter   || a.status    === statusFilter;
      const matchDept = !deptFilter     || a.department === deptFilter;
      const matchLoc  = !locationFilter || a.location  === locationFilter;
      return matchSearch && matchCat && matchStat && matchDept && matchLoc;
    });
  }, [assets, searchQuery, categoryFilter, statusFilter, deptFilter, locationFilter]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  // -------------------------------------------------------
  // Form helpers
  // -------------------------------------------------------
  const resetForm = () => {
    setForm({
      assetName: '', category: categories[0]?.category_name || '',
      serialNumber: '', purchaseDate: '', purchaseCost: '',
      condition: 'Good', location: '', department: departments[0]?.department_name || '',
      isShared: false, description: '', status: 'Available',
    });
    setImageFile(null);
    setImagePreview(null);
    setFormErrors({});
  };

  const handleField = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFormErrors(prev => ({ ...prev, image: 'Only image files are allowed.' }));
      return;
    }
    setImageFile(file);
    setFormErrors(prev => ({ ...prev, image: null }));
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const openAdd = () => {
    setEditingAsset(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEdit = (asset) => {
    setEditingAsset(asset);
    setForm({
      assetName:    asset.assetName,
      category:     asset.category,
      serialNumber: asset.serialNumber,
      purchaseDate: asset.purchaseDate || '',
      purchaseCost: asset.purchaseCost !== undefined ? String(asset.purchaseCost) : '',
      condition:    asset.condition    || 'Good',
      location:     asset.location,
      department:   asset.department,
      isShared:     asset.isShared     || false,
      description:  asset.description  || '',
      status:       asset.status,
    });
    setImageFile(null);
    setImagePreview(asset.image || null);
    setFormErrors({});
    setIsModalOpen(true);
  };

  // -------------------------------------------------------
  // Save asset (create / update)
  // -------------------------------------------------------
  const handleSave = (e) => {
    e.preventDefault();
    const errors = {};
    if (!form.assetName.trim())    errors.assetName    = 'Asset name is required.';
    if (!form.category)            errors.category     = 'Category is required.';
    if (!form.serialNumber.trim()) errors.serialNumber = 'Serial number is required.';
    if (!form.location.trim())     errors.location     = 'Location is required.';
    if (!form.department)          errors.department   = 'Department is required.';

    // client-side serial duplicate check
    const dup = assets.find(a =>
      a.serialNumber.toLowerCase() === form.serialNumber.trim().toLowerCase() &&
      (!editingAsset || a.id !== editingAsset.id)
    );
    if (dup) errors.serialNumber = 'Serial number is already in use by another asset.';

    if (Object.keys(errors).length) { setFormErrors(errors); return; }

    setSubmitting(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (imageFile) fd.append('image', imageFile);

    const endpoint = editingAsset ? `/assets/${editingAsset.id}` : '/assets';
    apiFetch(endpoint, { method: editingAsset ? 'PUT' : 'POST', body: fd })
      .then(res => {
        showNotification('success', res.message || 'Asset saved successfully.');
        setIsModalOpen(false);
        fetchAll();
      })
      .catch(err => showNotification('danger', err.message || 'Error saving asset.'))
      .finally(() => setSubmitting(false));
  };

  // -------------------------------------------------------
  // Delete asset
  // -------------------------------------------------------
  const triggerDelete = (asset) => {
    if (asset.status === 'Allocated') {
      showNotification('danger', 'Cannot delete an allocated asset. Please deallocate it first.');
      return;
    }
    setAssetToDelete(asset);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    apiFetch(`/assets/${assetToDelete.id}`, { method: 'DELETE' })
      .then(res => {
        showNotification('success', res.message || 'Asset deleted.');
        setIsConfirmOpen(false);
        setAssetToDelete(null);
        fetchAll();
      })
      .catch(err => {
        showNotification('danger', err.message || 'Error deleting asset.');
        setIsConfirmOpen(false);
      });
  };

  const isAdmin = currentUser?.role === 'Admin';

  // -------------------------------------------------------
  // Render helpers
  // -------------------------------------------------------
  const KPICard = ({ label, value, color, accent }) => (
    <Card className={`p-4 bg-white flex flex-col justify-between border-slate-100 shadow-sm ${accent ? `border-l-4 ${accent}` : ''}`}>
      <span className="text-xs text-text-secondary font-medium">{label}</span>
      <div className="flex items-baseline justify-between mt-2">
        <span className={`text-2xl font-bold ${color}`}>{value}</span>
        <span className={`w-2 h-2 rounded-full ${accent ? accent.replace('border-l-', 'bg-') : 'bg-slate-300'}`}></span>
      </div>
    </Card>
  );

  // -------------------------------------------------------
  // Form fields helper
  // -------------------------------------------------------
  const FormSelect = ({ name, label, options, error }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-text-primary">{label}</label>
      <div className="relative">
        <select
          name={name}
          value={form[name]}
          onChange={handleField}
          className={`w-full h-10 px-3 py-2 bg-white border rounded-lg text-sm outline-none appearance-none
            ${error ? 'border-red-400 focus:ring-1 focus:ring-red-400' : 'border-border focus:border-primary focus:ring-1 focus:ring-primary'}
            text-text-primary pr-8`}
        >
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
  );

  // -------------------------------------------------------
  // Modal form body (shared for add + edit)
  // -------------------------------------------------------
  const AssetForm = () => (
    <form onSubmit={handleSave} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Asset Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-text-primary">Asset Name *</label>
          <Input
            name="assetName"
            placeholder="e.g. Dell Latitude 5440"
            value={form.assetName}
            onChange={handleField}
            error={formErrors.assetName}
          />
        </div>

        {/* Category */}
        <FormSelect
          name="category"
          label="Category *"
          options={categories.map(c => c.category_name)}
          error={formErrors.category}
        />

        {/* Serial Number */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-text-primary">Serial Number *</label>
          <Input
            name="serialNumber"
            placeholder="e.g. C02X87GEJG05"
            value={form.serialNumber}
            onChange={handleField}
            error={formErrors.serialNumber}
          />
        </div>

        {/* Condition */}
        <FormSelect name="condition" label="Condition" options={CONDITIONS} />

        {/* Purchase Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-text-primary">Purchase Date</label>
          <Input name="purchaseDate" type="date" value={form.purchaseDate} onChange={handleField} />
        </div>

        {/* Purchase Cost */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-text-primary">Purchase Cost (USD)</label>
          <Input name="purchaseCost" type="number" step="0.01" placeholder="e.g. 1499.00" value={form.purchaseCost} onChange={handleField} />
        </div>

        {/* Location */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-text-primary">Location *</label>
          <Input name="location" placeholder="e.g. Floor 3, Bay A" value={form.location} onChange={handleField} error={formErrors.location} />
        </div>

        {/* Department */}
        <FormSelect
          name="department"
          label="Department *"
          options={departments.map(d => d.department_name)}
          error={formErrors.department}
        />

        {/* Status */}
        <FormSelect name="status" label="Status" options={STATUSES} />

        {/* Shared checkbox */}
        <div className="flex items-center gap-3 mt-4">
          <input
            type="checkbox"
            id="isShared-check"
            name="isShared"
            checked={form.isShared}
            onChange={handleField}
            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
          />
          <label htmlFor="isShared-check" className="text-xs font-bold text-text-primary cursor-pointer select-none">
            Shared Corporate Resource
          </label>
        </div>
      </div>

      {/* Image upload */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold text-text-primary">Upload Image</span>
        <div className="flex items-center gap-3">
          <label htmlFor="asset-img-input" className="flex items-center gap-2 px-4 py-2 border border-slate-300 hover:border-slate-400 bg-slate-50 rounded-lg text-xs font-bold cursor-pointer transition-colors text-slate-700">
            <Upload className="h-4 w-4" />
            Browse Files
          </label>
          <input id="asset-img-input" type="file" accept="image/*" className="hidden" onChange={handleImage} />
          {imagePreview && (
            <div className="h-12 w-12 border border-border rounded-lg overflow-hidden flex-shrink-0">
              <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
            </div>
          )}
          {imageFile && <span className="text-xs text-slate-500 truncate max-w-[120px]">{imageFile.name}</span>}
        </div>
        {formErrors.image && <span className="text-xs text-red-500 font-medium">{formErrors.image}</span>}
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-text-primary">Description / Notes</label>
        <textarea
          name="description"
          placeholder="Provide additional notes, configurations, or specifications..."
          rows={3}
          value={form.description}
          onChange={handleField}
          className="w-full rounded-lg border border-border p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary placeholder-slate-400 outline-none resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
        <Button type="submit" disabled={submitting} className="flex items-center gap-2">
          {submitting && <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />}
          {editingAsset ? 'Save Changes' : 'Register Asset'}
        </Button>
      </div>
    </form>
  );

  // -------------------------------------------------------
  // Render
  // -------------------------------------------------------
  return (
    <AppLayout>
      <div className="flex flex-col gap-6 max-w-[1400px] mx-auto animate-fade-in">

        {/* Toast notification */}
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
            title="Asset Management"
            description="Register, track and manage corporate equipment lifecycle, status and category policies."
          />
          {isAdmin && (
            <Button onClick={openAdd} className="flex items-center gap-2 self-start sm:self-auto">
              <Plus className="h-4 w-4" />
              Register Asset
            </Button>
          )}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <KPICard label="Total Assets"       value={metrics.total}       color="text-text-primary" />
          <KPICard label="Available"          value={metrics.available}   color="text-green-600"  accent="border-l-green-500" />
          <KPICard label="Allocated"          value={metrics.allocated}   color="text-blue-600"   accent="border-l-blue-500" />
          <KPICard label="Under Maintenance"  value={metrics.maintenance} color="text-amber-600"  accent="border-l-amber-500" />
          <KPICard label="Lost"               value={metrics.lost}        color="text-red-600"    accent="border-l-red-500" />
          <KPICard label="Retired"            value={metrics.retired}     color="text-slate-600"  accent="border-l-slate-400" />
        </div>

        {/* Filters */}
        <Card className="p-4 bg-white shadow-sm border border-border">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
            {/* Search */}
            <div className="relative flex-1 min-w-0 w-full lg:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, tag, serial..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full h-10 pl-9 pr-4 bg-white border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text-primary"
              />
            </div>

            {/* Filter dropdowns */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
              {[
                { label: 'Category',   val: categoryFilter, set: setCategoryFilter, opts: categories.map(c => c.category_name)              },
                { label: 'Status',     val: statusFilter,   set: setStatusFilter,   opts: STATUSES                                           },
                { label: 'Department', val: deptFilter,     set: setDeptFilter,     opts: departments.map(d => d.department_name)            },
                { label: 'Location',   val: locationFilter, set: setLocationFilter, opts: locationOptions                                    },
              ].map(({ label, val, set, opts }) => (
                <div key={label} className="flex flex-col gap-1">
                  <span className="text-[10px] text-text-secondary font-bold uppercase">{label}</span>
                  <div className="relative">
                    <select
                      value={val}
                      onChange={e => { set(e.target.value); setCurrentPage(1); }}
                      className="w-full h-9 px-2 pr-7 bg-white border border-border rounded-lg text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text-primary appearance-none"
                    >
                      <option value="">All</option>
                      {opts.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <div className="absolute inset-y-0 right-1.5 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Table */}
        {loading ? (
          <Card className="p-12 flex flex-col items-center justify-center gap-3 bg-white shadow-sm border border-border">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm font-medium text-text-secondary">Loading asset inventory...</p>
          </Card>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No Assets Found"
            description="No corporate assets match your current filters."
            icon={Package}
            actionButton={
              isAdmin ? (
                <Button onClick={openAdd} className="flex items-center gap-2 text-sm">
                  <Plus className="h-4 w-4" /> Register New Asset
                </Button>
              ) : null
            }
          />
        ) : (
          <Card className="bg-white shadow-sm border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-border">
                    {['Asset Tag','Asset Name','Category','Serial No.','Status','Location','Assigned To','Actions'].map(h => (
                      <th key={h} className="px-5 py-3.5 text-[10px] font-bold uppercase text-text-secondary tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {paginated.map(asset => (
                    <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-primary text-xs">{asset.assetTag}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {asset.image ? (
                            <img
                              src={`http://localhost:5000${asset.image}`}
                              alt={asset.assetName}
                              className="h-9 w-9 object-cover rounded-lg border border-border shrink-0"
                              onError={e => { e.target.style.display='none'; }}
                            />
                          ) : (
                            <div className="h-9 w-9 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                              <Package className="h-4 w-4 text-slate-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-text-primary truncate">{asset.assetName}</p>
                            <p className="text-xs text-text-secondary">{asset.department}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-text-secondary">{asset.category}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{asset.serialNumber}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={STATUS_BADGE[asset.status] || 'secondary'}>{asset.status}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-text-secondary">{asset.location}</td>
                      <td className="px-5 py-3.5 text-text-secondary text-xs">
                        {asset.status === 'Allocated' ? 'Assigned' : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => navigate(`/assets/${asset.id}`)}
                            title="View Details"
                            className="p-1.5 rounded-lg text-text-secondary hover:text-primary hover:bg-slate-100 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => openEdit(asset)}
                                title="Edit Asset"
                                className="p-1.5 rounded-lg text-text-secondary hover:text-amber-600 hover:bg-amber-50 transition-colors"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => triggerDelete(asset)}
                                title="Delete Asset"
                                className="p-1.5 rounded-lg text-text-secondary hover:text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-5">
              <Pagination
                currentPage={currentPage}
                totalItems={filtered.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={p => setCurrentPage(p)}
              />
            </div>
          </Card>
        )}

        {/* Register / Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingAsset ? 'Edit Asset Details' : 'Register New Asset'}
          size="lg"
        >
          <AssetForm />
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          title="Delete Asset Record"
          size="sm"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="text-xs font-semibold leading-relaxed">
                This action is <strong>irreversible</strong>. The asset record and uploaded image will be permanently removed.
              </p>
            </div>
            <p className="text-sm text-text-secondary">
              Are you sure you want to delete <strong>"{assetToDelete?.assetName}"</strong> ({assetToDelete?.assetTag})?
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Cancel</Button>
              <button
                onClick={confirmDelete}
                className="inline-flex items-center gap-2 h-10 px-4 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" /> Confirm Delete
              </button>
            </div>
          </div>
        </Modal>

      </div>
    </AppLayout>
  );
};

export default Assets;
