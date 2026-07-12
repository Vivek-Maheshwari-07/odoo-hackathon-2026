import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch, getUser } from '../utils/api';
import AppLayout from '../components/layout/AppLayout';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import Button from '../components/common/Button';
import Alert, { AlertDescription } from '../components/common/Alert';
import {
  ArrowLeft,
  ArrowLeftRight,
  Briefcase,
  Calendar,
  CornerDownLeft,
  History,
  Package,
  User,
} from 'lucide-react';

const STATUS_BADGE = {
  Active: 'success',
  Overdue: 'danger',
  Returned: 'secondary',
  Transferred: 'info',
  Pending: 'warning',
  Approved: 'success',
  Rejected: 'danger',
};

const AllocationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [allocation, setAllocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const profile = getUser();
    if (!profile) {
      navigate('/login');
      return;
    }

    setLoading(true);
    apiFetch(`/allocations/${id}`)
      .then(setAllocation)
      .catch(err => setError(err.message || 'Failed to load allocation details.'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center p-12 gap-3 min-h-[400px]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-semibold text-text-secondary">Loading allocation details...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !allocation) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto mt-12">
          <Alert variant="danger">
            <AlertDescription className="font-bold text-sm">
              {error || 'Allocation record not found.'}
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate('/allocation')} className="mt-4 w-full">Back to Allocation</Button>
        </div>
      </AppLayout>
    );
  }

  const historyItems = [
    {
      id: `allocated-${allocation.id}`,
      icon: Briefcase,
      label: `Allocated to ${allocation.employeeName}`,
      detail: allocation.purpose || allocation.notes || 'Asset assignment created.',
      date: allocation.allocationDate,
      status: allocation.status,
    },
    ...(allocation.actualReturnDate ? [{
      id: `returned-${allocation.id}`,
      icon: CornerDownLeft,
      label: allocation.dbStatus === 'Transferred' ? 'Allocation transferred' : 'Asset returned',
      detail: allocation.notes || 'Allocation closed.',
      date: allocation.actualReturnDate,
      status: allocation.dbStatus,
    }] : []),
    ...(allocation.transferHistory || []).map(t => ({
      id: `transfer-${t.id}`,
      icon: ArrowLeftRight,
      label: `${t.fromEmployee} to ${t.toEmployee}`,
      detail: t.reason || `${t.fromDepartment} to ${t.toDepartment}`,
      date: t.approvedAt ? new Date(t.approvedAt).toISOString().split('T')[0] : new Date(t.createdAt).toISOString().split('T')[0],
      status: t.status,
    })),
  ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  return (
    <AppLayout>
      <div className="flex flex-col gap-6 max-w-[1100px] mx-auto animate-fade-in">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <button
            onClick={() => navigate('/allocation')}
            className="flex items-center gap-2 text-sm font-bold text-text-secondary hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Allocation
          </button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate(`/assets/${allocation.assetId}`)} className="gap-2">
              <Package className="h-4 w-4" /> Asset Profile
            </Button>
            {(allocation.status === 'Active' || allocation.status === 'Overdue') && (
              <Button onClick={() => navigate(`/transfers?asset=${allocation.assetId}`)} className="gap-2">
                <ArrowLeftRight className="h-4 w-4" /> Transfer
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 p-6 bg-white shadow-sm border border-border">
            <div className="flex flex-col items-center text-center">
              {allocation.assetImage ? (
                <img
                  src={`http://localhost:5000${allocation.assetImage}`}
                  alt={allocation.assetName}
                  className="w-full aspect-video object-cover rounded-xl border border-border bg-slate-50 mb-4"
                />
              ) : (
                <div className="w-full aspect-video rounded-xl border border-border bg-slate-50 flex items-center justify-center mb-4">
                  <Package className="h-14 w-14 text-slate-300" />
                </div>
              )}
              <Badge variant={STATUS_BADGE[allocation.status] || 'secondary'} className="mb-3">
                {allocation.status}
              </Badge>
              <h2 className="text-xl font-bold text-text-primary">{allocation.assetName}</h2>
              <span className="font-mono text-xs font-semibold text-primary mt-1">{allocation.assetTag}</span>
              <p className="text-xs text-text-secondary mt-2">{allocation.assetCategory}</p>
            </div>
          </Card>

          <Card className="lg:col-span-2 p-6 bg-white shadow-sm border border-border">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> Assignment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6 text-sm">
              <div>
                <p className="text-xs text-text-secondary font-medium">Employee</p>
                <p className="font-bold text-text-primary">{allocation.employeeName}</p>
                <p className="text-xs text-text-secondary">{allocation.employeeCode}</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary font-medium">Department</p>
                <p className="font-bold text-text-primary">{allocation.departmentName}</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary font-medium">Allocated By</p>
                <p className="font-bold text-text-primary">{allocation.allocatedByName}</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary font-medium">Purpose</p>
                <p className="font-bold text-text-primary">{allocation.purpose || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary font-medium flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" /> Allocation Date
                </p>
                <p className="font-mono font-bold text-text-primary">{allocation.allocationDate || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary font-medium flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" /> Expected Return
                </p>
                <p className="font-mono font-bold text-text-primary">{allocation.expectedReturnDate || '-'}</p>
              </div>
            </div>
            <div className="mt-5 border-t border-slate-100 pt-4">
              <p className="text-xs text-text-secondary font-bold uppercase tracking-wider mb-2">Notes</p>
              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-wrap">
                {allocation.notes || 'No notes available.'}
              </p>
            </div>
          </Card>
        </div>

        <Card className="p-5 bg-white shadow-sm border border-border">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
            <History className="h-4 w-4 text-primary" /> History Timeline
          </h3>
          <div className="flex flex-col gap-3">
            {historyItems.map(item => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="flex items-start gap-3 border border-slate-100 bg-slate-50 rounded-lg p-3">
                  <div className="h-8 w-8 rounded-lg bg-white border border-border flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-text-primary">{item.label}</p>
                      <Badge variant={STATUS_BADGE[item.status] || 'secondary'}>{item.status}</Badge>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">{item.detail}</p>
                  </div>
                  <span className="font-mono text-xs text-text-secondary shrink-0">{item.date || '-'}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AllocationDetails;
