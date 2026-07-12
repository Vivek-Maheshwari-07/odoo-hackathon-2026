import React from 'react';
import { 
  Wrench, 
  Calendar, 
  ClipboardCheck, 
  ArrowLeftRight, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  Mail,
  Trash2,
  Check
} from 'lucide-react';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';

// Helper to determine notification category icon
const getNotificationIcon = (type) => {
  const norm = (type || '').toLowerCase();
  
  if (norm.includes('assign')) {
    return <ArrowLeftRight className="h-5 w-5 text-blue-600" />;
  }
  if (norm.includes('return')) {
    return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
  }
  if (norm.includes('transfer') || norm.includes('approve')) {
    return <CheckCircle2 className="h-5 w-5 text-indigo-600" />;
  }
  if (norm.includes('confirm') || norm.includes('book')) {
    return <Calendar className="h-5 w-5 text-teal-600" />;
  }
  if (norm.includes('cancel')) {
    return <AlertTriangle className="h-5 w-5 text-amber-600" />;
  }
  if (norm.includes('maintenance')) {
    return <Wrench className="h-5 w-5 text-amber-500" />;
  }
  if (norm.includes('audit')) {
    return <ClipboardCheck className="h-5 w-5 text-purple-600" />;
  }
  if (norm.includes('lost') || norm.includes('overdue') || norm.includes('discrepancy')) {
    return <ShieldAlert className="h-5 w-5 text-rose-600" />;
  }
  
  return <Mail className="h-5 w-5 text-slate-500" />;
};

const getCategoryColor = (category) => {
  const norm = (category || '').toLowerCase();
  switch (norm) {
    case 'system':
      return 'bg-slate-50 border-slate-200';
    case 'maintenance':
      return 'bg-amber-50 border-amber-200';
    case 'booking':
      return 'bg-emerald-50 border-emerald-200';
    case 'audit':
      return 'bg-purple-50 border-purple-200';
    case 'allocation':
      return 'bg-blue-50 border-blue-200';
    default:
      return 'bg-slate-50 border-slate-200';
  }
};

/**
 * Reusable Notification Card Component
 * Displays notification summary, description, and status tags.
 * 
 * @param {Object} notification - Notification item
 * @param {function} onMarkRead - Event handler to mark notification as read
 * @param {function} onDelete - Event handler to delete notification
 */
export const NotificationCard = ({ 
  notification, 
  onMarkRead, 
  onDelete 
}) => {
  const { id, type, category, title, description, priority, status, date, time } = notification;
  const isUnread = status === 'Unread';

  return (
    <div className={`flex items-start gap-4 p-5 rounded-xl border transition-all duration-200 bg-white ${
      isUnread 
        ? 'border-l-4 border-l-primary border-slate-200 shadow-sm' 
        : 'border-slate-100 hover:border-slate-200'
    }`}>
      {/* Icon Frame */}
      <div className={`p-2.5 rounded-xl border flex-shrink-0 ${getCategoryColor(category)}`}>
        {getNotificationIcon(type || title)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`text-sm font-bold truncate ${isUnread ? 'text-slate-900' : 'text-slate-700'}`}>
              {title}
            </h3>
            <span className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider">
              {category}
            </span>
          </div>
          
          <div className="text-xs text-slate-400 flex-shrink-0">
            {date} • {time}
          </div>
        </div>

        <p className={`text-sm leading-relaxed mb-3 ${isUnread ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
          {description}
        </p>

        {/* Badges and Actions */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <PriorityBadge priority={priority} />
            <StatusBadge status={status} />
          </div>

          <div className="flex items-center gap-1">
            {isUnread && onMarkRead && (
              <button
                onClick={() => onMarkRead(id)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-primary hover:bg-blue-50 border border-transparent rounded-lg transition-colors"
                title="Mark as Read"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Mark Read</span>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(id)}
                className="inline-flex items-center p-1.5 text-xs text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Notification"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
