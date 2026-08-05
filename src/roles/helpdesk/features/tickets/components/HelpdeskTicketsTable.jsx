import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { HelpdeskStatusBadge } from './HelpdeskStatusBadge.jsx';
import { HelpdeskPriorityBadge } from './HelpdeskPriorityBadge.jsx';
import { useGetTicketListQuery } from '../../../../../shared/api/apiSlice.js';
import { selectUserProfile } from '../../../../../features/user/store/selectors.js';

export const HelpdeskTicketsTable = ({ searchTerm, statusFilter, priorityFilter }) => {
  const profile = useSelector(selectUserProfile);
  const navigate = useNavigate();

  const { data: tickets = [], isLoading, isError } = useGetTicketListQuery({
    userCode: profile?.userCode,
    statusId: statusFilter !== 'all' ? statusFilter : undefined,
    categoryId: undefined
  }, {
    skip: !profile?.userCode
  });

  // Client-side filtering for search and priority (API doesn't support these params directly)
  const filteredTickets = tickets.filter(ticket => {
    // Search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch =
        ticket.ticketNo?.toLowerCase().includes(lowerSearch) ||
        ticket.vendor?.toLowerCase().includes(lowerSearch) ||
        ticket.subject?.toLowerCase().includes(lowerSearch) ||
        ticket.department?.toLowerCase().includes(lowerSearch);
      if (!matchesSearch) return false;
    }

    // Priority filter (client-side since API doesn't filter by priority)
    if (priorityFilter && priorityFilter !== 'all') {
      if (ticket.priority?.toLowerCase() !== String(priorityFilter).toLowerCase()) {
        return false;
      }
    }

    return true;
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
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <th className="py-4 px-6 text-[13px] font-[600] text-[#64748B] w-[140px]">Ticket #</th>
              <th className="py-4 px-6 text-[13px] font-[600] text-[#64748B]">Vendor</th>
              <th className="py-4 px-6 text-[13px] font-[600] text-[#64748B]">Subject</th>
              <th className="py-4 px-6 text-[13px] font-[600] text-[#64748B] w-[160px]">Priority</th>
              <th className="py-4 px-6 text-[13px] font-[600] text-[#64748B] w-[120px]">Status</th>
              <th className="py-4 px-6 text-[13px] font-[600] text-[#64748B] w-[120px]">Department</th>
              <th className="py-4 px-6 text-[13px] font-[600] text-[#64748B]">Assigned</th>
              <th className="py-4 px-6 text-[13px] font-[600] text-[#64748B] w-[140px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <span className="text-[14px] font-[500] text-[#64748B]">Loading tickets...</span>
                </td>
              </tr>
            ) : filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <span className="text-[14px] font-[500] text-[#64748B]">No tickets found.</span>
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-[#F8FAFC]/50 transition-colors">
                  <td className="py-4 px-6">
                    <span className="text-[13px] font-[500] text-[#64748B]">{ticket.ticketNo}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-[14px] font-[500] text-[#334155]">
                      {ticket.vendor || '—'}
                    </span>
                  </td>
                  <td className="py-4 px-6 pr-12">
                    <span className="text-[14px] font-[500] text-[#334155] leading-snug block">
                      {ticket.subject}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <HelpdeskPriorityBadge priority={ticket.priority} isOverdue={ticket.isOverdue} />
                  </td>
                  <td className="py-4 px-6">
                    <HelpdeskStatusBadge status={ticket.status} />
                  </td>
                  <td className="py-4 px-6">
                    {ticket.department ? (
                      <span className="inline-block px-3 py-1 bg-[#F1F5F9] text-[#64748B] text-[12px] font-[500] rounded-full whitespace-nowrap">
                        {ticket.department}
                      </span>
                    ) : (
                      <span className="text-[13px] text-[#64748B]">—</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-[13px] text-[#64748B]">
                      {ticket.assignedTo || '—'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => navigate(`/helpdesk/ticket/${ticket.id}`)}
                        className="text-[13px] font-[500] text-[#1E293B] border border-[#E2E8F0] px-4 py-2 rounded-[6px] hover:bg-[#F8FAFC] transition-colors"
                      >
                        View
                      </button>
                      <button className="text-[13px] font-[500] text-white bg-[#1E293B] px-4 py-2 rounded-[6px] hover:bg-[#334155] transition-colors">
                        Assign
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
