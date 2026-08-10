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

export const StatusBadge = ({ status, colorHex, className }) => {
  // Use API-provided color if available, otherwise fallback to hardcoded mapping
  const styles = STATUS_STYLES[status] || 'bg-warning-soft text-warning border-warning';

  // When API provides a hex color, apply it as inline styles for both bg and text
  const useApiColor = !!colorHex;

  return (
    <span 
      className={cn(
        "px-3 py-1 rounded-full whitespace-nowrap border",
        useApiColor ? 'border-transparent' : styles,
        className
      )}
      style={useApiColor ? { backgroundColor: `${colorHex}20`, color: colorHex, borderColor: `${colorHex}40` } : undefined}
    >
      {status || '----'}
    </span>
  );
};
