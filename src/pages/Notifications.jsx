import React, { useState, useMemo } from 'react';
import AppLayout from '../components/layout/AppLayout';
import PageHeader from '../components/layout/PageHeader';
import mockNotifications from '../data/notifications';
import NotificationCard from '../components/NotificationCard';
import NotificationTable from '../components/NotificationTable';
import NotificationDrawer from '../components/NotificationDrawer';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import Pagination from '../components/Pagination';
import { 
  Bell, 
  MailOpen, 
  AlertCircle, 
  Clock, 
  CheckCheck, 
  Grid, 
  Table, 
  SidebarOpen,
  SlidersHorizontal 
} from 'lucide-react';

const ITEMS_PER_PAGE = 6;
const TODAY_DATE = '2026-07-12'; // Mocking today's date context

export const Notifications = () => {
  // Notification State (simulating a database/state store)
  const [notifications, setNotifications] = useState(mockNotifications);
  
  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All'); // 'All', 'Unread', 'Today', 'System', 'Maintenance', 'Booking', 'Audit', 'Allocation'
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // Action Handlers (simulate API triggers)
  // ---------------------------------------------------------------------------
  
  // PUT /api/notifications/:id/read
  const handleMarkRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: 'Read' } : n))
    );
  };

  // DELETE /api/notifications/:id
  const handleDelete = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // PUT /api/notifications/read-all
  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, status: 'Read' })));
  };

  // BULK Actions for Table View
  const handleBulkMarkRead = (ids) => {
    setNotifications((prev) =>
      prev.map((n) => (ids.includes(n.id) ? { ...n, status: 'Read' } : n))
    );
  };

  const handleBulkDelete = (ids) => {
    setNotifications((prev) => prev.filter((n) => !ids.includes(n.id)));
  };

  // ---------------------------------------------------------------------------
  // Statistics Calculations
  // ---------------------------------------------------------------------------
  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((n) => n.status === 'Unread').length;
    const today = notifications.filter((n) => n.date === TODAY_DATE).length;
    const overdue = notifications.filter((n) => 
      (n.type || '').toLowerCase().includes('overdue') || 
      (n.title || '').toLowerCase().includes('overdue')
    ).length;

    return { total, unread, today, overdue };
  }, [notifications]);

  // ---------------------------------------------------------------------------
  // Filter & Search Logic (Client-side)
  // ---------------------------------------------------------------------------
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      // 1. Search Query check
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        n.title.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // 2. Tab Filter check
      if (activeTab === 'All') return true;
      if (activeTab === 'Unread') return n.status === 'Unread';
      if (activeTab === 'Today') return n.date === TODAY_DATE;
      
      // Matches the category
      return n.category.toLowerCase() === activeTab.toLowerCase();
    });
  }, [notifications, searchQuery, activeTab]);

  // Pagination bounds
  const totalPages = Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE);
  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredNotifications.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredNotifications, currentPage]);

  const handleTabChange = (val) => {
    setActiveTab(val);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Categories Map for horizontal filter tabs
  const tabOptions = [
    { label: 'All Notifications', value: 'All' },
    { label: 'Unread', value: 'Unread' },
    { label: 'Today', value: 'Today' },
    { label: 'System', value: 'System' },
    { label: 'Maintenance', value: 'Maintenance' },
    { label: 'Booking', value: 'Booking' },
    { label: 'Audit', value: 'Audit' },
    { label: 'Allocation', value: 'Allocation' },
  ];

  return (
    <AppLayout>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <PageHeader 
            title="Activity Logs & Notifications" 
            description="Manage system-wide alerts, user notices, and background schedules."
          />
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-350 rounded-xl font-bold text-sm shadow-sm transition-all duration-200"
            >
              <SidebarOpen className="h-4.5 w-4.5 text-slate-500" />
              <span>Open Drawer Demo</span>
            </button>

            <button
              onClick={handleMarkAllRead}
              disabled={stats.unread === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-sm shadow-sm transition-all duration-200"
            >
              <CheckCheck className="h-4.5 w-4.5" />
              <span>Mark All Read</span>
            </button>
          </div>
        </div>

        {/* Top Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4">
            <div className="p-3 bg-blue-50 border border-blue-100 text-primary rounded-xl">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Alerts</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.total}</h3>
            </div>
          </div>

          {/* Card 2: Unread */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4">
            <div className="p-3 bg-amber-50 border border-amber-100 text-amber-600 rounded-xl">
              <MailOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unread</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.unread}</h3>
            </div>
          </div>

          {/* Card 3: Today's Alerts */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Alerts</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.today}</h3>
            </div>
          </div>

          {/* Card 4: Overdue Return Alerts */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4">
            <div className="p-3 bg-red-50 border border-red-100 text-red-650 rounded-xl">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overdue returns</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.overdue}</h3>
            </div>
          </div>
        </div>

        {/* Action Panel: Filters & View Toggles */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
            {/* Search Input */}
            <div className="flex-1">
              <SearchBar 
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search notifications by title, description..."
                onClear={() => setSearchQuery('')}
              />
            </div>

            {/* Layout Toggles */}
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-lg border border-slate-250 bg-slate-50 p-1" aria-label="View switch">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    viewMode === 'cards'
                      ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Grid className="h-3.5 w-3.5" />
                  <span>Cards</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    viewMode === 'table'
                      ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Table className="h-3.5 w-3.5" />
                  <span>Table</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filter Categories Panel */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Categories:</span>
          </div>
          <FilterPanel 
            tabs={tabOptions} 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
          />
        </div>

        {/* Display Content List */}
        <div className="min-h-[400px]">
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 gap-4">
              {paginatedNotifications.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-16 text-center text-slate-400">
                  <AlertCircle className="h-10 w-10 mx-auto text-slate-350 animate-pulse mb-3" />
                  <p className="text-sm font-semibold">No notifications found.</p>
                  <p className="text-xs mt-1">Try tweaking your search terms or filters.</p>
                </div>
              ) : (
                paginatedNotifications.map((notif) => (
                  <NotificationCard 
                    key={notif.id} 
                    notification={notif} 
                    onMarkRead={handleMarkRead}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
          ) : (
            <NotificationTable 
              notifications={paginatedNotifications} 
              onMarkRead={handleMarkRead}
              onDelete={handleDelete}
              onBulkMarkRead={handleBulkMarkRead}
              onBulkDelete={handleBulkDelete}
            />
          )}
        </div>

        {/* Pagination Section */}
        {filteredNotifications.length > 0 && (
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalEntries={filteredNotifications.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        )}

        {/* Notification Drawer Side-sheet */}
        <NotificationDrawer 
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          notifications={notifications}
          onMarkAllRead={handleMarkAllRead}
          onMarkRead={handleMarkRead}
        />

      </div>
    </AppLayout>
  );
};

export default Notifications;
