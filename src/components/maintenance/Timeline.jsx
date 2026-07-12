// src/components/maintenance/Timeline.jsx
import React from 'react';
import { CheckCircle2, Clock, XCircle, Wrench, UserCheck, ThumbsUp } from 'lucide-react';

const STEP_ICON = {
  PENDING:             { Icon: Clock,       color: 'text-yellow-500', ring: 'ring-yellow-200', bg: 'bg-yellow-50'  },
  APPROVED:            { Icon: ThumbsUp,    color: 'text-blue-500',   ring: 'ring-blue-200',   bg: 'bg-blue-50'    },
  TECHNICIAN_ASSIGNED: { Icon: UserCheck,   color: 'text-purple-500', ring: 'ring-purple-200', bg: 'bg-purple-50'  },
  IN_PROGRESS:         { Icon: Wrench,      color: 'text-orange-500', ring: 'ring-orange-200', bg: 'bg-orange-50'  },
  RESOLVED:            { Icon: CheckCircle2,color: 'text-green-500',  ring: 'ring-green-200',  bg: 'bg-green-50'   },
  REJECTED:            { Icon: XCircle,     color: 'text-red-500',    ring: 'ring-red-200',    bg: 'bg-red-50'     },
};

const STATUS_LABEL = {
  PENDING:             'Request Raised',
  APPROVED:            'Approved by Manager',
  TECHNICIAN_ASSIGNED: 'Technician Assigned',
  IN_PROGRESS:         'Work In Progress',
  RESOLVED:            'Issue Resolved',
  REJECTED:            'Request Rejected',
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) : '';

const Timeline = ({ timeline = [] }) => {
  if (!timeline.length) {
    return <p className="text-sm text-slate-400 italic">No timeline entries yet.</p>;
  }

  return (
    <ol className="relative space-y-0">
      {timeline.map((entry, idx) => {
        const cfg = STEP_ICON[entry.toStatus] ?? STEP_ICON.PENDING;
        const { Icon } = cfg;
        const isLast = idx === timeline.length - 1;

        return (
          <li key={entry.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center
                              ring-4 ${cfg.ring} ${cfg.bg} flex-shrink-0 z-10`}>
                <Icon size={16} className={cfg.color} />
              </div>
              {!isLast && <div className="w-px flex-1 bg-slate-200 my-1" />}
            </div>

            <div className="pb-5 min-w-0">
              <p className="text-sm font-semibold text-slate-800">
                {STATUS_LABEL[entry.toStatus] ?? entry.toStatus}
              </p>
              {entry.note && (
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{entry.note}</p>
              )}
              <p className="text-[10px] text-slate-400 mt-1">{formatDate(entry.createdAt)}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default Timeline;
