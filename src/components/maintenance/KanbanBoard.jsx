// src/components/maintenance/KanbanBoard.jsx
import React, { useState, useRef, useCallback } from 'react';
import {
  Clock, ThumbsUp, UserCheck, Wrench, CheckCircle2,
} from 'lucide-react';
import MaintenanceCard from './MaintenanceCard';

const COLUMNS = [
  {
    key:   'PENDING',
    label: 'Pending',
    Icon:  Clock,
    accent: 'border-yellow-400',
    header: 'bg-yellow-50 text-yellow-800',
    count:  'bg-yellow-100 text-yellow-700',
    drop:   'bg-yellow-50/40',
  },
  {
    key:   'APPROVED',
    label: 'Approved',
    Icon:  ThumbsUp,
    accent: 'border-blue-400',
    header: 'bg-blue-50 text-blue-800',
    count:  'bg-blue-100 text-blue-700',
    drop:   'bg-blue-50/40',
  },
  {
    key:   'TECHNICIAN_ASSIGNED',
    label: 'Tech Assigned',
    Icon:  UserCheck,
    accent: 'border-purple-400',
    header: 'bg-purple-50 text-purple-800',
    count:  'bg-purple-100 text-purple-700',
    drop:   'bg-purple-50/40',
  },
  {
    key:   'IN_PROGRESS',
    label: 'In Progress',
    Icon:  Wrench,
    accent: 'border-orange-400',
    header: 'bg-orange-50 text-orange-800',
    count:  'bg-orange-100 text-orange-700',
    drop:   'bg-orange-50/40',
  },
  {
    key:   'RESOLVED',
    label: 'Resolved',
    Icon:  CheckCircle2,
    accent: 'border-green-400',
    header: 'bg-green-50 text-green-800',
    count:  'bg-green-100 text-green-700',
    drop:   'bg-green-50/40',
  },
];

const VALID_TRANSITIONS = {
  PENDING:             ['APPROVED'],
  APPROVED:            ['TECHNICIAN_ASSIGNED'],
  TECHNICIAN_ASSIGNED: ['IN_PROGRESS'],
  IN_PROGRESS:         ['RESOLVED'],
  RESOLVED:            [],
  REJECTED:            [],
};

const KanbanBoard = ({ requests = [], onView, onDelete, onStatusChange }) => {
  const [draggingId, setDraggingId]   = useState(null);
  const [overColumn,  setOverColumn]  = useState(null);
  const dragItem = useRef(null);

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.key] = requests.filter(r => r.status === col.key);
    return acc;
  }, {});

  const handleDragStart = useCallback((id) => {
    setDraggingId(id);
    dragItem.current = id;
  }, []);

  const handleDragOver = useCallback((e, colKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOverColumn(colKey);
  }, []);

  const handleDragLeave = useCallback(() => {
    setOverColumn(null);
  }, []);

  const handleDrop = useCallback(
    async (e, targetStatus) => {
      e.preventDefault();
      setOverColumn(null);
      const id = parseInt(e.dataTransfer.getData('requestId') || dragItem.current);
      setDraggingId(null);
      dragItem.current = null;

      if (!id) return;

      const request = requests.find(r => r.id === id);
      if (!request || request.status === targetStatus) return;

      const allowed = VALID_TRANSITIONS[request.status] ?? [];
      if (!allowed.includes(targetStatus)) return;

      await onStatusChange?.(id, { newStatus: targetStatus, changedById: 1 });
    },
    [requests, onStatusChange]
  );

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    setOverColumn(null);
    dragItem.current = null;
  }, []);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '520px' }}>
      {COLUMNS.map((col) => {
        const cards   = grouped[col.key] ?? [];
        const isOver  = overColumn === col.key;
        const { Icon } = col;

        return (
          <div
            key={col.key}
            id={`kanban-col-${col.key}`}
            className="flex flex-col flex-shrink-0 w-64"
            onDragOver={(e) => handleDragOver(e, col.key)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.key)}
          >
            <div className={`flex items-center justify-between px-3 py-2.5 rounded-t-xl
                             border-t-4 ${col.accent} border border-b-0 border-slate-200
                             ${col.header}`}>
              <div className="flex items-center gap-2">
                <Icon size={14} />
                <span className="text-xs font-bold tracking-wide">{col.label}</span>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.count}`}>
                {cards.length}
              </span>
            </div>

            <div
              className={`
                flex-1 rounded-b-xl border border-t-0 border-slate-200 p-2 space-y-2
                transition-colors duration-150 min-h-[400px]
                ${isOver ? `${col.drop} border-dashed` : 'bg-slate-50/50'}
              `}
            >
              {cards.length === 0 ? (
                <div className={`flex flex-col items-center justify-center h-28 text-slate-300
                                 rounded-lg border-2 border-dashed border-slate-200 mt-2
                                 ${isOver ? 'border-blue-300 bg-blue-50/50' : ''}`}>
                  <Icon size={22} className="mb-1 opacity-40" />
                  <p className="text-xs">Drop here</p>
                </div>
              ) : (
                cards.map(req => (
                  <MaintenanceCard
                    key={req.id}
                    request={req}
                    onView={onView}
                    onDelete={onDelete}
                    onDragStart={() => handleDragStart(req.id)}
                    onDragEnd={handleDragEnd}
                    isDragging={draggingId === req.id}
                  />
                ))
              )}

              {isOver && cards.length > 0 && (
                <div className="h-16 rounded-xl border-2 border-dashed border-blue-300
                                bg-blue-50/60 flex items-center justify-center text-xs text-blue-400">
                  Drop to move here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
