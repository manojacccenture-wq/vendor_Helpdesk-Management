import React from 'react';
import { cn } from '../../../../../shared/utils/cn.js';

export const HelpdeskPriorityBadge = ({ priority, colorHex }) => {
  const getPriorityStyles = () => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-danger-soft text-danger';
      case 'medium':
        return 'bg-warning-soft text-warning';
      case 'low':
        return 'bg-success-soft text-success';
      case 'escalate':
        return 'bg-danger-soft text-danger';
      default:
        return 'bg-surface-active text-secondary';
    }
  };

  // Use API-provided color if available, otherwise fallback to hardcoded mapping
  const useApiColor = !!colorHex;

  return (
    <small
      className={cn(
        "px-3 py-1 rounded-full whitespace-nowrap",
        useApiColor ? '' : getPriorityStyles()
      )}
      style={useApiColor ? { backgroundColor: `${colorHex}20`, color: colorHex } : undefined}
    >
      {priority}
    </small>
  );
};
