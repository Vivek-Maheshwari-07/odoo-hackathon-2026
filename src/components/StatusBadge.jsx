import React from 'react';

/**
 * Reusable Status Badge Component
 * Displays execution or read status indicators.
 * 
 * @param {string} status - Read | Unread | Success | Failed | Pending
 */
export const StatusBadge = ({ status }) => {
  const normalized = (status || '').toLowerCase();
  
  let colorClasses = '';
  switch (normalized) {
    case 'read':
      colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
      break;
    case 'unread':
      colorClasses = 'bg-blue-50 text-blue-700 border-blue-200 font-semibold';
      break;
    case 'success':
      colorClasses = 'bg-green-50 text-green-700 border-green-200';
      break;
    case 'failed':
      colorClasses = 'bg-red-50 text-red-700 border-red-200';
      break;
    case 'pending':
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
      break;
    default:
      colorClasses = 'bg-slate-50 text-slate-600 border-slate-200';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses}`}>
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
        normalized === 'success' || normalized === 'read' ? 'bg-green-500' :
        normalized === 'failed' ? 'bg-red-500' :
        normalized === 'pending' ? 'bg-amber-500' : 'bg-blue-500'
      }`}></span>
      {status}
    </span>
  );
};

export default StatusBadge;
