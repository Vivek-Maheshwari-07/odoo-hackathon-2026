import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch, getUser } from '../utils/api';
import AppLayout from '../components/layout/AppLayout';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import Button from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import Input from '../components/common/Input';
import Alert, { AlertDescription } from '../components/common/Alert';
import {
  ArrowLeft,
  ArrowLeftRight,
  Edit2,
  Trash2,
  Calendar,
  DollarSign,
  MapPin,
  Activity,
  History,
  Package,
  User,
  ShieldAlert,
  Upload
} from 'lucide-react';

const STATUS_BADGE = {
  Available:           'success',
  Allocated:           'primary',
  Reserved:            'warning',
  'Under Maintenance': 'warning',
  Lost:                'danger',
  Retired:             'danger',
  Disposed:            'danger',
};

const STATUSES   = ['Available', 'Allocated', 'Reserved', 'Under Maintenance', 'Lost', 'Retired', 'Disposed'];
const CONDITIONS = ['New', 'Good', 'Fair', 'Poor'];

// Inline select for forms — avoids incorrect prop types on the reusable Select
const RawSelect = ({ name, value, onChange, options }) => (
  <div className="relative">
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full h-10 px-3 py-2 bg-white border border-border rounded-lg text-sm outline-none appearance-none focus:border-primary focus:ring-1 focus:ring-primary text-text-primary pr-8"
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
    <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-slate-400">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
);

const AssetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [asset,       setAsset]       = useState(null);
  const [categories,  setCategories]  = useState([]);
  const [departments, setDepartments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [notification,setNotification]= useState(null);

  const [isEditOpen,  setIsEditOpen]  = useState(false);
  const [isDelOpen,   setIsDelOpen]   = useState(false);

  const [form, setForm] = useState({
    assetName: '', category: '', serialNumber: '',
    purchaseDate: '', purchaseCost: '', condition: 'Good',
    location: '', department: '', isShared: false, description: '', status: 'Available',
  });
  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formErrors,   setFormErrors]   = useState({});
  const [submitting,   setSubmitting]   = useState(false);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchDetails = () => {
    setLoading(true);
    Promise.all([
      apiFetch(`/assets/${id}`),
      apiFetch('/categories'),
      apiFetch('/departments'),
    ])
      .then(([a, c, d]) => {
        setAsset(a);
        setCategories(Array.isArray(c) ? c.filter(x => x.status === 'Active') : []);
        setDepartments(Array.isArray(d) ? d.filter(x => x.status === 'Active') : []);
      })
      .catch(err => showNotification('danger', err.message || 'Failed to load asset profile.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const profile = getUser();
    if (!profile) { navigate('/login'); return; }
    setCurrentUser(profile);
    fetchDetails();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const openEdit = () => {
    if (!asset) return;
    setForm({
      assetName:    asset.assetName,
      category:     asset.category,
      serialNumber: asset.serialNumber,
      purchaseDate: asset.purchaseDate || '',
      purchaseCost: asset.purchaseCost !== undefined ? String(asset.purchaseCost) : '',
      condition:    asset.condition || 'Good',
      location:     asset.location,
      department:   asset.department,
      isShared:     asset.isShared || false,
      description:  asset.description || '',
      status:       asset.status,
    });
    setImageFile(null);
    setImagePreview(asset.image || null);
    setFormErrors({});
    setIsEditOpen(true);
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

  const handleSave = (e) => {
    e.preventDefault();
    const errors = {};
    if (!form.assetName.trim())    errors.assetName    = 'Asset name is required.';
    if (!form.category)            errors.category     = 'Category is required.';
    if (!form.serialNumber.trim()) errors.serialNumber = 'Serial number is required.';
    if (!form.location.trim())     errors.location     = 'Location is required.';
    if (!form.department)          errors.department   = 'Department is required.';
    if (Object.keys(errors).length) { setFormErrors(errors); return; }

    setSubmitting(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (imageFile) fd.append('image', imageFile);

    apiFetch(`/assets/${id}`, { method: 'PUT', body: fd })
      .then(res => {
        showNotification('success', res.message || 'Asset updated successfully.');
        setIsEditOpen(false);
        fetchDetails();
      })
      .catch(err => showNotification('danger', err.message || 'Error saving changes.'))
      .finally(() => setSubmitting(false));
  };

  const triggerDelete = () => {
    if (asset?.status === 'Allocated') {
      showNotification('danger', 'Cannot delete an allocated asset. Please deallocate it first.');
      return;
    }
    setIsDelOpen(true);
  };

  const confirmDelete = () => {
    apiFetch(`/assets/${id}`, { method: 'DELETE' })
      .then(() => navigate('/assets'))
      .catch(err => {
        showNotification('danger', err.message || 'Error deleting asset.');
        setIsDelOpen(false);
      });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center p-12 gap-3 min-h-[400px]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-semibold text-text-secondary">Retrieving asset profile...</p>
        </div>
      </AppLayout>
    );
  }

  if (!asset) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto mt-12">
          <Alert variant="danger">
            <AlertDescription className="font-bold text-sm">
              Asset not found or has been deleted.
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate('/assets')} className="mt-4 w-full">Back to Asset Inventory</Button>
        </div>
      </AppLayout>
    );
  }

  const canManage = currentUser?.role === 'Admin' || currentUser?.role === 'Asset Manager';
  const imageUrl = asset.image
    ? (asset.image.startsWith('http') ? asset.image : `http://localhost:5000${asset.image}`)
    : null;

  return (
    <AppLayout>
      <div className="flex flex-col gap-6 max-w-[1200px] mx-auto animate-fade-in">

        {/* Notification toast */}
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

        {/* Back navigation */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <button
            onClick={() => navigate('/assets')}
            className="flex items-center gap-2 text-sm font-bold text-text-secondary hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Asset Directory
          </button>

          {canManage && (
            <div className="flex items-center gap-2">
              <Button onClick={openEdit} variant="secondary" className="flex items-center gap-1.5 text-xs h-9">
                <Edit2 className="h-3.5 w-3.5" /> Edit Details
              </Button>
              <button
                onClick={triggerDelete}
                disabled={asset.status === 'Allocated'}
                className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete Asset
              </button>
            </div>
          )}
        </div>

        {/* Main profile grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visual block */}
          <Card className="lg:col-span-1 p-6 bg-white flex flex-col items-center text-center shadow-sm border border-border">
            <div className="w-full aspect-video rounded-xl bg-slate-50 border border-border flex items-center justify-center overflow-hidden mb-4">
              {imageUrl ? (
                <img src={imageUrl} alt={asset.assetName} className="h-full w-full object-cover" />
              ) : (
                <Package className="h-16 w-16 text-slate-300" />
              )}
            </div>

            <Badge variant={STATUS_BADGE[asset.status] || 'secondary'} className="mb-3 text-xs px-3 py-1">
              {asset.status}
            </Badge>

            <h2 className="text-xl font-bold text-text-primary mb-1">{asset.assetName}</h2>
            <span className="font-mono text-xs font-semibold text-primary mb-4 bg-blue-50 px-2.5 py-1 rounded">{asset.assetTag}</span>

            <div className="w-full border-t border-slate-100 pt-4 flex flex-col gap-2.5 text-left text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary font-medium">Category:</span>
                <span className="font-semibold text-text-primary">{asset.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary font-medium">Serial No.:</span>
                <span className="font-mono font-semibold text-slate-600 text-xs">{asset.serialNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary font-medium">Shared:</span>
                <Badge variant={asset.isShared ? 'primary' : 'secondary'} className="text-[10px]">
                  {asset.isShared ? 'Shared Resource' : 'Dedicated'}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Deployment & specs */}
          <Card className="lg:col-span-2 p-6 bg-white shadow-sm border border-border">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
              Deployment &amp; Specifications
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-text-secondary font-medium flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" /> Office Location
                </span>
                <span className="font-bold text-text-primary">{asset.location}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-text-secondary font-medium flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-slate-400" /> Condition
                </span>
                <Badge
                  variant={['New', 'Good'].includes(asset.condition) ? 'success' : 'warning'}
                  className="self-start"
                >
                  {asset.condition}
                </Badge>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-text-secondary font-medium flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5 text-slate-400" /> Owning Department
                </span>
                <span className="font-bold text-text-primary">{asset.department}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-text-secondary font-medium flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" /> Purchase Date
                </span>
                <span className="font-bold text-text-primary">{asset.purchaseDate || '—'}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-text-secondary font-medium flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-slate-400" /> Purchase Cost
                </span>
                <span className="font-bold text-text-primary">
                  {asset.purchaseCost ? `$${Number(asset.purchaseCost).toLocaleString()}` : '—'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mt-5 border-t border-slate-100 pt-4 flex flex-col gap-2">
              <span className="text-xs text-text-secondary font-bold uppercase tracking-wider">Notes</span>
              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-wrap leading-relaxed">
                {asset.description || 'No description available.'}
              </p>
            </div>
          </Card>
        </div>

        {/* Lifecycle timeline */}
        <Card className="p-5 bg-white shadow-sm border border-border">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <History className="h-4 w-4 text-primary" />
            Lifecycle Timeline
          </h3>
          {asset.timeline?.length > 0 ? (
            <div className="flex flex-col gap-3">
              {asset.timeline.map(item => (
                <div key={item.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="h-8 w-8 rounded-lg bg-white border border-border flex items-center justify-center shrink-0">
                    {item.type === 'transfer'
                      ? <ArrowLeftRight className="h-4 w-4 text-sky-600" />
                      : item.type === 'return'
                        ? <Package className="h-4 w-4 text-green-600" />
                        : <History className="h-4 w-4 text-primary" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-primary">{item.label}</p>
                    <p className="text-xs text-text-secondary">{item.user}</p>
                  </div>
                  <span className="font-mono text-xs text-text-secondary shrink-0">{item.date || '—'}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-secondary italic">No lifecycle history available.</p>
          )}
        </Card>

        {/* History tables */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Allocation history */}
          <Card className="md:col-span-2 p-5 bg-white shadow-sm border border-border">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <User className="h-4 w-4 text-primary" />
              Allocation &amp; Assignment Log
            </h3>
            {asset.allocationHistory?.length > 0 ? (
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-border text-[10px] text-text-secondary font-bold uppercase">
                      <th className="px-4 py-2">Personnel</th>
                      <th className="px-4 py-2">Department</th>
                      <th className="px-4 py-2">From</th>
                      <th className="px-4 py-2">To</th>
                      <th className="px-4 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {asset.allocationHistory.map(h => (
                      <tr key={h.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-text-primary">{h.employee}</td>
                        <td className="px-4 py-3">{h.department}</td>
                        <td className="px-4 py-3 font-mono">{h.allocatedDate}</td>
                        <td className="px-4 py-3 font-mono">
                          {h.returnedDate || <span className="text-green-600 font-bold">Active</span>}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={h.status === 'Active' ? 'success' : h.status === 'Returned' ? 'secondary' : 'info'}>{h.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-text-secondary italic">No allocation history available.</p>
            )}
          </Card>

          {/* Transfer log */}
          <Card className="md:col-span-1 p-5 bg-white shadow-sm border border-border">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ArrowLeftRight className="h-4 w-4 text-sky-500" />
              Transfer Log
            </h3>
            {asset.transferHistory?.length > 0 ? (
              <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1">
                {asset.transferHistory.map(t => (
                  <div key={t.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-text-primary">{t.fromEmployee} to {t.toEmployee}</span>
                      <Badge variant={t.status === 'Approved' ? 'success' : t.status === 'Pending' ? 'warning' : 'danger'} className="text-[10px]">{t.status}</Badge>
                    </div>
                    <span className="text-slate-500">{t.fromDepartment} to {t.toDepartment}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{t.approvedAt || t.createdAt}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-secondary italic">No transfer records available.</p>
            )}
          </Card>
        </div>

        {/* Edit Modal */}
        <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Asset Details" size="lg">
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Asset Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-primary">Asset Name *</label>
                <Input name="assetName" placeholder="e.g. MacBook Pro M3" value={form.assetName} onChange={handleField} error={formErrors.assetName} />
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-primary">Category *</label>
                <RawSelect name="category" value={form.category} onChange={handleField} options={categories.map(c => c.category_name)} />
                {formErrors.category && <span className="text-xs text-red-500 font-medium">{formErrors.category}</span>}
              </div>

              {/* Serial Number */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-primary">Serial Number *</label>
                <Input name="serialNumber" placeholder="e.g. C02X87GEJG05" value={form.serialNumber} onChange={handleField} error={formErrors.serialNumber} />
              </div>

              {/* Condition */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-primary">Condition</label>
                <RawSelect name="condition" value={form.condition} onChange={handleField} options={CONDITIONS} />
              </div>

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
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-primary">Department *</label>
                <RawSelect name="department" value={form.department} onChange={handleField} options={departments.map(d => d.department_name)} />
                {formErrors.department && <span className="text-xs text-red-500 font-medium">{formErrors.department}</span>}
              </div>

              {/* Status */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-primary">Status</label>
                <RawSelect name="status" value={form.status} onChange={handleField} options={STATUSES} />
              </div>

              {/* Shared */}
              <div className="flex items-center gap-3 mt-3">
                <input type="checkbox" id="shared-edit" name="isShared" checked={form.isShared} onChange={handleField}
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
                <label htmlFor="shared-edit" className="text-xs font-bold text-text-primary cursor-pointer select-none">
                  Shared Corporate Resource
                </label>
              </div>
            </div>

            {/* Image Upload */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-text-primary">Upload Image</span>
              <div className="flex items-center gap-3">
                <label htmlFor="asset-img-edit" className="flex items-center gap-2 px-4 py-2 border border-slate-300 hover:border-slate-400 bg-slate-50 rounded-lg text-xs font-bold cursor-pointer transition-colors text-slate-700">
                  <Upload className="h-4 w-4" /> Browse Files
                </label>
                <input id="asset-img-edit" type="file" accept="image/*" className="hidden" onChange={handleImage} />
                {imagePreview && (
                  <div className="h-12 w-12 border border-border rounded-lg overflow-hidden shrink-0">
                    <img
                      src={imagePreview.startsWith('data:') ? imagePreview : `http://localhost:5000${imagePreview}`}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>
              {formErrors.image && <span className="text-xs text-red-500 font-medium">{formErrors.image}</span>}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-primary">Notes</label>
              <textarea name="description" rows={3} value={form.description} onChange={handleField}
                placeholder="Additional notes or configuration details..."
                className="w-full rounded-lg border border-border p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary placeholder-slate-400 outline-none resize-none" />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="flex items-center gap-2">
                {submitting && <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={isDelOpen} onClose={() => setIsDelOpen(false)} title="Delete Asset Record" size="sm">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="text-xs font-semibold leading-relaxed">
                This action is <strong>irreversible</strong>. The asset record and image will be permanently removed.
              </p>
            </div>
            <p className="text-sm text-text-secondary">
              Delete <strong>"{asset?.assetName}"</strong> ({asset?.assetTag})?
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setIsDelOpen(false)}>Cancel</Button>
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

export default AssetDetails;
