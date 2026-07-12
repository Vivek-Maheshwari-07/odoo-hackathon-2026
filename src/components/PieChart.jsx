import React from 'react';

/**
 * Responsive SVG Pie Chart Component for Module 8
 */
const PieChart = ({ data = [], title = 'Department Allocation' }) => {
  const size = 200;
  const radius = 50;
  const circumference = 2 * Math.PI * radius; // ~314.159
  const center = size / 2;

  // Filter out zero values and compute total
  const chartData = data.filter(d => d.value > 0);
  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  // Modern corporate colors
  const colors = [
    '#2563EB', // Blue
    '#10B981', // Emerald
    '#8B5CF6', // Violet
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#EC4899', // Pink
    '#06B6D4', // Cyan
  ];

  let accumulatedPercent = 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 h-full flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-4">{title}</h3>
      </div>

      {chartData.length === 0 ? (
        <div className="h-[180px] flex items-center justify-center text-slate-400 text-xs">
          No data available
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
          {/* Pie SVG */}
          <div className="relative w-[140px] h-[140px]">
            <svg
              viewBox={`0 0 ${size} ${size}`}
              className="w-full h-full transform -rotate-90 overflow-visible"
            >
              {chartData.map((item, index) => {
                const percentage = item.value / total;
                const strokeLength = percentage * circumference;
                const strokeOffset = circumference - (accumulatedPercent * circumference);
                accumulatedPercent += percentage;

                const color = colors[index % colors.length];

                return (
                  <circle
                    key={index}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="transparent"
                    stroke={color}
                    strokeWidth="35"
                    strokeDasharray={`${strokeLength} ${circumference}`}
                    strokeDashoffset={strokeOffset}
                    className="hover:opacity-90 transition-opacity duration-200 cursor-pointer"
                  >
                    <title>{`${item.name}: ${item.value} (${Math.round(percentage * 100)}%)`}</title>
                  </circle>
                );
              })}
            </svg>
          </div>

          {/* Legends */}
          <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto pr-2">
            {chartData.map((item, index) => {
              const percentage = item.value / total;
              const color = colors[index % colors.length];
              return (
                <div key={index} className="flex items-center gap-2 text-xs text-slate-600">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-semibold text-slate-800">{item.value}</span>
                  <span className="truncate max-w-[80px] text-slate-500" title={item.name}>
                    {item.name}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ({Math.round(percentage * 100)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PieChart;
