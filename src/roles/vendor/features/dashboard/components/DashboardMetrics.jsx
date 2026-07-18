import React from 'react';
import { Ticket, Hourglass, Check } from 'lucide-react';
import { Card } from '../../../../../shared/components/Card.jsx';

export const DashboardMetrics = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      
      <Card className="flex-1 p-6 rounded-[12px] shadow-sm flex items-center justify-between">
        <div>
          <p className="text-[#64748B] text-[13px] font-[500] mb-1">Total tickets</p>
          <h2 className="text-[#1E293B] text-[32px] font-[600] leading-none">0</h2>
        </div>
        <div className="w-12 h-12 rounded-[8px] bg-[#F1F5F9] flex items-center justify-center">
          <Ticket className="w-6 h-6 text-[#1E293B]" />
        </div>
      </Card>

      <Card className="flex-1 p-6 rounded-[12px] shadow-sm flex items-center justify-between">
        <div>
          <p className="text-[#64748B] text-[13px] font-[500] mb-1">In progress</p>
          <h2 className="text-[#1E293B] text-[32px] font-[600] leading-none">0</h2>
        </div>
        <div className="w-12 h-12 rounded-[8px] bg-[#FEF08A] flex items-center justify-center">
          <Hourglass className="w-6 h-6 text-[#854D0E]" />
        </div>
      </Card>

      <Card className="flex-1 p-6 rounded-[12px] shadow-sm flex items-center justify-between">
        <div>
          <p className="text-[#64748B] text-[13px] font-[500] mb-1">Resolved</p>
          <h2 className="text-[#1E293B] text-[32px] font-[600] leading-none">0</h2>
        </div>
        <div className="w-12 h-12 rounded-[8px] bg-[#A7F3D0] flex items-center justify-center">
          <Check className="w-6 h-6 text-[#065F46]" />
        </div>
      </Card>

    </div>
  );
};
