import React from 'react';
import { 
  Settings, 
  Package, 
  Calendar, 
  ArrowLeftRight, 
  Wrench, 
  ClipboardCheck, 
  User,
  ShieldAlert
} from 'lucide-react';
import StatusBadge from './StatusBadge';

// Helper to resolve icon by module
const getModuleIcon = (module) => {
  const norm = (module || '').toLowerCase();
  switch (norm) {
    case 'system':
      return <Settings className="h-4 w-4" />;
    case 'assets':
      return <Package className="h-4 w-4" />;
    case 'booking':
      return <Calendar className="h-4 w-4" />;
    case 'allocation':
      return <ArrowLeftRight className="h-4 w-4" />;
    case 'maintenance':
      return <Wrench className="h-4 w-4" />;
    case 'audit':
      return <ClipboardCheck className="h-4 w-4" />;
    default:
      return <User className="h-4 w-4" />;
  }
};

const getModuleColor = (module) => {
  const norm = (module || '').toLowerCase();
  switch (norm) {
    case 'system':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'assets':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'booking':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'allocation':
      return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    case 'maintenance':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'audit':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

/**
 * Reusable Timeline Component
 * Displays activity logs vertically with connecting lines and module-based icons.
 * 
 * @param {Array} activities - List of activity logs
 */
export const Timeline = ({ activities = [] }) => {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-200 rounded-xl">
        <ShieldAlert className="h-10 w-10 text-slate-400 animate-pulse mb-3" />
        <p className="text-sm font-semibold text-slate-600">No activity logs found matching the filters.</p>
      </div>
    );
  }

  return (
    <div className="flow-root bg-white p-6 border border-slate-200 rounded-xl shadow-sm">
      <ul className="-mb-8">
        {activities.map((activity, idx) => {
          const isLast = idx === activities.length - 1;
          const userInitials = activity.user
            ? activity.user.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
            : 'US';

          return (
            <li key={activity.id}>
              <div className="relative pb-8">
                {/* Vertical connecting line */}
                {!isLast && (
                  <span
                    className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-slate-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-start space-x-3">
                  {/* Circle with user initials or icon */}
                  <div className="relative flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-700 shadow-inner">
                      {userInitials}
                    </div>
                    {/* Tiny badge in the bottom-right corner representing the module icon */}
                    <span className={`absolute -bottom-1 -right-1 rounded-full p-1 border flex items-center justify-center ${getModuleColor(activity.module)} shadow-sm`}>
                      {getModuleIcon(activity.module)}
                    </span>
                  </div>

                  {/* Log Content Card */}
                  <div className="min-w-0 flex-1 bg-slate-50 hover:bg-slate-100/50 p-4 rounded-xl border border-slate-150 transition-all duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="text-sm">
                        <span className="font-bold text-slate-900">{activity.user}</span>{' '}
                        <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-200/60 rounded">
                          {activity.role}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <span>{activity.date}</span>
                        <span>•</span>
                        <span>{activity.time}</span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-slate-750">
                      <span className="text-slate-600">Action:</span> <span className="font-medium text-slate-800">{activity.action}</span>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500">
                          IP: <code className="font-mono text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-150">{activity.ipAddress}</code>
                        </span>
                        <span className="text-slate-500">
                          Module: <span className="font-semibold text-slate-700">{activity.module}</span>
                        </span>
                      </div>
                      <StatusBadge status={activity.status} />
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Timeline;
