import React from 'react';

/**
 * Calendar Style Hourly Resource Booking Heatmap for Module 8
 */
const Heatmap = ({ data = [], title = 'Resource Booking Peak Hours' }) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  // Helper to determine background color based on counts
  const getColorClass = (count) => {
    if (count === 0) return 'bg-slate-50 border-slate-100 hover:bg-slate-100';
    if (count === 1) return 'bg-blue-100 border-blue-200 text-blue-800 font-bold hover:bg-blue-200';
    if (count === 2) return 'bg-blue-300 border-blue-400 text-blue-900 font-bold hover:bg-blue-400';
    if (count === 3) return 'bg-blue-500 border-blue-600 text-white font-bold hover:bg-blue-600';
    return 'bg-blue-700 border-blue-800 text-white font-bold hover:bg-blue-800';
  };

  // Convert flat array format to coordinates Map
  const getCellCount = (day, hour) => {
    const found = data.find(c => c.day === day && c.hour === hour);
    return found ? found.count : 0;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        {/* Color Legend */}
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
          <span>Low</span>
          <div className="w-2.5 h-2.5 bg-slate-50 border border-slate-200 rounded-sm" />
          <div className="w-2.5 h-2.5 bg-blue-100 rounded-sm" />
          <div className="w-2.5 h-2.5 bg-blue-300 rounded-sm" />
          <div className="w-2.5 h-2.5 bg-blue-500 rounded-sm" />
          <div className="w-2.5 h-2.5 bg-blue-700 rounded-sm" />
          <span>Peak</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-1.5 text-[10px] font-bold text-slate-400 text-left w-12">Day</th>
              {hours.map((hour, idx) => (
                <th key={idx} className="p-1.5 text-[10px] font-bold text-slate-400 text-center select-none min-w-[40px]">
                  {hour}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day, dayIdx) => (
              <tr key={dayIdx}>
                <td className="p-1.5 text-[10px] font-bold text-slate-500">{day}</td>
                {hours.map((hour, hourIdx) => {
                  const count = getCellCount(day, hour);
                  return (
                    <td key={hourIdx} className="p-0.5">
                      <div
                        className={`h-8 rounded-lg flex items-center justify-center text-xs border transition-all duration-200 cursor-pointer ${getColorClass(count)}`}
                        title={`${day} @ ${hour}: ${count} Booking(s)`}
                      >
                        {count > 0 ? count : ''}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Heatmap;
