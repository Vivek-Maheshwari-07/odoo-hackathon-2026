// src/components/maintenance/StatusBadge.jsx
import React from 'react';

const CONFIG = {
  PENDING:             { label: 'Pending',             bg: 'bg-yellow-50',  text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500'  },
  APPROVED:            { label: 'Approved',            bg: 'bg-blue-50',    text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500'    },
  TECHNICIAN_ASSIGNED: { label: 'Tech Assigned',       bg: 'bg-purple-50',  text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500'  },
  IN_PROGRESS:         { label: 'In Progress',         bg: 'bg-orange-50',  text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500'  },
  RESOLVED:            { label: 'Resolved',            bg: 'bg-green-50',   text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-500'   },
  REJECTED:            { label: 'Rejected',            bg: 'bg-red-50',     text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-500'     },
};

const StatusBadge = ({ status, size = 'sm' }) => {
  const cfg = CONFIG[status] ?? CONFIG.PENDING;
  const textSize = size === 'xs' ? 'text-[10px]' : 'text-xs';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold
                  border ${cfg.bg} ${cfg.text} ${cfg.border} ${textSize}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse ${cfg.dot}`}
            style={{ animationPlayState: status === 'IN_PROGRESS' ? 'running' : 'paused' }} />
      {cfg.label}
    </span>
  );
};

export default StatusBadge;
