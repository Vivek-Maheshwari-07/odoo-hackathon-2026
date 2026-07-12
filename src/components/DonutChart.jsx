import React from 'react';

/**
 * Responsive SVG Donut Chart Component with center stats for Module 8
 */
const DonutChart = ({ data = [], title = 'Asset Status Distribution' }) => {
  const size = 200;
  const radius = 60;
  const circumference = 2 * Math.PI * radius; // ~376.99
  const center = size / 2;

  // Filter and total
  const total = data.reduce((sum, d) => sum + d.value, 0);

  // Corporate status color mappings
  const colorMap = {
    'Available': '#10B981',       // Emerald Green
    'Allocated': '#2563EB',       // Blue
    'Under Maintenance': '#F59E0B', // Amber/Yellow
    'Lost': '#EF4444',            // Red
    'Retired': '#64748B',         // Slate/Grey
    'Disposed': '#94A3B8'         // Cool grey
  };

  let accumulatedPercent = 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 h-full flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-4">{title}</h3>
      </div>

      {total === 0 ? (
        <div className="h-[180px] flex items-center justify-center text-slate-400 text-xs">
          No status distribution data
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
          {/* Donut SVG */}
          <div className="relative w-[140px] h-[140px]">
            <svg
              viewBox={`0 0 ${size} ${size}`}
              className="w-full h-full transform -rotate-90 overflow-visible"
            >
              {data.map((item, index) => {
                if (item.value === 0) return null;
                const percentage = item.value / total;
                const strokeLength = percentage * circumference;
                const strokeOffset = circumference - (accumulatedPercent * circumference);
                accumulatedPercent += percentage;

                const color = colorMap[item.name] || '#64748B';

                return (
                  <circle
                    key={index}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="transparent"
                    stroke={color}
                    strokeWidth="20"
                    strokeDasharray={`${strokeLength} ${circumference}`}
                    strokeDashoffset={strokeOffset}
                    className="hover:opacity-90 transition-opacity duration-200 cursor-pointer"
                  >
                    <title>{`${item.name}: ${item.value} (${Math.round(percentage * 100)}%)`}</title>
                  </circle>
                );
              })}
            </svg>
            
            {/* Center Label (Total Assets) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total</span>
              <span className="text-xl font-extrabold text-slate-800 leading-none">{total}</span>
            </div>
          </div>

          {/* Legends */}
          <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto pr-2">
            {data.map((item, index) => {
              if (item.value === 0) return null;
              const color = colorMap[item.name] || '#64748B';
              return (
                <div key={index} className="flex items-center gap-2 text-xs text-slate-600">
                  <span
                    className="w-3.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-semibold text-slate-800">{item.value}</span>
                  <span className="text-slate-500">{item.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DonutChart;
