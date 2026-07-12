import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Bell, ExternalLink, CheckCheck } from 'lucide-react';
import PriorityBadge from './PriorityBadge';

/**
 * NotificationDrawer Component
 * Slides in from the right to display the latest 10 notifications.
 * 
 * Props:
 * @param {boolean} isOpen - Control visibility of the drawer
 * @param {function} onClose - Handler to close the drawer
 * @param {Array} notifications - Array of all notifications
 * @param {function} onMarkAllRead - Handler to mark all notifications as read
 * @param {function} onMarkRead - Handler to mark a specific notification as read
 */
export const NotificationDrawer = ({
  isOpen,
  onClose,
  notifications = [],
  onMarkAllRead,
  onMarkRead
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  // Get only latest 10 notifications
  const latestTen = notifications.slice(0, 10);
  const unreadCount = notifications.filter(n => n.status === 'Unread').length;

  const handleViewAll = () => {
    onClose();
    navigate('/notifications');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
        {/* Panel body */}
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full animate-slide-up border-l border-slate-200">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="relative p-2 bg-blue-50 text-primary border border-blue-100 rounded-lg">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                )}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">Recent Alerts</h2>
                <p className="text-xs text-slate-500 font-medium">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Close panel"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {latestTen.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400 gap-2">
                <Bell className="h-8 w-8 text-slate-300" />
                <p className="text-sm font-semibold">All caught up!</p>
                <p className="text-xs">No notifications to display.</p>
              </div>
            ) : (
              latestTen.map((notif) => {
                const isUnread = notif.status === 'Unread';
                return (
                  <div
                    key={notif.id}
                    onClick={() => isUnread && onMarkRead && onMarkRead(notif.id)}
                    className={`p-4 rounded-xl border transition-all duration-200 text-left cursor-pointer ${
                      isUnread
                        ? 'bg-blue-50/30 border-blue-150 hover:bg-blue-50/50 shadow-sm'
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {notif.category}
                      </span>
                      <span className="text-[10px] text-slate-400">{notif.time}</span>
                    </div>
                    <h3 className={`text-sm font-bold truncate ${isUnread ? 'text-slate-900' : 'text-slate-700'}`}>
                      {notif.title}
                    </h3>
                    <p className={`text-xs mt-1 leading-relaxed line-clamp-2 ${isUnread ? 'text-slate-700' : 'text-slate-500'}`}>
                      {notif.description}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <PriorityBadge priority={notif.priority} />
                      {isUnread && (
                        <span className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
            <button
              onClick={onMarkAllRead}
              disabled={unreadCount === 0}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Mark All Read</span>
            </button>

            <button
              onClick={handleViewAll}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-primary hover:bg-blue-700 rounded-xl transition-all shadow-sm"
            >
              <span>View All</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default NotificationDrawer;
