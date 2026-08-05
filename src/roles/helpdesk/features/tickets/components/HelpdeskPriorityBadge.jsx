import React from 'react';
import { cn } from '../../../../../shared/utils/cn.js';

export const HelpdeskPriorityBadge = ({ priority, isOverdue = false }) => {
  const getPriorityStyles = () => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-[#FEE2E2] text-[#DC2626]';
      case 'medium':
        return 'bg-[#FEF9C3] text-[#CA8A04]';
      case 'low':
        return 'bg-[#A7F3D0] text-[#059669]';
      case 'escalate':
        return 'bg-[#FEE2E2] text-[#DC2626]';
      default:
        return 'bg-[#F1F5F9] text-[#64748B]';
    }
  };

  const getOverdueStyles = () => {
    return 'bg-[#DC2626] text-white';
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={cn("px-3 py-1 rounded-full text-[12px] font-[500] whitespace-nowrap", getPriorityStyles())}>
        {priority}
      </span>
      {isOverdue && (
        <span className={cn("px-3 py-1 rounded-full text-[12px] font-[500] whitespace-nowrap", getOverdueStyles())}>
          OVERDUE
        </span>
      )}
    </div>
  );
};
