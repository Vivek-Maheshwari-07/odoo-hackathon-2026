// src/components/booking/BookingTable.jsx
import React, { useState } from 'react';
import { Eye, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import StatusBadge from './StatusBadge';

const PAGE_SIZE = 8;

const formatTime = (t) => {
  if (!t) return '—';
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const useSortable = (data) => {
  const [sort, setSort] = useState({ key: 'booking_date', dir: 'asc' });

  const toggle = (key) =>
    setSort(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));

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
      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider
                 cursor-pointer select-none hover:text-slate-700 transition-colors whitespace-nowrap"
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className="flex flex-col -space-y-1">
          <ChevronUp   size={10} className={active && sort.dir === 'asc'  ? 'text-blue-600' : 'text-slate-300'} />
          <ChevronDown size={10} className={active && sort.dir === 'desc' ? 'text-blue-600' : 'text-slate-300'} />
        </span>
      </span>
    </th>
  );
};

const BookingTable = ({ bookings = [], loading = false, onView }) => {
  const [page, setPage] = useState(1);
  const { sorted, sort, toggle } = useSortable(bookings);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const slice = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 overflow-hidden animate-pulse space-y-0">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`flex gap-4 px-4 py-4 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
            {[1,2,3,1,1,1,0.5].map((w, j) => (
              <div key={j} className="h-4 rounded bg-slate-200" style={{ flex: w }} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Inbox size={48} className="mb-3 opacity-40" />
        <p className="text-sm font-medium text-slate-500">No bookings found</p>
        <p className="text-xs mt-1">Try adjusting your filters or create a new booking.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <Th label="Resource"     sortKey="resource_name" sort={sort} onSort={toggle} />
              <Th label="Type"         sortKey="resource_type" sort={sort} onSort={toggle} />
              <Th label="Date"         sortKey="booking_date"  sort={sort} onSort={toggle} />
              <Th label="Start"        sortKey="start_time"    sort={sort} onSort={toggle} />
              <Th label="End"          sortKey="end_time"      sort={sort} onSort={toggle} />
              <Th label="Purpose"      sortKey="purpose"       sort={sort} onSort={toggle} />
              <Th label="Status"       sortKey="status"        sort={sort} onSort={toggle} />
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {slice.map((b, idx) => (
              <tr
                key={b.id}
                className={`group transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                            hover:bg-blue-50/40`}
              >
                <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{b.resource_name}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                    {b.resource_type}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDate(b.booking_date)}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatTime(b.start_time)}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatTime(b.end_time)}</td>
                <td className="px-4 py-3 text-slate-700 max-w-[180px] truncate" title={b.purpose}>
                  {b.purpose}
                </td>
                <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={b.status} /></td>
                <td className="px-4 py-3 text-right">
                  <button
                    id={`view-booking-${b.id}`}
                    onClick={() => onView?.(b)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium
                               text-blue-600 border border-blue-200 bg-blue-50
                               hover:bg-blue-100 hover:border-blue-300 transition-colors"
                  >
                    <Eye size={13} />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length} bookings
        </span>
        <div className="flex items-center gap-1">
          <button
            id="pagination-prev"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-md border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .reduce((acc, p, idx, arr) => {
              if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              p === '...'
                ? <span key={`ellipsis-${i}`} className="px-1">…</span>
                : (
                  <button
                    key={p}
                    id={`pagination-page-${p}`}
                    onClick={() => setPage(p)}
                    className={`w-7 h-7 rounded-md text-xs font-medium border transition-colors
                      ${page === p
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                      }`}
                  >
                    {p}
                  </button>
                )
            )
          }
          <button
            id="pagination-next"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded-md border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingTable;
