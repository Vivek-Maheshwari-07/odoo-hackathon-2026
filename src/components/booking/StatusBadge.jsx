// src/components/booking/StatusBadge.jsx
import React from 'react';

const STATUS_CONFIG = {
  Upcoming:  { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500',   label: 'Upcoming'  },
  Ongoing:   { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500',  label: 'Ongoing'   },
  Completed: { bg: 'bg-gray-100',  text: 'text-gray-600',   dot: 'bg-gray-400',   label: 'Completed' },
  Cancelled: { bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-500',    label: 'Cancelled' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Upcoming;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

export default StatusBadge;
