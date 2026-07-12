import React, { useState, useMemo } from 'react';
import AppLayout from '../components/layout/AppLayout';
import PageHeader from '../components/layout/PageHeader';
import mockActivityLogs from '../data/activityLogs';
import ActivityTable from '../components/ActivityTable';
import Timeline from '../components/Timeline';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import Pagination from '../components/Pagination';
import { 
  Table, 
  History, 
  Filter, 
  ShieldAlert, 
  Activity 
} from 'lucide-react';

const ITEMS_PER_PAGE = 8;

export const ActivityLogs = () => {
  // Activity state (simulating database retrieval)
  const [logs] = useState(mockActivityLogs);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Pagination and Layout
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'timeline'

  // ---------------------------------------------------------------------------
  // Dropdown list generation (Dynamic from data)
  // ---------------------------------------------------------------------------
  const userOptions = useMemo(() => {
    return [...new Set(logs.map(log => log.user))].sort();
  }, [logs]);

  const moduleOptions = useMemo(() => {
    return [...new Set(logs.map(log => log.module))].sort();
  }, [logs]);

  const dateOptions = useMemo(() => {
    return [...new Set(logs.map(log => log.date))].sort((a, b) => new Date(b) - new Date(a));
  }, [logs]);

  // Standard action prefixes
  const actionOptions = [
    { label: 'Created Items', value: 'created' },
    { label: 'Registered Items', value: 'registered' },
    { label: 'Booked Items', value: 'booked' },
    { label: 'Approved Items', value: 'approved' },
    { label: 'Resolved Items', value: 'resolved' },
    { label: 'Completed Audits', value: 'completed' },
  ];

  // ---------------------------------------------------------------------------
  // Filter & Search Implementation (Client-side)
  // ---------------------------------------------------------------------------
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // 1. Text Search query
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        log.user.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.role.toLowerCase().includes(q) ||
        log.ipAddress.includes(q);

      if (!matchesSearch) return false;

      // 2. Select Dropdowns
      if (userFilter && log.user !== userFilter) return false;
      if (moduleFilter && log.module !== moduleFilter) return false;
      if (dateFilter && log.date !== dateFilter) return false;
      
      // Action filter checks prefix of action field
      if (actionFilter && !log.action.toLowerCase().includes(actionFilter.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [logs, searchQuery, userFilter, moduleFilter, dateFilter, actionFilter]);

  // Reset helper
  const handleResetFilters = () => {
    setSearchQuery('');
    setUserFilter('');
    setModuleFilter('');
    setActionFilter('');
    setDateFilter('');
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLogs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredLogs, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Setup options for the FilterPanel select inputs
  const dropdownConfigs = [
    {
      name: 'user',
      label: 'User',
      value: userFilter,
      options: userOptions,
      onChange: (val) => { setUserFilter(val); setCurrentPage(1); }
    },
    {
      name: 'module',
      label: 'Module',
      value: moduleFilter,
      options: moduleOptions,
      onChange: (val) => { setModuleFilter(val); setCurrentPage(1); }
    },
    {
      name: 'action',
      label: 'Action Type',
      value: actionFilter,
      options: actionOptions,
      onChange: (val) => { setActionFilter(val); setCurrentPage(1); }
    },
    {
      name: 'date',
      label: 'Date',
      value: dateFilter,
      options: dateOptions,
      onChange: (val) => { setDateFilter(val); setCurrentPage(1); }
    }
  ];

  return (
    <AppLayout>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <PageHeader 
            title="Activity Logs" 
            description="Audit trail of security events, administrative adjustments, and asset lifecycle actions."
          />
          
          {/* View Toggles */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm self-start sm:self-center">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                viewMode === 'table'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Table className="h-4 w-4" />
              <span>Table View</span>
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                viewMode === 'timeline'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <History className="h-4 w-4" />
              <span>Timeline View</span>
            </button>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="flex flex-col gap-4">
          {/* Text Search */}
          <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm flex items-center justify-between gap-4">
            <div className="flex-1">
              <SearchBar 
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search audit trail by user, action details, role, or IP address..."
                onClear={() => setSearchQuery('')}
              />
            </div>
            <div className="text-slate-400 text-sm hidden md:flex items-center gap-1.5 font-semibold">
              <Activity className="h-4 w-4 text-primary animate-pulse" />
              <span>Active audit</span>
            </div>
          </div>

          {/* Advanced select dropdown filters */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Advanced Filters:</span>
          </div>
          <FilterPanel 
            dropdowns={dropdownConfigs}
            onReset={handleResetFilters}
          />
        </div>

        {/* Table / Timeline Output Grid */}
        <div className="min-h-[450px]">
          {filteredLogs.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-16 text-center text-slate-400 flex flex-col items-center justify-center">
              <ShieldAlert className="h-10 w-10 text-slate-350 animate-pulse mb-3" />
              <p className="text-sm font-semibold">No transactions recorded.</p>
              <p className="text-xs mt-1">Try relaxing filters or search terms.</p>
            </div>
          ) : viewMode === 'table' ? (
            <ActivityTable logs={paginatedLogs} />
          ) : (
            <Timeline activities={paginatedLogs} />
          )}
        </div>

        {/* Pagination */}
        {filteredLogs.length > 0 && (
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalEntries={filteredLogs.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        )}

      </div>
    </AppLayout>
  );
};

export default ActivityLogs;
