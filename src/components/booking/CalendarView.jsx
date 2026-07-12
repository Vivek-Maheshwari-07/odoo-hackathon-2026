// src/components/booking/CalendarView.jsx
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const STATUS_COLOR = {
  Upcoming:  { bar: 'bg-blue-500',  light: 'bg-blue-50',  border: 'border-blue-300',  text: 'text-blue-800'  },
  Ongoing:   { bar: 'bg-green-500', light: 'bg-green-50', border: 'border-green-300', text: 'text-green-800' },
  Completed: { bar: 'bg-slate-400', light: 'bg-slate-50', border: 'border-slate-300', text: 'text-slate-700' },
  Cancelled: { bar: 'bg-red-400',   light: 'bg-red-50',   border: 'border-red-200',   text: 'text-red-700'   },
};

const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

const isoDate = (d) => d.toISOString().split('T')[0];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES  = ['January','February','March','April','May','June',
                      'July','August','September','October','November','December'];

const formatTime12 = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m}${hour >= 12 ? 'p' : 'a'}`;
};

const CalendarView = ({ bookings = [], resources = [], onView }) => {
  const today     = new Date();
  today.setHours(0, 0, 0, 0);
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - d.getDay()); // Start on Sunday
    return d;
  });

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const bookingsByDate = useMemo(() => {
    const map = {};
    bookings.forEach(b => {
      const k = b.booking_date?.slice(0, 10);
      if (!k) return;
      if (!map[k]) map[k] = [];
      map[k].push(b);
    });
    return map;
  }, [bookings]);

  const activeResources = useMemo(() => {
    const idsInWeek = new Set();
    weekDays.forEach(d => {
      const key = isoDate(d);
      (bookingsByDate[key] || []).forEach(b => idsInWeek.add(b.resource_id));
    });
    const filtered = resources.filter(r => idsInWeek.has(r.id));
    return filtered.length ? filtered : resources.slice(0, 5);
  }, [weekDays, bookingsByDate, resources]);

  const prevWeek = () => setWeekStart(d => addDays(d, -7));
  const nextWeek = () => setWeekStart(d => addDays(d,  7));
  const goToday  = () => {
    const d = new Date(today);
    d.setDate(d.getDate() - d.getDay());
    setWeekStart(d);
  };

  const monthLabel = (() => {
    const start = weekDays[0];
    const end   = weekDays[6];
    if (start.getMonth() === end.getMonth()) {
      return `${MONTH_NAMES[start.getMonth()]} ${start.getFullYear()}`;
    }
    return `${MONTH_NAMES[start.getMonth()]} – ${MONTH_NAMES[end.getMonth()]} ${end.getFullYear()}`;
  })();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            id="calendar-prev-week"
            onClick={prevWeek}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors text-slate-600"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            id="calendar-next-week"
            onClick={nextWeek}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors text-slate-600"
          >
            <ChevronRight size={16} />
          </button>
          <h3 className="text-sm font-semibold text-slate-700 ml-1">{monthLabel}</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500">
            {Object.entries(STATUS_COLOR).map(([status, c]) => (
              <span key={status} className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${c.bar}`} />
                {status}
              </span>
            ))}
          </div>
          <button
            id="calendar-today-btn"
            onClick={goToday}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-blue-200 text-blue-600
                       bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ minWidth: '720px' }}>
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="w-40 px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-50">
                  Resource
                </th>
                {weekDays.map((day) => {
                  const isToday = isoDate(day) === isoDate(today);
                  return (
                    <th
                      key={isoDate(day)}
                      className={`px-2 py-3 text-center font-semibold ${
                        isToday ? 'text-blue-700' : 'text-slate-500'
                      }`}
                    >
                      <span className={`block text-xs uppercase tracking-wider ${isToday ? 'text-blue-500' : 'text-slate-400'}`}>
                        {DAYS_OF_WEEK[day.getDay()]}
                      </span>
                      <span className={`block mt-0.5 w-7 h-7 mx-auto rounded-full flex items-center justify-center font-bold text-sm ${
                        isToday ? 'bg-blue-600 text-white' : 'text-slate-700'
                      }`}>
                        {day.getDate()}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {activeResources.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                    No resources to display this week.
                  </td>
                </tr>
              ) : (
                activeResources.map((res, ridx) => (
                  <tr
                    key={res.id}
                    className={`${ridx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-blue-50/20 transition-colors`}
                  >
                    <td className={`px-4 py-3 sticky left-0 z-10 ${ridx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} border-r border-slate-100`}>
                      <p className="font-semibold text-slate-800 text-xs leading-tight">{res.resource_name}</p>
                      <p className="text-slate-400 text-[10px] mt-0.5">{res.resource_type}</p>
                    </td>

                    {weekDays.map((day) => {
                      const key = isoDate(day);
                      const dayBookings = (bookingsByDate[key] || [])
                        .filter(b => b.resource_id === res.id);

                      return (
                        <td key={key} className="px-1.5 py-2 align-top" style={{ minWidth: '88px' }}>
                          <div className="flex flex-col gap-1">
                            {dayBookings.map(b => {
                              const cfg = STATUS_COLOR[b.status] || STATUS_COLOR.Upcoming;
                              return (
                                <button
                                  key={b.id}
                                  id={`calendar-booking-${b.id}`}
                                  onClick={() => onView?.(b)}
                                  className={`w-full text-left rounded-md border px-1.5 py-1 text-[10px] leading-tight
                                              font-medium overflow-hidden transition-all hover:shadow-sm hover:scale-[1.02]
                                              ${cfg.light} ${cfg.border} ${cfg.text}`}
                                >
                                  <span className={`block w-full h-0.5 rounded-full mb-1 ${cfg.bar}`} />
                                  <span className="truncate block font-semibold">{b.purpose}</span>
                                  <span className="text-[9px] opacity-75 block">
                                    {formatTime12(b.start_time)}–{formatTime12(b.end_time)}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
