import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

/** Section divider */
export const SectionDivider = () => (
  <div className="border-t border-default my-2" />
);

/** Section heading */
export const SectionHeading = ({ children, className = '' }) => (
  <h3 className={`text-section-label text-secondary mb-2 ${className}`}>{children}</h3>
);

/**
 * CollapsibleSection — Reusable collapsible wrapper for sections.
 * Preserves the exact styling of the original static sections.
 *
 * @param {Object} props
 * @param {string} props.title - Section title text
 * @param {boolean} props.defaultOpen - Initial state of the section
 * @param {React.ReactNode} props.children - Section content
 */
export const CollapsibleSection = ({ title, defaultOpen = false, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="px-5 py-3 border-b border-default">
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
      >
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-secondary shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-secondary shrink-0" />
        )}
        <SectionHeading className="mb-0">{title}</SectionHeading>
      </button>
      
      {isOpen && (
        <div className="mt-2">
          <SectionDivider />
          {children}
        </div>
      )}
    </div>
  );
};
