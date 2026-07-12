import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Reusable Pagination Component
 * 
 * @param {number} currentPage - Current active page (1-based)
 * @param {number} totalPages - Total number of pages
 * @param {function} onPageChange - Handler to navigate to page
 * @param {number} totalEntries - Total number of items
 * @param {number} itemsPerPage - Number of items displayed per page
 */
export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalEntries = 0,
  itemsPerPage = 10
}) => {
  if (totalPages <= 1 && totalEntries <= itemsPerPage) {
    if (totalEntries === 0) return null;
    return (
      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 sm:px-6 mt-4">
        <p className="text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-800">1</span> to{' '}
          <span className="font-semibold text-slate-800">{totalEntries}</span> of{' '}
          <span className="font-semibold text-slate-800">{totalEntries}</span> entries
        </p>
      </div>
    );
  }

  const startEntry = (currentPage - 1) * itemsPerPage + 1;
  const endEntry = Math.min(currentPage * itemsPerPage, totalEntries);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);

      if (start === 1) {
        end = maxVisible;
      } else if (end === totalPages) {
        start = totalPages - maxVisible + 1;
      }

      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-4 mt-4">
      {/* Information text */}
      <div className="text-sm text-slate-500">
        Showing <span className="font-semibold text-slate-800">{startEntry}</span> to{' '}
        <span className="font-semibold text-slate-800">{endEntry}</span> of{' '}
        <span className="font-semibold text-slate-800">{totalEntries}</span> entries
      </div>

      {/* Button Controls */}
      <nav className="inline-flex rounded-lg border border-slate-200 bg-white p-1 gap-1" aria-label="Pagination">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex items-center px-2 py-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {getPageNumbers().map((pageNum) => {
          const isActive = pageNum === currentPage;
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`inline-flex items-center justify-center h-8 w-8 text-sm font-semibold rounded-md transition-all duration-150 ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex items-center px-2 py-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
