import React from 'react';
import { cn } from '../../../../../shared/utils/cn.js';

export const StatusBadge = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case 'In Progress':
        return 'bg-[#DBEAFE] text-[#2563EB]';
      case 'On Hold':
        return 'bg-[#F3E8FF] text-[#9333EA]';
      case 'Closed':
        return 'bg-white border border-[#E2E8F0] text-[#64748B]';
      case 'Raised':
        return 'bg-[#FEF9C3] text-[#CA8A04]';
      default:
        return 'bg-[#F1F5F9] text-[#64748B]';
    }
  };

  return (
    <span className={cn("px-3 py-1 rounded-full text-[12px] font-[500] whitespace-nowrap", getStyles())}>
      {status}
    </span>
  );
};
