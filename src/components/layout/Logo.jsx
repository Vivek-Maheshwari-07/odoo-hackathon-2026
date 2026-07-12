import React from 'react';

/**
 * Reusable SVG Branding Logo for AssetFlow ERP.
 */
const Logo = ({ className = '', size = 'md', hideText = false }) => {
  const sizeClasses = {
    sm: {
      svg: 'h-6 w-6',
      text: 'text-lg',
    },
    md: {
      svg: 'h-8 w-8',
      text: 'text-xl',
    },
    lg: {
      svg: 'h-10 w-10',
      text: 'text-2xl',
    },
  };

  const selectedSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Premium SVG Icon */}
      <svg
        className={`${selectedSize.svg} transition-transform duration-300 hover:rotate-12`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Layer 1 (Darker primary blue card) */}
        <path
          d="M4 14V6C4 4.89543 4.89543 4 6 4H14V14H4Z"
          fill="#2563EB"
          className="opacity-95"
        />
        {/* Layer 2 (Lighter blue overlay card showing flow/growth) */}
        <path
          d="M10 20V10C10 8.89543 10.8954 8 12 8H20V20H10Z"
          fill="#3B82F6"
          className="mix-blend-multiply opacity-90"
        />
        {/* Flow visual arrow/connect dots */}
        <circle cx="9" cy="9" r="1.5" fill="#FFFFFF" />
        <circle cx="15" cy="15" r="1.5" fill="#FFFFFF" />
      </svg>
      
      {!hideText && (
        <span className={`${selectedSize.text} font-bold tracking-tight text-text-primary flex items-center`}>
          Asset<span className="text-primary">Flow</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
