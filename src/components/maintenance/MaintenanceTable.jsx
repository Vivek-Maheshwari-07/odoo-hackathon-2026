// src/components/maintenance/MaintenanceTable.jsx
import React, { useState } from 'react';
import {
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Eye, Trash2, Inbox,
} from 'lucide-react';
import StatusBadge   from './StatusBadge';
import PriorityBadge from './PriorityBadge';

const PAGE_SIZE = 10;

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const useSortable = (data) => {
  const [sort, setSort] = useState({ key: 'createdAt', dir: 'desc' });
  const toggle = (key) =>
    setSort(p => ({ key, dir: p.key === key && p.dir === 'asc' ? 'desc' : 'asc' }));
  const sorted = [...data].sort((a, b) => {
    const va = a[sort.key] ?? '';
    const vb = b[sort.key] ?? '';
    const cmp = String(va).localeCompare(String(vb));
    return sort.dir === 'asc' ? cmp : -cmp;
  });
  return { sorted, sort, toggle };
};

const Th = ({ label, sortKey, sort, onSort }) => {
  const active = sort.key === sortKey;
  return (
    <th
      onClick={() => onSort(sortKey)}
      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider
                 cursor-pointer select-none hover:text-slate-700 whitespace-nowrap"
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className="flex flex-col -space-y-1">
          <ChevronUp   size={10} className={active && sort.dir === 'asc'  ? 'text-[#2563EB]' : 'text-slate-300'} />
          <ChevronDown size={10} className={active && sort.dir === 'desc' ? 'text-[#2563EB]' : 'text-slate-300'} />
        </span>
      </span>
    </th>
  );
};

const MaintenanceTable = ({ requests = [], loading = false, onView, onDelete }) => {
  const [page, setPage] = useState(1);
  const { sorted, sort, toggle } = useSortable(requests);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const slice = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 bg-slate-100 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!sorted.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Inbox size={48} className="mb-3 opacity-40" />
        <p className="text-sm font-medium text-slate-500">No maintenance requests found</p>
        <p className="text-xs mt-1">Raise a request or adjust your filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-[#E2E8F0] overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
            <tr>
              <Th label="Issue Title"  sortKey="issueTitle"  sort={sort} onSort={toggle} />
              <Th label="Asset"        sortKey="assetId"     sort={sort} onSort={toggle} />
              <Th label="Priority"     sortKey="priority"    sort={sort} onSort={toggle} />
              <Th label="Status"       sortKey="status"      sort={sort} onSort={toggle} />
              <Th label="Reported By"  sortKey="employeeId"  sort={sort} onSort={toggle} />
              <Th label="Technician"   sortKey="technicianId"sort={sort} onSort={toggle} />
              <Th label="Raised On"    sortKey="createdAt"   sort={sort} onSort={toggle} />
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {slice.map((r, idx) => (
              <tr
                key={r.id}
                className={`group transition-colors hover:bg-blue-50/30
                            ${idx % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]/60'}`}
              >
                <td className="px-4 py-3 font-semibold text-slate-800 max-w-[200px] truncate"
                    title={r.issueTitle}>
                  {r.issueTitle}
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                  <div className="font-medium">{r.asset?.name ?? '—'}</div>
                  <div className="text-xs text-slate-400 font-mono">{r.asset?.assetTag}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <PriorityBadge priority={r.priority} size="xs" />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <StatusBadge status={r.status} size="xs" />
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                  {r.employee?.name ?? `#${r.employeeId}`}
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                  {r.technician?.name ?? <span className="text-slate-300">—</span>}
                </td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                  {formatDate(r.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      id={`table-view-${r.id}`}
                      onClick={() => onView?.(r)}
                      className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
                      title="View"
                    >
                      <Eye size={14} />
                    </button>
                    {['PENDING', 'REJECTED'].includes(r.status) && (
                      <button
                        id={`table-delete-${r.id}`}
                        onClick={() => onDelete?.(r)}
                        className="p-1.5 rounded-md text-red-400 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length}
        </span>
        <div className="flex items-center gap-1">
          <button
            id="maint-prev-page"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-md border border-[#E2E8F0] hover:bg-slate-100 disabled:opacity-40"
          >
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .reduce((acc, p, i, arr) => {
              if (i > 0 && p - arr[i - 1] > 1) acc.push('…');
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              p === '…'
                ? <span key={`e-${i}`} className="px-1">…</span>
                : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-7 h-7 rounded-md text-xs font-semibold border transition-colors
                      ${page === p
                        ? 'bg-[#2563EB] text-white border-[#2563EB]'
                        : 'border-[#E2E8F0] hover:bg-slate-100 text-slate-600'}`}
                  >
                    {p}
                  </button>
                )
            )
          }
          <button
            id="maint-next-page"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded-md border border-[#E2E8F0] hover:bg-slate-100 disabled:opacity-40"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceTable;
