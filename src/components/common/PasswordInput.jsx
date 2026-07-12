import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Reusable PasswordInput with a toggle icon (Eye / EyeOff) to show/hide the password.
 */
const PasswordInput = React.forwardRef(({
  label,
  error,
  id,
  className = '',
  required = false,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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
        <input
          ref={ref}
          id={id}
          type={showPassword ? 'text' : 'password'}
          className={`w-full h-10 pl-3 pr-10 py-2 bg-white border rounded-lg text-sm transition-colors duration-200 outline-none
            ${error 
              ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger' 
              : 'border-border focus:border-primary focus:ring-1 focus:ring-primary'
            }
            placeholder-text-secondary placeholder:text-slate-400 text-text-primary pr-10`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-text-primary focus:outline-none transition-colors duration-150"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="h-4.5 w-4.5" />
          ) : (
            <Eye className="h-4.5 w-4.5" />
          )}
        </button>
      </div>
      {error && (
        <span 
          id={`${id}-error`} 
          className="text-xs text-danger font-medium flex items-center animate-fade-in"
        >
          {error}
        </span>
      )}
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
