import React from 'react';

/**
 * Reusable premium button component styled to match shadcn/ui.
 */
const Button = React.forwardRef(({
  className = '',
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  children,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus-ring disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover shadow-sm',
    secondary: 'bg-primary-light text-primary hover:bg-opacity-80',
    outline: 'border border-border bg-transparent text-text-primary hover:bg-slate-50',
    link: 'bg-transparent text-primary hover:underline p-0 shadow-none border-none',
  };

  const sizes = {
    sm: 'h-9 px-3 text-xs',
    md: 'h-10 px-4 py-2 text-sm',
    lg: 'h-11 px-8 text-base',
    link: 'p-0 text-sm h-auto',
  };

  const variantStyle = variants[variant] || variants.primary;
  const sizeStyle = sizes[size] || sizes.md;

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={`${baseStyles} ${variantStyle} ${sizeStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
