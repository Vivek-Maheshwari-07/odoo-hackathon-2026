import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import DashboardCards from '../components/DashboardCards';
import BarChart from '../components/BarChart';
import LineChart from '../components/LineChart';
import DonutChart from '../components/DonutChart';
import Timeline from '../components/Timeline';
import NotificationCard from '../components/NotificationCard';
import { apiFetch, getUser } from '../utils/api';
import { 
  Plus, 
  Calendar, 
  Wrench, 
  ArrowRightLeft, 
  Building2, 
  ShieldAlert,
  Clock,
  Sparkles
} from 'lucide-react';

export const Dashboard = () => {
  const user = getUser() || { fullName: 'User', role: 'Employee' };
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch consolidated dashboard data from backend API
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const result = await apiFetch('/dashboard');
        setData(result);
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
        setError('Could not connect to database or aggregate dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Format today's date
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const isAdminOrManager = user.role === 'Admin' || user.role === 'Asset Manager';

  // ---------------------------------------------------------------------------
  // RENDER LOADING / ERROR STATES
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full animate-pulse">
          <div className="h-10 bg-slate-200 rounded-lg w-1/3"></div>
          <div className="h-32 bg-slate-200 rounded-xl w-full"></div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-[250px] bg-slate-200 rounded-xl lg:col-span-2"></div>
            <div className="h-[250px] bg-slate-200 rounded-xl"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !data) {
    return (
      <AppLayout>
        <div className="max-w-xl mx-auto text-center py-16 bg-white border border-slate-200 rounded-xl shadow-sm px-6">
          <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-xl font-bold text-slate-800">Connection Failed</h2>
          <p className="text-sm text-slate-500 mt-2">{error || 'An error occurred.'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-6 px-4 py-2 bg-primary text-white font-semibold rounded-lg text-sm hover:bg-blue-750 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
        
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-6 md:p-8 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-blue-100 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="h-4 w-4" />
              <span>AssetFlow Enterprise Portal</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {getGreeting()}, {data.fullName || user.fullName}!
            </h1>
            <p className="text-sm text-blue-100 mt-1 leading-relaxed max-w-xl">
              You are logged in as <strong className="text-white">{data.role}</strong>. Here is the operational summary for {formattedDate}.
            </p>
          </div>
          
          {/* Quick Actions Panel */}
          <div className="relative z-10 flex flex-wrap gap-2.5">
            {isAdminOrManager ? (
              <>
                <Link
                  to="/assets"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Register Asset</span>
                </Link>
                <Link
                  to="/allocation"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  <span>Assign Asset</span>
                </Link>
                <Link
                  to="/organization-setup"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-primary hover:bg-slate-50 border border-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  <Building2 className="h-4 w-4" />
                  <span>Organization Setup</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/booking"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-primary hover:bg-slate-50 border border-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Book Resource</span>
                </Link>
                <Link
                  to="/maintenance"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  <Wrench className="h-4 w-4" />
                  <span>Request Maintenance</span>
                </Link>
              </>
            )}
          </div>
          
          {/* Decorative background overlay shapes */}
          <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-white/5 skew-x-12 translate-x-1/3 pointer-events-none rounded-2xl"></div>
        </div>

        {/* ---------------------------------------------------------------------
            ROLE: Admin / Asset Manager View
            --------------------------------------------------------------------- */}
        {isAdminOrManager ? (
          <>
            {/* KPI Cards Grid */}
            <DashboardCards stats={data.kpis} />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <BarChart data={data.charts?.departmentAllocation} title="Asset Allocation by Department" />
              </div>
              <div>
                <DonutChart data={data.charts?.statusDistribution} title="Asset Status Distribution" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <DonutChart data={data.charts?.categoryDistribution} title="Asset Category Breakdown" />
              </div>
              <div className="lg:col-span-2">
                <LineChart data={data.charts?.maintenanceTrend} title="Maintenance Request Trends (Monthly)" />
              </div>
            </div>
          </>
        ) : (
          /* ---------------------------------------------------------------------
             ROLE: Employee / Standard User View
             --------------------------------------------------------------------- */
          <>
            {/* Employee Specific KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* KPI 1 */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">My Allocated Assets</p>
                  <h3 className="text-2xl font-bold text-slate-800">{data.kpis?.allocatedAssetsCount || 0}</h3>
                </div>
                <div className="p-3 bg-blue-50 text-primary border border-blue-100 rounded-xl">
                  <ArrowRightLeft className="h-6 w-6" />
                </div>
              </div>

              {/* KPI 2 */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Active Bookings</p>
                  <h3 className="text-2xl font-bold text-slate-800">{data.kpis?.activeBookingsCount || 0}</h3>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl">
                  <Calendar className="h-6 w-6" />
                </div>
              </div>

              {/* KPI 3 */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pending Maintenance</p>
                  <h3 className="text-2xl font-bold text-slate-800">{data.kpis?.pendingMaintenanceCount || 0}</h3>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 border border-amber-100 rounded-xl">
                  <Wrench className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* My Assets Checked Out Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <ArrowRightLeft className="h-4.5 w-4.5 text-primary" />
                  <span>My Allocated Equipment</span>
                </h3>
                <span className="text-xs font-semibold text-slate-500">Checked out items</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left">
                  <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-400 tracking-wider">
                    <tr>
                      <th className="px-6 py-3">Asset</th>
                      <th className="px-6 py-3">Asset Tag</th>
                      <th className="px-6 py-3">Serial Number</th>
                      <th className="px-6 py-3">Allocation Date</th>
                      <th className="px-6 py-3">Expected Return</th>
                      <th className="px-6 py-3">Condition</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-sm text-slate-700">
                    {(!data.myAllocations || data.myAllocations.length === 0) ? (
                      <tr>
                        <td colSpan="6" className="text-center py-6 text-slate-400">
                          You do not have any allocated assets at this time.
                        </td>
                      </tr>
                    ) : (
                      data.myAllocations.map(a => (
                        <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-3.5 font-bold text-slate-800">{a.assetName}</td>
                          <td className="px-6 py-3.5 font-mono text-xs">{a.assetTag}</td>
                          <td className="px-6 py-3.5 font-mono text-xs">{a.serialNumber}</td>
                          <td className="px-6 py-3.5 whitespace-nowrap">{a.allocationDate}</td>
                          <td className="px-6 py-3.5 whitespace-nowrap font-semibold text-amber-600">{a.expectedReturnDate}</td>
                          <td className="px-6 py-3.5">
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-primary border border-blue-200">
                              {a.condition}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Dynamic Split Rows (Activities, Alerts, Events) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline of Recent Activities */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-bold text-slate-800 text-base">Recent Activities</h3>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Audit Trail</span>
            </div>
            <Timeline activities={data.activities?.slice(0, 4)} />
          </div>

          {/* Side Panels: Upcoming Events & Alerts */}
          <div className="flex flex-col gap-6">
            
            {/* Upcoming Events / Calendar Grid */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3">
                <Clock className="h-4.5 w-4.5 text-primary" />
                <h3 className="font-bold text-slate-800 text-sm">Upcoming Schedules</h3>
              </div>
              <div className="flex flex-col gap-3">
                {data.events?.map(ev => (
                  <div key={ev.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg hover:border-slate-200 transition-all text-left">
                    <div className="flex justify-between items-center gap-2 mb-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        ev.type === 'booking' ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {ev.type}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">{ev.date}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800">{ev.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{ev.description}</p>
                    {ev.time && (
                      <div className="text-[10px] font-semibold text-slate-400 mt-1.5 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{ev.time}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Notification Cards list */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-bold text-slate-800 text-sm">Recent Alerts</h3>
                <Link to="/notifications" className="text-xs font-bold text-primary hover:text-blue-700">View All</Link>
              </div>
              <div className="flex flex-col gap-3.5">
                {data.notifications?.slice(0, 2).map(notif => (
                  <NotificationCard 
                    key={notif.id} 
                    notification={notif}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </AppLayout>
  );
};

export default Dashboard;
