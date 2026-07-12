import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export const Alert = ({
  children,
  variant = 'info',
  className = '',
  ...props
}) => {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    danger: 'bg-red-50 border-red-200 text-red-800',
  };

  const icons = {
    info: <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />,
    success: <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />,
    danger: <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />,
  };

  const styleClass = styles[variant] || styles.info;
  const icon = icons[variant] || icons.info;

  return (
    <div
      role="alert"
      className={`flex gap-3 p-4 border rounded-xl animate-fade-in ${styleClass} ${className}`}
      {...props}
    >
      {icon}
      <div className="flex-1 flex flex-col gap-0.5">
        {children}
      </div>
    </div>
  );
};

export const AlertTitle = ({ children, className = '', ...props }) => {
  return (
    <h5
      className={`text-sm font-semibold tracking-tight leading-none ${className}`}
      {...props}
    >
      {children}
    </h5>
  );
};

export const AlertDescription = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`text-xs opacity-90 leading-relaxed mt-1 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Alert;

