import React from 'react';
import { Ticket, Hourglass, Check, AlertCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Card } from '../../../../../shared/components/Card.jsx';
import { useGetTicketCountQuery } from '../../../../../shared/api/apiSlice.js';
import { selectUserProfile } from '../../../../../features/user/store/selectors.js';

export const DashboardMetrics = () => {
  const profile = useSelector(selectUserProfile);
  const { data, isLoading, isError } = useGetTicketCountQuery(profile?.userCode, {
    skip: !profile?.userCode
  });

  if (isError) {
    return (
      <div className="flex items-center gap-2 text-[#E11D48] bg-[#FFE4E6] p-4 rounded-[12px] mb-8 shadow-sm">
        <AlertCircle className="w-5 h-5" />
        <span className="text-[14px] font-[500]">Failed to load ticket metrics. Please try again.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      
      <Card className="flex-1 p-6 rounded-[12px] shadow-sm flex items-center justify-between">
        <div>
          <p className="text-[#64748B] text-[13px] font-[500] mb-1">Total tickets</p>
          <h2 className="text-[#1E293B] text-[32px] font-[600] leading-none">
            {isLoading ? '...' : data?.totalCount ?? 0}
          </h2>
        </div>
        <div className="w-12 h-12 rounded-[8px] bg-[#F1F5F9] flex items-center justify-center">
          <Ticket className="w-6 h-6 text-[#1E293B]" />
        </div>
      </Card>

      <Card className="flex-1 p-6 rounded-[12px] shadow-sm flex items-center justify-between">
        <div>
          <p className="text-[#64748B] text-[13px] font-[500] mb-1">In progress</p>
          <h2 className="text-[#1E293B] text-[32px] font-[600] leading-none">
            {isLoading ? '...' : data?.inProgress ?? 0}
          </h2>
        </div>
        <div className="w-12 h-12 rounded-[8px] bg-[#FEF08A] flex items-center justify-center">
          <Hourglass className="w-6 h-6 text-[#854D0E]" />
        </div>
      </Card>

      <Card className="flex-1 p-6 rounded-[12px] shadow-sm flex items-center justify-between">
        <div>
          <p className="text-[#64748B] text-[13px] font-[500] mb-1">Resolved</p>
          <h2 className="text-[#1E293B] text-[32px] font-[600] leading-none">
            {isLoading ? '...' : data?.resolved ?? 0}
          </h2>
        </div>
        <div className="w-12 h-12 rounded-[8px] bg-[#A7F3D0] flex items-center justify-center">
          <Check className="w-6 h-6 text-[#065F46]" />
        </div>
      </Card>

    </div>
  );
};
