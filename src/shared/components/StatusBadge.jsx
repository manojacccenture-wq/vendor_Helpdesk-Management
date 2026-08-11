import React from 'react';
import { cn } from '../utils/cn.js';

// Centralized status-to-style mapping
// Fallback colors when API does not provide a colorHex.
// When colorHex is provided by the API, inline styles override these.
// Status IDs from DB: 1=Open, 2=In Progress, 3=On Hold, 4=Resolved, 5=Closed, 6=Escalated
const STATUS_STYLES = {
  'Open': 'bg-info-soft text-info border-info',
  'In Progress': 'bg-warning-soft text-warning border-warning',
  'On Hold': 'bg-secondary-soft text-secondary border-secondary',
  'Resolved': 'bg-success-soft text-success border-success',
  'Closed': 'bg-secondary-soft text-secondary border-secondary',
  'Escalated': 'bg-danger-soft text-danger border-danger',
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
