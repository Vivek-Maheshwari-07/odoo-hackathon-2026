import React, { useState, useMemo } from 'react';
import { Badge } from './common/Badge';
import { Card } from './common/Card';
import { Pagination } from './common/Pagination';

import { 
  Eye, 
  Trash2, 
  Play, 
  Search, 
  Users, 
  Calendar 
} from 'lucide-react';

const STATUS_BADGE = {
  Scheduled: 'primary',
  Active: 'warning',
  Completed: 'success',
};

const ITEMS_PER_PAGE = 5;

const AuditTable = ({ auditCycles, onSelectCycle, onDeleteCycle, onStartCycle, isAdminOrManager }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter cycles
  const filteredCycles = useMemo(() => {
    return auditCycles.filter(cycle => {
      const nameMatch = cycle.auditName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        cycle.departmentName.toLowerCase().includes(searchQuery.toLowerCase());
      const statusMatch = statusFilter === 'All' || cycle.status === statusFilter;
      return nameMatch && statusMatch;
    });
  }, [auditCycles, searchQuery, statusFilter]);

  // Paginated cycles
  const totalPages = Math.ceil(filteredCycles.length / ITEMS_PER_PAGE);
  const paginatedCycles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCycles.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCycles, currentPage]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Filters and Search */}
      <Card className="p-4 bg-white shadow-sm border border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Status Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 self-start">
            {['All', 'Active', 'Completed', 'Scheduled'].map(status => (
              <button
                key={status}
                onClick={() => handleStatusFilter(status)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${
                  statusFilter === status
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search audit name or dept..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full h-9 pl-9 pr-4 bg-white border border-border rounded-lg text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text-primary"
            />
          </div>
        </div>
      </Card>

      {/* Audit Cycles Table */}
      {filteredCycles.length === 0 ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center bg-white shadow-sm border border-border">
          <Calendar className="h-10 w-10 text-slate-300 mb-2 animate-bounce" />
          <h3 className="text-sm font-bold text-text-primary">No Audit Cycles Found</h3>
          <p className="text-xs text-text-secondary mt-1">No cycles match your selected filters or search terms.</p>
        </Card>
      ) : (
        <Card className="bg-white shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-border">
                  <th className="px-5 py-3 text-[10px] font-bold uppercase text-text-secondary tracking-wide">Audit Name</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase text-text-secondary tracking-wide">Department</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase text-text-secondary tracking-wide">Timeline</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase text-text-secondary tracking-wide">Auditors</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase text-text-secondary tracking-wide">Progress</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase text-text-secondary tracking-wide">Status</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase text-text-secondary tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {paginatedCycles.map(cycle => (
                  <tr key={cycle.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-text-primary">{cycle.auditName}</p>
                      <p className="text-[10px] text-text-secondary">ID: AC-{String(cycle.id).padStart(3, '0')}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-medium text-text-primary">{cycle.departmentName}</span>
                    </td>
                    <td className="px-5 py-4 text-xs text-text-secondary">
                      <p className="font-semibold">{cycle.startDate} to</p>
                      <p>{cycle.endDate}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-xs font-semibold text-text-secondary">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        <span>{cycle.auditors.length} assigned</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate max-w-[150px]">
                        {cycle.auditors.map(a => a.fullName).join(', ')}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${cycle.stats.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-text-primary">
                          {cycle.stats.progress}%
                        </span>
                      </div>
                      <p className="text-[10px] text-text-secondary">
                        {cycle.stats.verified}/{cycle.stats.total} verified
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={STATUS_BADGE[cycle.status] || 'default'}>
                        {cycle.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {cycle.status === 'Scheduled' && isAdminOrManager && (
                          <button
                            onClick={() => onStartCycle(cycle.id)}
                            title="Start Audit Cycle"
                            className="p-1.5 text-primary hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-lg transition-all"
                          >
                            <Play className="h-4 w-4 fill-primary" />
                          </button>
                        )}
                        <button
                          onClick={() => onSelectCycle(cycle)}
                          title="View Details"
                          className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-slate-50 border border-transparent hover:border-border rounded-lg transition-all"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {cycle.status !== 'Completed' && isAdminOrManager && (
                          <button
                            onClick={() => onDeleteCycle(cycle.id)}
                            title="Delete Cycle"
                            className="p-1.5 text-danger hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-border bg-slate-50">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default AuditTable;
