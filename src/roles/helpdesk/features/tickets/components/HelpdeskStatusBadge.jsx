import React from 'react';
import { cn } from '../../../../../shared/utils/cn.js';

export const HelpdeskStatusBadge = ({ status }) => {
  const getStyles = () => {
    switch (status?.toLowerCase()) {
      case 'in progress':
        return 'bg-[#DBEAFE] text-[#2563EB]';
      case 'open':
        return 'bg-[#DBEAFE] text-[#2563EB]';
      case 'on hold':
        return 'bg-[#F3E8FF] text-[#9333EA]';
      case 'resolved':
        return 'bg-[#A7F3D0] text-[#065F46]';
      case 'closed':
        return 'bg-[#F1F5F9] text-[#64748B]';
      case 'new':
        return 'bg-[#DBEAFE] text-[#2563EB]';
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
