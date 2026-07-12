import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, getUser } from '../utils/api';

import AppLayout from '../components/layout/AppLayout';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/common/Button';
import { Card } from '../components/common/Card';
import Alert, { AlertDescription } from '../components/common/Alert';

import AuditCard from '../components/AuditCard';
import AuditTable from '../components/AuditTable';
import AuditModal from '../components/AuditModal';
import VerificationTable from '../components/VerificationTable';
import DiscrepancyCard from '../components/DiscrepancyCard';
import ProgressBar from '../components/ProgressBar';

import { 
  Plus, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  FolderLock,
  Download,
  Calendar,
  Building,
  UserCheck
} from 'lucide-react';

const Audit = () => {
  const navigate = useNavigate();

  // -------------------------------------------------------------
  // STATES
  // -------------------------------------------------------------
  const [currentUser, setCurrentUser] = useState(null);
  const [auditCycles, setAuditCycles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  // Details view state
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [auditItems, setAuditItems] = useState([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // -------------------------------------------------------------
  // NOTIFICATION HELPER
  // -------------------------------------------------------------
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // -------------------------------------------------------------
  // FETCH DATA
  // -------------------------------------------------------------
  const fetchCycles = async () => {
    try {
      const data = await apiFetch('/audit-cycles');
      setAuditCycles(Array.isArray(data) ? data : []);
    } catch (err) {
      showNotification('danger', err.message || 'Failed to retrieve audit cycles.');
    }
  };

  const fetchAuxiliaryData = async () => {
    try {
      const [depts, emps] = await Promise.all([
        apiFetch('/departments'),
        apiFetch('/employees'),
      ]);
      setDepartments(Array.isArray(depts) ? depts.filter(d => d.status === 'Active') : []);
      setEmployees(Array.isArray(emps) ? emps.filter(e => e.status === 'Active') : []);
    } catch (err) {
      console.error('Failed to load auxiliary lists:', err);
    }
  };

  const initData = async () => {
    setLoading(true);
    await Promise.all([fetchCycles(), fetchAuxiliaryData()]);
    setLoading(false);
  };

  useEffect(() => {
    const profile = getUser();
    if (!profile) {
      navigate('/login');
      return;
    }
    setCurrentUser(profile);
    initData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch items when a cycle is selected
  useEffect(() => {
    if (selectedCycle) {
      setItemsLoading(true);
      apiFetch(`/audit-items?auditCycleId=${selectedCycle.id}`)
        .then(data => {
          setAuditItems(Array.isArray(data) ? data : []);
        })
        .catch(err => showNotification('danger', err.message || 'Error loading assets in audit cycle.'))
        .finally(() => setItemsLoading(false));
    } else {
      setAuditItems([]);
    }
  }, [selectedCycle]);

  // -------------------------------------------------------------
  // STATISTICS METRICS
  // -------------------------------------------------------------
  const dashboardStats = useMemo(() => {
    let active = 0;
    let completed = 0;
    let missing = 0;
    let damaged = 0;

    auditCycles.forEach(c => {
      if (c.status === 'Active') active++;
      if (c.status === 'Completed') completed++;
      missing += c.stats?.missing || 0;
      damaged += c.stats?.damaged || 0;
    });

    return { active, completed, missing, damaged };
  }, [auditCycles]);

  // -------------------------------------------------------------
  // API EVENT HANDLERS
  // -------------------------------------------------------------
  const handleCreateCycle = async (formData) => {
    setActionLoading(true);
    try {
      const res = await apiFetch('/audit-cycles', {
        method: 'POST',
        body: formData
      });
      showNotification('success', res.message || 'Audit cycle created successfully.');
      setIsModalOpen(false);
      await fetchCycles();
    } catch (err) {
      showNotification('danger', err.message || 'Failed to create audit cycle.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartCycle = async (cycleId) => {
    setActionLoading(true);
    try {
      const res = await apiFetch(`/audit-cycles/${cycleId}`, {
        method: 'PUT',
        body: { status: 'Active' }
      });
      showNotification('success', res.message || 'Audit cycle started.');
      await fetchCycles();
      // If currently showing this cycle, update state
      if (selectedCycle && selectedCycle.id === cycleId) {
        setSelectedCycle(prev => ({ ...prev, status: 'Active' }));
      }
    } catch (err) {
      showNotification('danger', err.message || 'Failed to start audit cycle.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseCycle = async (cycleId) => {
    setActionLoading(true);
    try {
      const res = await apiFetch(`/audit-cycles/${cycleId}`, {
        method: 'PUT',
        body: { status: 'Completed' }
      });
      showNotification('success', res.message || 'Audit cycle closed successfully. Asset records updated.');
      await fetchCycles();
      // Update local selected state
      if (selectedCycle && selectedCycle.id === cycleId) {
        setSelectedCycle(prev => ({ ...prev, status: 'Completed' }));
      }
    } catch (err) {
      showNotification('danger', err.message || 'Failed to close audit cycle.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCycle = async (cycleId) => {
    if (!window.confirm('Are you sure you want to delete this audit cycle and all its verification history?')) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await apiFetch(`/audit-cycles/${cycleId}`, {
        method: 'DELETE'
      });
      showNotification('success', res.message || 'Audit cycle deleted.');
      if (selectedCycle && selectedCycle.id === cycleId) {
        setSelectedCycle(null);
      }
      await fetchCycles();
    } catch (err) {
      showNotification('danger', err.message || 'Failed to delete audit cycle.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveVerification = async (itemId, verificationData) => {
    try {
      const res = await apiFetch(`/audit-items/${itemId}`, {
        method: 'PUT',
        body: {
          verificationStatus: verificationData.verificationStatus,
          comments: verificationData.comments,
          incorrectLocation: verificationData.incorrectLocation
        }
      });
      
      // Update locally
      setAuditItems(prev => prev.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            verificationStatus: res.auditItem.verification_status,
            comments: res.auditItem.comments,
            incorrectLocation: res.auditItem.incorrect_location,
            verifiedBy: currentUser.fullName,
            verifiedAt: new Date().toISOString().split('T')[0]
          };
        }
        return item;
      }));

      // Trigger background update of cycle stats
      await fetchCycles();
      showNotification('success', 'Verification status updated.');
    } catch (err) {
      showNotification('danger', err.message || 'Failed to update asset verification.');
    }
  };

  // Sync selectedCycle local stats with updated list
  const currentCycleWithStats = useMemo(() => {
    if (!selectedCycle) return null;
    return auditCycles.find(c => c.id === selectedCycle.id) || selectedCycle;
  }, [selectedCycle, auditCycles]);

  // -------------------------------------------------------------
  // EXPORT CSV HELPER
  // -------------------------------------------------------------
  const handleExportCSV = () => {
    if (!selectedCycle || auditItems.length === 0) return;

    const discrepancies = auditItems.filter(
      item => item.verificationStatus === 'Missing' || 
              item.verificationStatus === 'Damaged' || 
              item.incorrectLocation
    );

    if (discrepancies.length === 0) {
      showNotification('warning', 'No discrepancies found to export.');
      return;
    }

    const headers = ['Asset ID', 'Asset Name', 'Location', 'Current Status', 'Verification Status', 'Incorrect Location', 'Comments', 'Verified By', 'Date'];
    const rows = discrepancies.map(i => [
      i.assetTag,
      i.assetName,
      i.location,
      i.currentStatus,
      i.verificationStatus,
      i.incorrectLocation ? 'Yes' : 'No',
      `"${(i.comments || '').replace(/"/g, '""')}"`,
      i.verifiedBy || '',
      i.verifiedAt || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `discrepancies_${selectedCycle.auditName.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isAdminOrManager = currentUser?.role === 'Admin' || currentUser?.role === 'Asset Manager';
  const isAuditorAssigned = useMemo(() => {
    if (!selectedCycle || !currentUser) return false;
    return selectedCycle.auditors.some(a => a.id === currentUser.id);
  }, [selectedCycle, currentUser]);

  const isVerifierAllowed = isAdminOrManager || isAuditorAssigned;

  // -------------------------------------------------------------
  // RENDER MAIN PANEL
  // -------------------------------------------------------------
  return (
    <AppLayout>
      <div className="flex flex-col gap-6 max-w-[1400px] mx-auto animate-fade-in">
        
        {/* Alerts / Toast */}
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

        {/* Dashboard Title & Actions */}
        {!selectedCycle ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <PageHeader
                title="Asset Audit Cycles"
                description="Manage structured asset verification audits, assign auditors, track discrepancy states, and close cycles."
              />
              {isAdminOrManager && (
                <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 self-start sm:self-auto shadow-sm">
                  <Plus className="h-4 w-4" />
                  Create Audit Cycle
                </Button>
              )}
            </div>

            {/* Statistics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <AuditCard label="Active Audit Cycles" value={dashboardStats.active} colorClass="text-amber-600" accentClass="border-l-amber-500" icon={Activity} />
              <AuditCard label="Completed Audits" value={dashboardStats.completed} colorClass="text-green-600" accentClass="border-l-green-500" icon={CheckCircle2} />
              <AuditCard label="Missing Assets" value={dashboardStats.missing} colorClass="text-red-600" accentClass="border-l-red-500" icon={AlertTriangle} />
              <AuditCard label="Damaged Assets" value={dashboardStats.damaged} colorClass="text-yellow-600" accentClass="border-l-yellow-500" icon={AlertTriangle} />
            </div>

            {/* Audit cycles list table */}
            {loading ? (
              <Card className="p-12 flex flex-col items-center justify-center gap-3 bg-white shadow-sm border border-border">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm font-medium text-text-secondary">Loading audit cycles...</p>
              </Card>
            ) : (
              <AuditTable
                auditCycles={auditCycles}
                onSelectCycle={setSelectedCycle}
                onDeleteCycle={handleDeleteCycle}
                onStartCycle={handleStartCycle}
                isAdminOrManager={isAdminOrManager}
              />
            )}
          </>
        ) : (
          /* Cycle Details & Verification Panel */
          <div className="flex flex-col gap-6">
            
            {/* Header / Navigation back */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedCycle(null)}
                className="p-2 bg-white hover:bg-slate-50 border border-border hover:border-slate-300 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Audit Management</span>
                <h1 className="text-xl font-bold text-text-primary mt-0.5">{selectedCycle.auditName}</h1>
              </div>
            </div>

            {/* Audit Details Summary Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Core info */}
              <Card className="p-5 bg-white shadow-sm border border-border rounded-xl lg:col-span-2 flex flex-col justify-between">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-slate-100 pb-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                      <Building className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-text-secondary font-bold uppercase">Department</p>
                      <p className="text-xs font-bold text-text-primary mt-0.5">{selectedCycle.departmentName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-text-secondary font-bold uppercase">Date Range</p>
                      <p className="text-xs font-bold text-text-primary mt-0.5">{selectedCycle.startDate} to {selectedCycle.endDate}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg shrink-0">
                      <UserCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-text-secondary font-bold uppercase">Created By</p>
                      <p className="text-xs font-bold text-text-primary mt-0.5">{selectedCycle.createdBy}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <ProgressBar 
                    value={currentCycleWithStats?.stats?.verified || 0} 
                    max={currentCycleWithStats?.stats?.total || 0} 
                  />
                </div>
              </Card>

              {/* Auditors and Actions card */}
              <Card className="p-5 bg-white shadow-sm border border-border rounded-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wide">Assigned Auditors</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedCycle.auditors.map(a => (
                      <span key={a.id} className="text-xs px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-md font-medium">
                        {a.fullName}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Audit Action triggers */}
                <div className="flex items-center gap-3 mt-4 border-t border-slate-100 pt-4">
                  {currentCycleWithStats?.status === 'Scheduled' && isAdminOrManager && (
                    <Button 
                      onClick={() => handleStartCycle(selectedCycle.id)} 
                      className="w-full flex items-center justify-center gap-1.5"
                    >
                      <Activity className="h-4 w-4" />
                      Start Audit Cycle
                    </Button>
                  )}
                  {currentCycleWithStats?.status === 'Active' && isAdminOrManager && (
                    <Button 
                      onClick={() => handleCloseCycle(selectedCycle.id)} 
                      disabled={actionLoading}
                      className="w-full bg-success hover:bg-green-600 border-none text-white flex items-center justify-center gap-1.5"
                    >
                      <FolderLock className="h-4 w-4" />
                      Close & Lock Audit
                    </Button>
                  )}
                  {currentCycleWithStats?.status === 'Completed' && (
                    <div className="w-full p-2.5 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2 text-xs font-bold justify-center select-none">
                      <FolderLock className="h-4 w-4 text-green-600" />
                      Audit Closed & Locked (Read-Only)
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Asset verifications section */}
            {itemsLoading ? (
              <Card className="p-12 flex flex-col items-center justify-center gap-3 bg-white shadow-sm border border-border">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-xs font-medium text-text-secondary">Loading cycle verification assets...</p>
              </Card>
            ) : (
              <>
                {/* Discrepancy report dashboard */}
                <DiscrepancyCard items={auditItems} />

                {/* Verification table & Export actions */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-text-primary">Verification Worksheet</h3>
                    {(auditItems.some(i => i.verificationStatus === 'Missing' || i.verificationStatus === 'Damaged' || i.incorrectLocation)) && (
                      <Button
                        onClick={handleExportCSV}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-[11px] h-8 shadow-sm"
                      >
                        <Download className="h-3 w-3" />
                        Export Discrepancies (CSV)
                      </Button>
                    )}
                  </div>

                  <VerificationTable
                    items={auditItems}
                    onSaveVerification={handleSaveVerification}
                    isReadOnly={currentCycleWithStats?.status === 'Completed' || !isVerifierAllowed}
                  />
                </div>
              </>
            )}

          </div>
        )}

        {/* Create Cycle Modal */}
        <AuditModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreate={handleCreateCycle}
          departments={departments}
          employees={employees}
        />

      </div>
    </AppLayout>
  );
};

export default Audit;
