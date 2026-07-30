import React from 'react';
import { useSelector } from 'react-redux';
import { StatusBadge } from './StatusBadge.jsx';
import { PipelineStepper } from './PipelineStepper.jsx';
import { useGetTicketListQuery } from '../../../../../shared/api/apiSlice.js';
import { selectUserProfile } from '../../../../../features/user/store/selectors.js';

export const TicketsTable = ({ statusId, categoryId, searchTerm }) => {
  const profile = useSelector(selectUserProfile);

  const { data: tickets = [], isLoading, isError } = useGetTicketListQuery({
    userCode: profile?.userCode,
    statusId,
    categoryId
  }, {
    skip: !profile?.userCode
  });

  const filteredTickets = tickets.filter(ticket => {
    if (!searchTerm) return true;
    const lowerSearch = searchTerm.toLowerCase();
    return (
      ticket.subject?.toLowerCase().includes(lowerSearch) ||
      ticket.ticketNo?.toLowerCase().includes(lowerSearch)
    );
  });

  if (isError) {
    return (
      <div className="w-full bg-white border border-[#E2E8F0] rounded-[8px] p-8 text-center">
        <span className="text-[14px] font-[500] text-[#EF4444]">Failed to load tickets. Please try again.</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-[#E2E8F0] rounded-[8px] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <th className="py-4 px-6 text-[13px] font-[600] text-[#64748B] w-[140px]">Ticket #</th>
              <th className="py-4 px-6 text-[13px] font-[600] text-[#64748B]">Subject</th>
              <th className="py-4 px-6 text-[13px] font-[600] text-[#64748B] w-[220px]">Category</th>
              <th className="py-4 px-6 text-[13px] font-[600] text-[#64748B] w-[120px]">Status</th>
              <th className="py-4 px-6 text-[13px] font-[600] text-[#64748B] w-[120px]">Pipeline</th>
              <th className="py-4 px-6 text-[13px] font-[600] text-[#64748B] w-[120px]">Created</th>
              <th className="py-4 px-6 text-[13px] font-[600] text-[#64748B] w-[140px]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <span className="text-[14px] font-[500] text-[#64748B]">Loading tickets...</span>
                </td>
              </tr>
            ) : filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <span className="text-[14px] font-[500] text-[#64748B]">No tickets found.</span>
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-[#F8FAFC]/50 transition-colors">
                  <td className="py-4 px-6">
                    <span className="text-[13px] font-[500] text-[#64748B]">{ticket.ticketNo}</span>
                  </td>
                  <td className="py-4 px-6 pr-12">
                    <span className="text-[14px] font-[500] text-[#334155] leading-snug block">
                      {ticket.subject}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-block px-3 py-1 bg-[#F1F5F9] text-[#64748B] text-[12px] font-[500] rounded-full whitespace-nowrap">
                      {ticket.category}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="py-4 px-6">
                    {/* The new API doesn't provide pipelineStep, passing null safely avoids crashes while keeping UI intact */}
                    <PipelineStepper currentStep={null} status={ticket.status} />
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-[13px] text-[#64748B] whitespace-nowrap">
                      {ticket.createAt ? new Date(ticket.createAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <button className="text-[13px] font-[600] text-[#1E293B] hover:underline">
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
