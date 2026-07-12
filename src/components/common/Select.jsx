import React from 'react';

/**
 * Reusable premium form select dropdown component.
 */
const Select = React.forwardRef(({
  label,
  error,
  id,
  className = '',
  required = false,
  helperText,
  options = [], // [{ value: '...', label: '...' }]
  placeholder = 'Select an option',
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
      <div className="relative w-full">
        <select
          ref={ref}
          id={id}
          className={`w-full h-10 px-3 py-2 bg-white border rounded-lg text-sm transition-colors duration-200 outline-none appearance-none
            ${error 
              ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger' 
              : 'border-border focus:border-primary focus:ring-1 focus:ring-primary'
            }
            text-text-primary disabled:opacity-50 disabled:bg-slate-50 pr-10`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Custom arrow indicator */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-text-secondary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
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

Select.displayName = 'Select';

export default Select;
