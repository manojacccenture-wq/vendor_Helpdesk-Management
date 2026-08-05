import React from 'react';
import { Ticket, Hourglass, Check, AlertTriangle } from 'lucide-react';
import { Card } from '../../../../../shared/components/Card.jsx';

export const HelpdeskMetrics = () => {
  // Static data for demo - will be replaced with API calls
  const metrics = {
    newTickets: 1,
    inProgress: 4,
    resolved: 1,
    slaOverdue: 4,
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      
      {/* New Tickets */}
      <Card className="flex-1 p-6 rounded-[12px] shadow-sm flex items-center justify-between">
        <div>
          <p className="text-[#64748B] text-[13px] font-[500] mb-1">New tickets</p>
          <h2 className="text-[#1E293B] text-[32px] font-[600] leading-none">
            {metrics.newTickets}
          </h2>
        </div>
        <div className="w-12 h-12 rounded-[8px] bg-[#F1F5F9] flex items-center justify-center">
          <Ticket className="w-6 h-6 text-[#1E293B]" />
        </div>
      </Card>

      {/* In Progress */}
      <Card className="flex-1 p-6 rounded-[12px] shadow-sm flex items-center justify-between">
        <div>
          <p className="text-[#64748B] text-[13px] font-[500] mb-1">In progress</p>
          <h2 className="text-[#1E293B] text-[32px] font-[600] leading-none">
            {metrics.inProgress}
          </h2>
        </div>
        <div className="w-12 h-12 rounded-[8px] bg-[#FEF9C3] flex items-center justify-center">
          <Hourglass className="w-6 h-6 text-[#854D0E]" />
        </div>
      </Card>

      {/* Resolved */}
      <Card className="flex-1 p-6 rounded-[12px] shadow-sm flex items-center justify-between">
        <div>
          <p className="text-[#64748B] text-[13px] font-[500] mb-1">Resolved</p>
          <h2 className="text-[#1E293B] text-[32px] font-[600] leading-none">
            {metrics.resolved}
          </h2>
        </div>
        <div className="w-12 h-12 rounded-[8px] bg-[#A7F3D0] flex items-center justify-center">
          <Check className="w-6 h-6 text-[#065F46]" />
        </div>
      </Card>

      {/* SLA Overdue */}
      <Card className="flex-1 p-6 rounded-[12px] shadow-sm flex items-center justify-between bg-[#FEF9C3]">
        <div>
          <p className="text-[#D97706] text-[13px] font-[500] mb-1">SLA overdue</p>
          <h2 className="text-[#D97706] text-[32px] font-[600] leading-none">
            {metrics.slaOverdue}
          </h2>
        </div>
        <div className="w-12 h-12 rounded-[8px] bg-white/50 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-[#D97706]" />
        </div>
      </Card>

    </div>
  );
};
