import React from 'react';

/**
 * Reusable Divider component to render horizontal separation lines.
 * Supports center-aligned text.
 */
const Divider = ({ children, className = '' }) => {
  return (
    <div className={`relative flex py-2 items-center w-full ${className}`}>
      <div className="flex-grow border-t border-border"></div>
      {children && (
        <span className="flex-shrink mx-4 text-xs font-medium text-text-secondary bg-transparent uppercase tracking-wider">
          {children}
        </span>
      )}
      <div className="flex-grow border-t border-border"></div>
    </div>
  );
};

export default Divider;
