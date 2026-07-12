import React from 'react';

/**
 * Reusable premium form input text component.
 */
const Input = React.forwardRef(({
  label,
  error,
  id,
  type = 'text',
  className = '',
  required = false,
  helperText,
  ...props
}, ref) => {
  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label 
          htmlFor={id} 
          className="text-xs font-semibold text-text-primary flex items-center gap-0.5"
        >
          {label}
          {required && <span className="text-danger">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        type={type}
        className={`w-full h-10 px-3 py-2 bg-white border rounded-lg text-sm transition-colors duration-200 outline-none
          ${error 
            ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger' 
            : 'border-border focus:border-primary focus:ring-1 focus:ring-primary'
          }
          placeholder-text-secondary placeholder:text-slate-400 text-text-primary disabled:opacity-50 disabled:bg-slate-50`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
        {...props}
      />
      {error ? (
        <span 
          id={`${id}-error`} 
          className="text-xs text-danger font-medium flex items-center animate-fade-in"
        >
          {error}
        </span>
      ) : helperText ? (
        <span 
          id={`${id}-helper`} 
          className="text-xs text-text-secondary"
        >
          {helperText}
        </span>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
