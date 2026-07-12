import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Monitor } from 'lucide-react';
import StatusBadge from './StatusBadge';

/**
 * Reusable Activity Table Component
 * Displays system audit trail in a professional grid.
 * 
 * Props:
 * @param {Array} logs - List of activity logs
 */
export const ActivityTable = ({ logs = [] }) => {
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  const handleSort = (field) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortField(field);
    setSortOrder(isAsc ? 'desc' : 'asc');
  };

  const sortedLogs = [...logs].sort((a, b) => {
    let aVal = a[sortField] || '';
    let bVal = b[sortField] || '';

    if (sortField === 'date') {
      const aDateTime = new Date(`${a.date} ${a.time}`);
      const bDateTime = new Date(`${b.date} ${b.time}`);
      return sortOrder === 'asc' ? aDateTime - bDateTime : bDateTime - aDateTime;
    }

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? (
      <ChevronUp className="h-4 w-4 inline text-primary ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline text-primary ml-1" />
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-250 text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th
                scope="col"
                className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider text-slate-500 cursor-pointer hover:text-slate-800"
                onClick={() => handleSort('user')}
              >
                User <SortIcon field="user" />
              </th>
              <th
                scope="col"
                className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider text-slate-500 cursor-pointer hover:text-slate-800"
                onClick={() => handleSort('role')}
              >
                Role <SortIcon field="role" />
              </th>
              <th
                scope="col"
                className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider text-slate-500 cursor-pointer hover:text-slate-800"
                onClick={() => handleSort('action')}
              >
                Action <SortIcon field="action" />
              </th>
              <th
                scope="col"
                className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider text-slate-500 cursor-pointer hover:text-slate-800"
                onClick={() => handleSort('module')}
              >
                Module <SortIcon field="module" />
              </th>
              <th
                scope="col"
                className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider text-slate-500 cursor-pointer hover:text-slate-800"
                onClick={() => handleSort('date')}
              >
                Date & Time <SortIcon field="date" />
              </th>
              <th
                scope="col"
                className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider text-slate-500 cursor-pointer hover:text-slate-800"
                onClick={() => handleSort('ipAddress')}
              >
                IP Address <SortIcon field="ipAddress" />
              </th>
              <th
                scope="col"
                className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider text-slate-500 cursor-pointer hover:text-slate-800"
                onClick={() => handleSort('status')}
              >
                Status <SortIcon field="status" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {sortedLogs.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-10 text-sm text-slate-400">
                  No activity logs found.
                </td>
              </tr>
            ) : (
              sortedLogs.map((log) => {
                const userInitials = log.user
                  ? log.user.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)
                  : 'US';
                return (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                          {userInitials}
                        </div>
                        <span className="text-sm font-semibold text-slate-800">{log.user}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded-md">
                        {log.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-700">{log.action}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-primary bg-blue-50 border border-blue-100 rounded-md">
                        {log.module}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-800">{log.date}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{log.time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-slate-555 font-mono">
                        <Monitor className="h-3.5 w-3.5 text-slate-400" />
                        <span>{log.ipAddress}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={log.status} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityTable;
