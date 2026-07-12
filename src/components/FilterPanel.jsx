import React from 'react';

/**
 * FilterPanel Component
 * Handles rendering of horizontal tabs or grid-based dropdown select filters (Module 9),
 * or analytics/reports filters (Module 8).
 */
const FilterPanel = (props) => {
  // If we have dropdowns or tabs, it's the Module 9 FilterPanel
  if (props.dropdowns || props.tabs) {
    const { tabs, activeTab, onTabChange, dropdowns, onReset } = props;
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
  }

  // Otherwise, it is the analytics/reports FilterPanel (Module 8)
  const { filters, onFilterChange, departments = [], categories = [] } = props;
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange(name, value);
  };

  const handleReset = () => {
    onFilterChange('RESET', null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-base">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filter Analytics
        </h3>
        <button
          onClick={handleReset}
          className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Date Range Start */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate || ''}
            onChange={handleChange}
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Date Range End */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">End Date</label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate || ''}
            onChange={handleChange}
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Department Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Department</label>
          <select
            name="department"
            value={filters.department || 'All'}
            onChange={handleChange}
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            <option value="All">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.department_name}>
                {dept.department_name}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Category</label>
          <select
            name="category"
            value={filters.category || 'All'}
            onChange={handleChange}
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.category_name}>
                {cat.category_name}
              </option>
            ))}
          </select>
        </div>

        {/* Asset Status Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Status</label>
          <select
            name="status"
            value={filters.status || 'All'}
            onChange={handleChange}
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Allocated">Allocated</option>
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Lost">Lost</option>
            <option value="Retired">Retired</option>
            <option value="Disposed">Disposed</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
export { FilterPanel };
