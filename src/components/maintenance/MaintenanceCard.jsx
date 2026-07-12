// src/components/maintenance/MaintenanceCard.jsx
import React from 'react';
import { Wrench, User, Tag, MapPin, MoreVertical, Eye, Trash2 } from 'lucide-react';
import PriorityBadge from './PriorityBadge';
import StatusBadge   from './StatusBadge';

const PRIORITY_BORDER = {
  LOW:      'border-l-slate-400',
  MEDIUM:   'border-l-blue-400',
  HIGH:     'border-l-orange-400',
  CRITICAL: 'border-l-red-500',
};

const getAge = (createdAt) => {
  const diffMs  = Date.now() - new Date(createdAt).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60)   return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24)    return `${diffHrs}h ago`;
  return `${Math.floor(diffHrs / 24)}d ago`;
};

const MaintenanceCard = ({
  request,
  onView,
  onDelete,
  onDragStart,
  isDragging = false,
}) => {
  const borderColor = PRIORITY_BORDER[request.priority] ?? PRIORITY_BORDER.MEDIUM;
  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleDragStart = (e) => {
    e.dataTransfer.setData('requestId', String(request.id));
    e.dataTransfer.effectAllowed = 'move';
    onDragStart?.();
  };

  return (
    <div
      id={`maintenance-card-${request.id}`}
      draggable
      onDragStart={handleDragStart}
      className={`
        group relative bg-white rounded-xl border border-slate-200
        border-l-4 ${borderColor}
        shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing
        transition-all duration-150 select-none
        ${isDragging ? 'opacity-50 scale-95 rotate-1' : 'hover:-translate-y-0.5'}
      `}
    >
      <div className="px-4 pt-3 pb-2 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 leading-tight line-clamp-2">
            {request.issueTitle}
          </p>
          <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
            <Tag size={10} />
            <span className="font-mono">{request.asset?.assetTag ?? `#${request.assetId}`}</span>
            <span className="mx-1">·</span>
            <span>{getAge(request.createdAt)}</span>
          </div>
        </div>

        <div className="relative flex-shrink-0">
          <button
            id={`card-menu-${request.id}`}
            onClick={(e) => { e.stopPropagation(); setMenuOpen(o => !o); }}
            className="p-1 rounded-md text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <MoreVertical size={14} />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-7 z-20 bg-white rounded-lg border border-slate-200
                          shadow-lg py-1 min-w-[130px]"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <button
                id={`card-view-${request.id}`}
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onView?.(request); }}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-slate-700
                           hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                <Eye size={12} /> View Details
              </button>
              {['PENDING', 'REJECTED'].includes(request.status) && (
                <button
                  id={`card-delete-${request.id}`}
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete?.(request); }}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-600
                             hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={12} /> Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Wrench size={11} className="text-slate-400" />
          <span className="truncate font-medium">{request.asset?.name ?? 'Unknown Asset'}</span>
        </div>
        {request.asset?.location && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
            <MapPin size={10} />
            <span className="truncate">{request.asset.location}</span>
          </div>
        )}
      </div>

      <div className="px-4 pb-2 flex flex-wrap gap-1.5">
        <PriorityBadge priority={request.priority} size="xs" />
        <StatusBadge   status={request.status}     size="xs" />
      </div>

      <div className="px-4 pb-3 flex items-center justify-between border-t border-slate-100 pt-2 mt-1">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-blue-600
                          flex items-center justify-center text-white font-bold text-[9px]">
            {request.employee?.name?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>
          <span className="truncate max-w-[90px]">{request.employee?.name ?? 'Unknown'}</span>
        </div>

        {request.technician && (
          <div className="flex items-center gap-1 text-[10px] text-purple-600">
            <User size={10} />
            <span className="truncate max-w-[70px]">{request.technician.name}</span>
          </div>
        )}

        <button
          onClick={() => onView?.(request)}
          className="text-[10px] font-medium text-blue-600 hover:text-blue-800
                     opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Open →
        </button>
      </div>
    </div>
  );
};

export default MaintenanceCard;
