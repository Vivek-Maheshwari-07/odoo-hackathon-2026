import React from 'react';

/**
 * Reusable layout wrapper for form containers, adding slide-up and fade-in animations.
 */
const FormContainer = ({ children, className = '' }) => {
  return (
    <div className={`w-full max-w-[420px] mx-auto flex flex-col gap-6 animate-slide-up ${className}`}>
      {children}
    </div>
  );
};

export default FormContainer;
