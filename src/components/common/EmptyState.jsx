import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * Reusable premium Empty State illustration to represent empty lists or zero filter matches.
 */
export const EmptyState = ({
  title = 'No records found',
  description = 'Try adjusting your search terms or filters to find what you are looking for.',
  icon: Icon = Inbox,
  actionButton,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-xl bg-slate-50/50 my-4 select-none animate-fade-in ${className}`}>
      <div className="p-3 bg-white border border-border rounded-xl shadow-sm text-text-secondary mb-3">
        <Icon className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="text-sm font-semibold text-text-primary mb-1">
        {title}
      </h3>
      <p className="text-xs text-text-secondary max-w-xs leading-relaxed mb-4">
        {description}
      </p>
      {actionButton && (
        <div className="animate-fade-in">
          {actionButton}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
