import React from 'react';

/**
 * Compact key-value row for bill-style layout.
 * Used in Ticket Information, Processing & Assignment, and Timeline sections.
 */
export const FieldRow = ({ label, value }) => (
  <div className="flex items-baseline gap-2 py-1">
    <span className="text-caption text-secondary whitespace-nowrap">{label}</span>
    <span className="text-caption text-secondary">:</span>
    <span className="text-body text-primary truncate">{value || '—'}</span>
  </div>
);

/**
 * Chip for displaying tags, categories, priority, etc.
 */
export const InfoChip = ({ children }) => (
  <span className="inline-flex items-center px-3 py-1 rounded-full text-caption bg-surface-active text-secondary border border-default">
    {children}
  </span>
);
