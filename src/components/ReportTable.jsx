import React, { useState } from 'react';

/**
 * ReportTable tabs showing latest assets, allocations, and maintenance logs.
 */
const ReportTable = ({ assets = [], allocations = [], maintenance = [] }) => {
  const [activeTab, setActiveTab] = useState('assets');

  const tabs = [
    { id: 'assets', label: 'Latest Assets' },
    { id: 'allocations', label: 'Latest Allocations' },
    { id: 'maintenance', label: 'Latest Maintenance Requests' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
      {/* Tabs Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-5 pt-3 flex items-center justify-between">
        <div className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all duration-200 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold mb-3">
          Live Data
        </span>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        {activeTab === 'assets' && (
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] text-slate-400 font-bold uppercase bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Asset Tag</th>
                <th className="px-6 py-3.5">Asset Name</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Purchase Cost</th>
                <th className="px-6 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assets.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400 text-xs">
                    No recently added assets
                  </td>
                </tr>
              ) : (
                assets.map((asset, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-slate-700">{asset.id}</td>
                    <td className="px-6 py-3.5 text-slate-600 font-medium">{asset.name}</td>
                    <td className="px-6 py-3.5 text-slate-500 font-medium">{asset.department}</td>
                    <td className="px-6 py-3.5 text-slate-600 font-semibold">${asset.purchaseCost.toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-right">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          asset.status === 'Available'
                            ? 'bg-emerald-50 text-emerald-600'
                            : asset.status === 'Allocated'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-amber-50 text-amber-600'
                        }`}
                      >
                        {asset.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'allocations' && (
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] text-slate-400 font-bold uppercase bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Asset Tag</th>
                <th className="px-6 py-3.5">Employee</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Allocated On</th>
                <th className="px-6 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allocations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400 text-xs">
                    No active allocations found
                  </td>
                </tr>
              ) : (
                allocations.map((alloc, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-slate-700">{alloc.assetTag}</td>
                    <td className="px-6 py-3.5 text-slate-600 font-medium">{alloc.employeeName}</td>
                    <td className="px-6 py-3.5 text-slate-500 font-medium">{alloc.department}</td>
                    <td className="px-6 py-3.5 text-slate-500">{alloc.date}</td>
                    <td className="px-6 py-3.5 text-right">
                      <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-full">
                        {alloc.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'maintenance' && (
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] text-slate-400 font-bold uppercase bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Req ID</th>
                <th className="px-6 py-3.5">Asset Tag</th>
                <th className="px-6 py-3.5">Issue Description</th>
                <th className="px-6 py-3.5">Priority</th>
                <th className="px-6 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {maintenance.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400 text-xs">
                    No recent maintenance requests
                  </td>
                </tr>
              ) : (
                maintenance.map((maint, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5 text-slate-500 font-semibold">#{maint.id}</td>
                    <td className="px-6 py-3.5 font-bold text-slate-700">{maint.assetTag}</td>
                    <td className="px-6 py-3.5 text-slate-600 font-medium">{maint.issue}</td>
                    <td className="px-6 py-3.5 font-semibold">
                      <span
                        className={`text-[10px] font-bold ${
                          maint.priority === 'Critical' || maint.priority === 'High'
                            ? 'text-red-600'
                            : 'text-slate-500'
                        }`}
                      >
                        {maint.priority}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          maint.status === 'Resolved'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-amber-50 text-amber-600'
                        }`}
                      >
                        {maint.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ReportTable;
