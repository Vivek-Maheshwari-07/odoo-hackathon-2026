import React, { useState } from 'react';
import { Trash2, CheckCircle2, ChevronUp, ChevronDown } from 'lucide-react';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';

/**
 * Reusable Notification Table Component
 * 
 * @param {Array} notifications - Array of notification objects
 * @param {function} onMarkRead - Handler for marking a notification read
 * @param {function} onDelete - Handler for deleting a notification
 * @param {function} onBulkMarkRead - Handler for bulk marking read
 * @param {function} onBulkDelete - Handler for bulk deleting
 */
export const NotificationTable = ({
  notifications = [],
  onMarkRead,
  onDelete,
  onBulkMarkRead,
  onBulkDelete
}) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  // Handle individual selection
  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map((n) => n.id));
    }
  };

  // Handle column sorting
  const handleSort = (field) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortField(field);
    setSortOrder(isAsc ? 'desc' : 'asc');
  };

  // Sort utility
  const sortedNotifications = [...notifications].sort((a, b) => {
    let aVal = a[sortField] || '';
    let bVal = b[sortField] || '';

    // Handle combined date/time sort if sorting by date
    if (sortField === 'date') {
      const aDateTime = new Date(`${a.date} ${a.time}`);
      const bDateTime = new Date(`${b.date} ${b.time}`);
      return sortOrder === 'asc' ? aDateTime - bDateTime : bDateTime - aDateTime;
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleBulkReadAction = () => {
    if (onBulkMarkRead) {
      onBulkMarkRead(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleBulkDeleteAction = () => {
    if (onBulkDelete) {
      onBulkDelete(selectedIds);
      setSelectedIds([]);
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? (
      <ChevronUp className="h-4 w-4 inline-block ml-1 text-primary" />
    ) : (
      <ChevronDown className="h-4 w-4 inline-block ml-1 text-primary" />
    );
  };

  return (
    <div className="flex flex-col gap-4 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Bulk actions bar if selection exists */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border-b border-blue-100 px-6 py-3.5 flex items-center justify-between transition-all duration-200">
          <span className="text-sm font-semibold text-blue-700">
            {selectedIds.length} item{selectedIds.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-3">
            {onBulkMarkRead && (
              <button
                onClick={handleBulkReadAction}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Mark Read</span>
              </button>
            )}
            {onBulkDelete && (
              <button
                onClick={handleBulkDeleteAction}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-750 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th scope="col" className="relative w-12 px-6 sm:w-16 sm:px-8">
                <input
                  type="checkbox"
                  className="absolute left-6 top-1/2 -mt-2 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary focus:ring-2 focus:outline-none cursor-pointer"
                  checked={
                    notifications.length > 0 &&
                    selectedIds.length === notifications.length
                  }
                  onChange={handleSelectAll}
                />
              </th>
              <th
                scope="col"
                className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 cursor-pointer hover:text-slate-800"
                onClick={() => handleSort('title')}
              >
                Title <SortIcon field="title" />
              </th>
              <th
                scope="col"
                className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 cursor-pointer hover:text-slate-800"
                onClick={() => handleSort('category')}
              >
                Category <SortIcon field="category" />
              </th>
              <th
                scope="col"
                className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 cursor-pointer hover:text-slate-800"
                onClick={() => handleSort('priority')}
              >
                Priority <SortIcon field="priority" />
              </th>
              <th
                scope="col"
                className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 cursor-pointer hover:text-slate-800"
                onClick={() => handleSort('date')}
              >
                Date & Time <SortIcon field="date" />
              </th>
              <th
                scope="col"
                className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 cursor-pointer hover:text-slate-800"
                onClick={() => handleSort('status')}
              >
                Status <SortIcon field="status" />
              </th>
              <th scope="col" className="relative px-6 py-3.5">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {sortedNotifications.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-10 text-sm text-slate-400">
                  No notifications matching criteria.
                </td>
              </tr>
            ) : (
              sortedNotifications.map((notif) => {
                const isSelected = selectedIds.includes(notif.id);
                const isUnread = notif.status === 'Unread';
                return (
                  <tr
                    key={notif.id}
                    className={`hover:bg-slate-50/50 transition-colors ${
                      isSelected ? 'bg-blue-50/20' : ''
                    } ${isUnread ? 'font-medium' : ''}`}
                  >
                    <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                      {isSelected && (
                        <div className="absolute inset-y-0 left-0 w-0.5 bg-primary" />
                      )}
                      <input
                        type="checkbox"
                        className="absolute left-6 top-1/2 -mt-2 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary focus:ring-2 focus:outline-none cursor-pointer"
                        checked={isSelected}
                        onChange={() => handleSelect(notif.id)}
                      />
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-900">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{notif.title}</span>
                        <span className="text-xs text-slate-400 font-normal mt-0.5">{notif.description}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500">
                      <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded font-semibold uppercase tracking-wider">
                        {notif.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <PriorityBadge priority={notif.priority} />
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500 whitespace-nowrap">
                      <div>{notif.date}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{notif.time}</div>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <StatusBadge status={notif.status} />
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {isUnread && onMarkRead && (
                          <button
                            onClick={() => onMarkRead(notif.id)}
                            className="text-primary hover:text-blue-800 text-xs font-bold"
                          >
                            Mark Read
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(notif.id)}
                            className="text-slate-400 hover:text-red-600 rounded p-1 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
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

export default NotificationTable;
