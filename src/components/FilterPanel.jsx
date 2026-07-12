import React from 'react';

/**
 * FilterPanel Component
 * Handles rendering of horizontal tabs or grid-based dropdown select filters.
 * 
 * Props:
 * @param {Array} tabs - Option array for tabs { label, value }
 * @param {string} activeTab - Selected tab value
 * @param {function} onTabChange - Handler for switching tabs
 * @param {Array} dropdowns - Configurations for select dropdowns: { name, label, value, options, onChange }
 * @param {function} onReset - Handler to reset all dropdowns
 */
export const FilterPanel = ({
  tabs,
  activeTab,
  onTabChange,
  dropdowns,
  onReset
}) => {
  return (
    <div className="w-full flex flex-col gap-4">
      {/* Tab Filters */}
      {tabs && tabs.length > 0 && (
        <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-2">
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => onTabChange(tab.value)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  isSelected
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Grid Dropdown Filters */}
      {dropdowns && dropdowns.length > 0 && (
        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {dropdowns.map((d) => (
              <div key={d.name} className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {d.label}
                </label>
                <select
                  value={d.value}
                  onChange={(e) => d.onChange(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-sm transition-all duration-200"
                >
                  <option value="">All {d.label}s</option>
                  {d.options.map((opt) => {
                    const val = typeof opt === 'object' ? opt.value : opt;
                    const lbl = typeof opt === 'object' ? opt.label : opt;
                    return (
                      <option key={val} value={val}>
                        {lbl}
                      </option>
                    );
                  })}
                </select>
              </div>
            ))}
          </div>

          {onReset && (
            <div className="flex justify-end border-t border-slate-100 pt-3">
              <button
                onClick={onReset}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-300 rounded-lg bg-white transition-all duration-200"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
