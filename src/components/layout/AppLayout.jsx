import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Package, 
  ArrowLeftRight, 
  CalendarDays, 
  Wrench, 
  ClipboardCheck, 
  BarChart3, 
  Bell, 
  Menu, 
  X, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import Logo from './Logo';
import { getUser, clearAuth } from '../../utils/api';

export const AppLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const checkActive = (itemPath) => {
    const path = location.pathname;
    if (itemPath === '/dashboard') return path === '/dashboard';
    if (itemPath === '/allocation') {
      return path.startsWith('/allocation') || path.startsWith('/transfers');
    }
    return path.startsWith(itemPath);
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Organization Setup', path: '/organization-setup', icon: Building2 },
    { name: 'Assets', path: '/assets', icon: Package },
    { name: 'Allocation & Transfer', path: '/allocation', icon: ArrowLeftRight },
    { name: 'Resource Booking', path: '/booking', icon: CalendarDays },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench },
    { name: 'Audit', path: '/audit', icon: ClipboardCheck },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Notifications', path: '/notifications', icon: Bell },
  ];

  const user = getUser() || { fullName: 'User', email: 'user@company.com', role: 'Employee', department: 'N/A' };
  const initials = user.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'US';

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex font-sans antialiased text-text-primary">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-border flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Logo size="md" />
        </div>
        
        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = checkActive(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-slate-50'
                }`}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-text-primary'
                }`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        {/* User logout section */}
        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-danger hover:bg-red-50 transition-colors focus-ring"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Sidebar Drawer overlay for Mobile/Tablet */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
          
          {/* Drawer sidebar panel */}
          <aside className="relative flex flex-col w-64 max-w-xs h-full bg-white border-r border-border animate-slide-up z-50">
            <div className="h-16 flex items-center justify-between px-6 border-b border-border">
              <Logo size="md" />
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-50 border border-transparent hover:border-border text-text-secondary focus-ring"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = checkActive(item.path);
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-text-secondary hover:text-text-primary hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-border">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-danger hover:bg-red-50 transition-colors focus-ring"
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main viewport Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10 sticky top-0 flex-shrink-0">
          <div className="flex items-center gap-4">
            {/* Hamburger menu button for small viewports */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-slate-50 transition-colors focus-ring"
              aria-label="Open navigation menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            {/* Logo for mobile view (hidden on desktop sidebar) */}
            <div className="lg:hidden flex items-center">
              <Logo size="sm" />
            </div>
            
            {/* Search Mockup */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-border rounded-lg max-w-xs text-text-secondary select-none">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-xs font-medium">Quick search...</span>
              <kbd className="text-[10px] bg-white border border-border px-1.5 py-0.5 rounded shadow-sm font-semibold">Ctrl+K</kbd>
            </div>
          </div>

          {/* User profile actions */}
          <div className="flex items-center gap-4">
            {/* Quick alert notifications mockup */}
            <button className="relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-slate-50 transition-colors focus-ring">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            </button>

            {/* Vertical divider */}
            <div className="h-5 w-px bg-slate-200"></div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-slate-50 transition-colors focus-ring"
              >
                <div className="h-8 w-8 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold border border-blue-200 text-sm">
                  {initials}
                </div>
                <div className="hidden md:flex flex-col items-start text-left">
                  <span className="text-xs font-bold text-text-primary leading-none">{user.fullName}</span>
                  <span className="text-[10px] text-text-secondary font-medium">{user.role} {user.department && user.department !== 'N/A' ? `(${user.department})` : ''}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
 
              {isUserDropdownOpen && (
                <>
                  {/* Click trigger area to close */}
                  <div className="fixed inset-0 z-20" onClick={() => setIsUserDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-xl shadow-lg py-1.5 z-30 animate-fade-in">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-xs font-bold text-text-primary">{user.fullName}</p>
                      <p className="text-[10px] text-text-secondary overflow-hidden text-ellipsis">{user.email}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{user.role} • {user.department || 'N/A'}</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-red-50 transition-colors text-left font-semibold"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* View Content Slot */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background">
          {children}
        </main>
      </div>

    </div>
  );
};

export default AppLayout;
