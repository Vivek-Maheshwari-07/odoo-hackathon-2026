// src/components/maintenance/PriorityBadge.jsx
import React from 'react';

const CONFIG = {
  LOW:      { label: 'Low',      bg: 'bg-slate-100',   text: 'text-slate-600',   border: 'border-slate-200', dot: 'bg-slate-400'   },
  MEDIUM:   { label: 'Medium',   bg: 'bg-blue-50',     text: 'text-blue-700',    border: 'border-blue-200',  dot: 'bg-blue-500'    },
  HIGH:     { label: 'High',     bg: 'bg-orange-50',   text: 'text-orange-700',  border: 'border-orange-200',dot: 'bg-orange-500'  },
  CRITICAL: { label: 'Critical', bg: 'bg-red-50',      text: 'text-red-700',     border: 'border-red-200',   dot: 'bg-red-500'     },
};

const PriorityBadge = ({ priority, size = 'sm' }) => {
  const cfg = CONFIG[priority] ?? CONFIG.MEDIUM;
  const textSize = size === 'xs' ? 'text-[10px]' : 'text-xs';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-semibold
                  border ${cfg.bg} ${cfg.text} ${cfg.border} ${textSize}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

export default PriorityBadge;
