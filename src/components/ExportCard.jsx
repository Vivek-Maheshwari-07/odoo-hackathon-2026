import React, { useState } from 'react';

/**
 * Export actions card for analytics report downloading.
 */
const ExportCard = ({ onExport }) => {
  const [loading, setLoading] = useState(null);

  const handleAction = async (type) => {
    setLoading(type);
    await onExport(type);
    setLoading(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 h-full flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-2">Export Operational Reports</h3>
        <p className="text-xs text-slate-400 leading-relaxed mb-4">
          Generate, compile, and download current physical asset and resource reservation reports.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {/* Export PDF */}
        <button
          onClick={() => handleAction('pdf')}
          disabled={!!loading}
          className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 px-4 py-2.5 rounded-lg transition-all duration-150 disabled:opacity-50"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 012 0v2a1 1 0 11-2 0v-2zm4-3a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Export as Adobe PDF
          </span>
          {loading === 'pdf' ? (
            <span className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
        </button>

        {/* Export Excel */}
        <button
          onClick={() => handleAction('excel')}
          disabled={!!loading}
          className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 px-4 py-2.5 rounded-lg transition-all duration-150 disabled:opacity-50"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm4 4.5a.5.5 0 00-1 0v3a.5.5 0 001 0v-3zm2.5-.5a.75.75 0 100 1.5h1.5a.75.75 0 000-1.5h-1.5z" clipRule="evenodd" />
            </svg>
            Export as MS Excel
          </span>
          {loading === 'excel' ? (
            <span className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
        </button>

        {/* Print Report */}
        <button
          onClick={() => window.print()}
          className="w-full flex items-center justify-between text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-lg transition-all duration-150 shadow-sm"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Dashboard Report
          </span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ExportCard;
