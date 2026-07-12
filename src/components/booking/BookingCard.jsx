// src/components/booking/BookingCard.jsx
import React from 'react';
import { MapPin, Users, Calendar } from 'lucide-react';

const TYPE_ICON_MAP = {
  'Meeting Room':     '🏠',
  'Conference Room':  '🏢',
  'Projector':        '📽️',
  'Company Vehicle':  '🚗',
  'Shared Equipment': '🔧',
};

const STATUS_STYLE = {
  Active:              { badge: 'bg-green-50 text-green-700 border-green-200',  dot: 'bg-green-500' },
  Inactive:            { badge: 'bg-slate-100 text-slate-500 border-slate-200', dot: 'bg-slate-400' },
  'Under Maintenance': { badge: 'bg-orange-50 text-orange-700 border-orange-200',dot:'bg-orange-500'},
};

const BookingCard = ({ resource, onBook }) => {
  const statusCfg = STATUS_STYLE[resource.status] || STATUS_STYLE.Active;
  const canBook   = resource.status === 'Active';

  return (
    <div className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md
                    hover:border-blue-200 transition-all duration-200 overflow-hidden flex flex-col">
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-blue-400" />
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{TYPE_ICON_MAP[resource.resource_type] || '📦'}</span>
            <div>
              <h3 className="font-bold text-slate-800 text-sm leading-tight">{resource.resource_name}</h3>
              <span className="text-xs text-slate-400">{resource.resource_type}</span>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusCfg.badge} flex-shrink-0`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
            {resource.status}
          </span>
        </div>
        {resource.location && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin size={12} />
            <span>{resource.location}</span>
          </div>
        )}
        {resource.capacity && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Users size={12} />
            <span>Capacity: {resource.capacity}</span>
          </div>
        )}
        <div className="flex-1" />
        <button
          id={`book-card-${resource.id}`}
          onClick={() => canBook && onBook?.(resource)}
          disabled={!canBook}
          className={`w-full py-2 rounded-lg text-sm font-semibold transition-all duration-150
            ${canBook
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
        >
          {canBook ? (
            <span className="flex items-center justify-center gap-1.5">
              <Calendar size={14} />
              Book Now
            </span>
          ) : resource.status}
        </button>
      </div>
    </div>
  );
};

export default BookingCard;
