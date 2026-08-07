import React from 'react';
import { cn } from '../../../../../shared/utils/cn.js';

export const HelpdeskPriorityBadge = ({ priority, isOverdue = false }) => {
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

  const getOverdueStyles = () => {
    return 'bg-danger text-white';
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <small className={cn("px-3 py-1 rounded-full whitespace-nowrap", getPriorityStyles())}>
        {priority}
      </small>
      {isOverdue && (
        <small className={cn("px-3 py-1 rounded-full whitespace-nowrap", getOverdueStyles())}>
          OVERDUE
        </small>
      )}
    </div>
  );
};
