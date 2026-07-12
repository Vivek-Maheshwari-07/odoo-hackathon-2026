import React from 'react';

/**
 * Responsive SVG Line Chart Component with gradient area fill for Module 8
 */
const LineChart = ({ data = [], title = 'Maintenance Requests Trend' }) => {
  const chartHeight = 200;
  const chartWidth = 500;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 15;
  const paddingBottom = 30;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  // Find max value for scale
  const maxVal = data.length > 0 ? Math.max(...data.map(d => d.count), 1) : 10;
  const scaleY = innerHeight / maxVal;

  const xGap = data.length > 1 ? innerWidth / (data.length - 1) : innerWidth;

  // Compute points coordinates
  const points = data.map((item, index) => {
    const x = paddingLeft + index * xGap;
    const y = paddingTop + innerHeight - item.count * scaleY;
    return { x, y, label: item.month, val: item.count };
  });

  // Construct SVG Path string
  const pathD = points.length > 0
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  // Construct Area Path (closed polygon at bottom)
  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${paddingTop + innerHeight} L ${points[0].x} ${paddingTop + innerHeight} Z`
    : '';

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
            {/* Gradient definition for filled area */}
            <defs>
              <linearGradient id="lineAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
              </linearGradient>
            </defs>

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

            {/* Filled Area under line */}
            {areaD && (
              <path
                d={areaD}
                fill="url(#lineAreaGrad)"
              />
            )}

            {/* Trend Line */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="#2563EB"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Points and Tooltips */}
            {points.map((p, idx) => (
              <g key={idx} className="group">
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="4"
                  fill="#ffffff"
                  stroke="#2563EB"
                  strokeWidth="2.5"
                  className="hover:r-6 cursor-pointer transition-all duration-150"
                />
                
                {/* X Axis Label */}
                <text
                  x={p.x}
                  y={chartHeight - 10}
                  textAnchor="middle"
                  className="text-[9px] fill-slate-400 font-bold"
                >
                  {p.label}
                </text>

                <title>{`${p.label}: ${p.val} Requests`}</title>
              </g>
            ))}

            {/* Baseline */}
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

export default LineChart;
