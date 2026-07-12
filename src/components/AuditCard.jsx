import React from 'react';
import { Card } from './common/Card';

const AuditCard = ({ label, value, colorClass = 'text-text-primary', accentClass = '', icon: Icon }) => {
  return (
    <Card className={`p-5 bg-white flex items-center justify-between border border-border shadow-sm rounded-xl hover:shadow-md transition-all duration-300 ${accentClass ? `border-l-4 ${accentClass}` : ''}`}>
      <div className="flex flex-col gap-1 min-w-0">
        <span className="text-xs text-text-secondary font-semibold uppercase tracking-wider">{label}</span>
        <span className={`text-3xl font-extrabold tracking-tight mt-1 ${colorClass}`}>
          {value}
        </span>
      </div>
      {Icon && (
        <div className="p-3 bg-slate-50 text-slate-500 rounded-xl border border-slate-100 flex-shrink-0">
          <Icon className="h-6 w-6 text-slate-400" />
        </div>
      )}
    </Card>
  );
};

export default AuditCard;
