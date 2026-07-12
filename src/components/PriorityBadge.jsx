import React from 'react';

/**
 * Reusable Priority Badge Component
 * Displays priority tags with modern enterprise colors.
 * 
 * @param {string} priority - Low | Medium | High | Critical
 */
export const PriorityBadge = ({ priority }) => {
  const normalized = (priority || '').toLowerCase();
  
  let colorClasses = '';
  switch (normalized) {
    case 'low':
      colorClasses = 'bg-green-50 text-green-700 border-green-200';
      break;
    case 'medium':
      colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
      break;
    case 'high':
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
      break;
    case 'critical':
      colorClasses = 'bg-red-50 text-red-700 border-red-200 font-bold';
      break;
    default:
      colorClasses = 'bg-slate-50 text-slate-600 border-slate-200';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClasses}`}>
      {priority}
    </span>
  );
};

export default PriorityBadge;
