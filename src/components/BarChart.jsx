import React from 'react';

/**
 * Responsive SVG Bar Chart Component for Module 8
 */
const BarChart = ({ data = [], title = 'Asset Utilization' }) => {
  const chartHeight = 200;
  const chartWidth = 500;
  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 30;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  // Find max value for scale
  const maxVal = data.length > 0 ? Math.max(...data.map(d => d.value), 1) : 10;
  const scaleY = innerHeight / maxVal;

  const barWidth = data.length > 0 ? (innerWidth / data.length) * 0.65 : 40;
  const barGap = data.length > 0 ? (innerWidth / data.length) * 0.35 : 10;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 h-full">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">{title}</h3>

      {data.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center text-slate-400 text-xs">
          No data available
        </div>
      ) : (
        <div className="relative w-full h-[200px]">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Grid Lines & Y Axis Labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
              const val = Math.round(maxVal * ratio);
              const y = paddingTop + innerHeight - innerHeight * ratio;
              return (
                <g key={index} className="text-[9px] fill-slate-400 font-semibold">
                  <text x={paddingLeft - 10} y={y + 3} textAnchor="end">
                    {val}
                  </text>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={chartWidth - paddingRight}
                    y2={y}
                    stroke="#E2E8F0"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                </g>
              );
            })}

            {/* Bars */}
            {data.map((item, index) => {
              const x = paddingLeft + index * (barWidth + barGap) + barGap / 2;
              const barHeight = item.value * scaleY;
              const y = paddingTop + innerHeight - barHeight;

              return (
                <g key={index} className="group">
                  {/* Bar */}
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={Math.max(barHeight, 2)} // Min height 2px to show zero values nicely
                    fill="#2563EB"
                    rx="4"
                    className="hover:fill-blue-700 transition-colors duration-200 cursor-pointer"
                  />
                  {/* X Axis Label */}
                  <text
                    x={x + barWidth / 2}
                    y={chartHeight - 10}
                    textAnchor="middle"
                    className="text-[9px] fill-slate-400 font-bold truncate"
                    style={{ maxWidth: barGap + barWidth }}
                  >
                    {item.name.length > 8 ? `${item.name.substring(0, 7)}.` : item.name}
                  </text>

                  {/* Tooltip on hover */}
                  <title>{`${item.name}: ${item.value} Assets`}</title>
                </g>
              );
            })}

            {/* X-Axis baseline */}
            <line
              x1={paddingLeft}
              y1={paddingTop + innerHeight}
              x2={chartWidth - paddingRight}
              y2={paddingTop + innerHeight}
              stroke="#CBD5E1"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default BarChart;
