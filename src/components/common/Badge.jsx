import React from 'react';

/**
 * Reusable premium Badge component for display values (Role, status badges).
 */
export const Badge = ({
  children,
  variant = 'secondary', // primary, success, warning, danger, info, secondary
  className = '',
  ...props
}) => {
  const styles = {
    primary: 'bg-primary-light text-primary border-blue-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    secondary: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const variantStyle = styles[variant] || styles.secondary;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variantStyle} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
