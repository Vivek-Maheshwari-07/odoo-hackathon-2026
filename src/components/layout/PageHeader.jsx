import React from 'react';

/**
 * Standardized PageHeader component to display page titles and descriptions.
 */
const PageHeader = ({ title, description, className = '' }) => {
  return (
    <div className={`flex flex-col gap-1 text-center sm:text-left ${className}`}>
      <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl leading-none">
        {title}
      </h1>
      {description && (
        <p className="text-sm text-text-secondary leading-relaxed font-normal">
          {description}
        </p>
      )}
    </div>
  );
};

export default PageHeader;
export { PageHeader };
