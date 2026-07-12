import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '../components/layout/AppLayout';
import PageHeader from '../components/layout/PageHeader';
import FilterPanel from '../components/FilterPanel';
import DashboardCards from '../components/DashboardCards';
import BarChart from '../components/BarChart';
import LineChart from '../components/LineChart';
import PieChart from '../components/PieChart';
import DonutChart from '../components/DonutChart';
import Heatmap from '../components/Heatmap';
import ReportTable from '../components/ReportTable';
import ExportCard from '../components/ExportCard';
import { apiFetch } from '../utils/api';

/**
 * Reports and Analytics Module Dashboard page
 */
const Reports = () => {
  // Filters State
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    department: 'All',
    category: 'All',
    location: 'All',
    status: 'All'
  });

  // Data States
  const [kpiStats, setKpiStats] = useState({});
  const [assetData, setAssetData] = useState({
    statusDistribution: [],
    departmentAllocation: [],
    categoryDistribution: [],
    recentAssets: []
  });
  const [maintenanceData, setMaintenanceData] = useState({
    frequencyData: [],
    recentMaintenance: []
  });
  const [bookingData, setBookingData] = useState({
    heatmap: [],
    recentBookings: []
  });
  const [auditStats, setAuditStats] = useState({});

  // Dropdowns Lists for Filters
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);

  // UI States
  const [loading, setLoading] = useState(true);
  const [exportMessage, setExportMessage] = useState(null);

  // Fetch filter options
  const fetchFilterOptions = useCallback(async () => {
    try {
      const depts = await apiFetch('/departments');
      const cats = await apiFetch('/categories');
      setDepartments(depts || []);
      setCategories(cats || []);
    } catch (err) {
      console.error('Error fetching filter dropdown items:', err);
    }
  }, []);

  // Fetch core report statistics
  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Construct dynamic query string for filtered asset data
      const queryParams = new URLSearchParams();
      if (filters.department && filters.department !== 'All') queryParams.append('department', filters.department);
      if (filters.category && filters.category !== 'All') queryParams.append('category', filters.category);
      if (filters.location && filters.location !== 'All') queryParams.append('location', filters.location);
      if (filters.status && filters.status !== 'All') queryParams.append('status', filters.status);

      // Concurrent fetch
      const [kpis, assets, maintenance, bookings, audits] = await Promise.all([
        apiFetch('/reports/dashboard'),
        apiFetch(`/reports/assets?${queryParams.toString()}`),
        apiFetch('/reports/maintenance'),
        apiFetch('/reports/bookings'),
        apiFetch('/reports/audit')
      ]);

      if (kpis) setKpiStats(kpis);
      if (assets) setAssetData(assets);
      if (maintenance) setMaintenanceData(maintenance);
      if (bookings) setBookingData(bookings);
      if (audits) setAuditStats(audits);

    } catch (err) {
      console.error('Error fetching report dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    if (name === 'RESET') {
      setFilters({
        startDate: '',
        endDate: '',
        department: 'All',
        category: 'All',
        location: 'All',
        status: 'All'
      });
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle report exports
  const handleExport = async (type) => {
    try {
      const res = await apiFetch(`/reports/export?type=${type}`);
      if (res && res.message) {
        setExportMessage(res.message);
        setTimeout(() => setExportMessage(null), 5000);
      }
    } catch (err) {
      console.error('Export Error:', err);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <PageHeader
            title="Reports & Operational Insights"
            description="Real-time analytics and statistics across physical assets, allocations, booking schedules, and active audits."
          />
        </div>

        {/* Export Notification Flash */}
        {exportMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-4 py-3 rounded-lg flex items-center gap-3">
            <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">{exportMessage}</span>
          </div>
        )}

        {/* Row 1: KPI Statistics Overview */}
        <DashboardCards stats={kpiStats} />

        {/* Row 2: Filtering Panel */}
        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          departments={departments}
          categories={categories}
        />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-semibold text-slate-500">Compiling database metrics...</p>
          </div>
        ) : (
          <>
            {/* Historical Audit Cycle Summary Insights Banner */}
            {auditStats && auditStats.totalCycles > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Historical Audit Cycle Summary Insights
                  </h4>
                  <p className="text-xs text-amber-700 mt-1">
                    Across {auditStats.totalCycles} cycles, verified {auditStats.totalAssetsChecked} items. Found {auditStats.missingAssets} missing assets, {auditStats.damagedAssets} damaged assets, and {auditStats.wrongLocationAssets} misplaced items.
                  </p>
                </div>
              </div>
            )}

            {/* Row 3: Charts Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Asset Category Utilization */}
              <BarChart
                title="Asset Allocation by Category"
                data={assetData.categoryDistribution || []}
              />
              
              {/* Maintenance Frequency Requests */}
              <LineChart
                title="Maintenance Requests Frequency"
                data={maintenanceData.frequencyData || []}
              />

              {/* Department Allocation Pie Chart */}
              <PieChart
                title="Asset Distribution by Department"
                data={assetData.departmentAllocation || []}
              />

              {/* Asset Status Distribution Donut Chart */}
              <DonutChart
                title="Asset Status Distribution Summary"
                data={assetData.statusDistribution || []}
              />
            </div>

            {/* Row 4: Peak Booking Heatmap */}
            <div className="grid grid-cols-1 gap-6">
              <Heatmap
                title="Resource Booking Calendar Heatmap"
                data={bookingData.heatmap || []}
              />
            </div>

            {/* Row 5: Action Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Actions & Export Options */}
              <div className="lg:col-span-1">
                <ExportCard onExport={handleExport} />
              </div>

              {/* Recently Added Table Lists */}
              <div className="lg:col-span-2">
                <ReportTable
                  assets={assetData.recentAssets || []}
                  allocations={[]} // Optional, placeholder logic
                  maintenance={maintenanceData.recentMaintenance || []}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Reports;
