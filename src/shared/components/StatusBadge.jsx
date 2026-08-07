import React from 'react';
import { cn } from '../utils/cn.js';

// Centralized status-to-style mapping
// Using existing semantic tokens: success, warning, danger
const STATUS_STYLES = {
  'Open': 'bg-warning-soft text-warning border-warning',
  'Raised': 'bg-warning-soft text-warning border-warning',
  'Escalated': 'bg-warning-soft text-warning border-warning',
  'In Progress': 'bg-warning-soft text-warning border-warning',
  'Resolved': 'bg-success-soft text-success border-success',
  'Closed': 'bg-success-soft text-success border-success',
  'Completed': 'bg-success-soft text-success border-success',
  'Rejected': 'bg-danger-soft text-danger border-danger',
  'Cancelled': 'bg-danger-soft text-danger border-danger',
  'Failed': 'bg-danger-soft text-danger border-danger',
};

export const StatusBadge = ({ status, className }) => {
  // Fallback to warning style for unknown/null statuses 
  // since the backend currently defaults to Open-like workflows
  const styles = STATUS_STYLES[status] || 'bg-warning-soft text-warning border-warning';

  return (
    <span 
      className={cn(
        "px-3 py-1 rounded-full whitespace-nowrap border", 
        styles,
        className
      )}
    >
      {status || 'Open'}
    </span>
  );
};
