import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../../../../../shared/components/StatusBadge.jsx';
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
      <div className="w-full bg-surface border border-default rounded-control p-8 text-center">
        <span className="sectionLabelClassName text-danger">Failed to load tickets. Please try again.</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-surface border border-default rounded-control overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="border-b border-default bg-surface-hover">
              <th className="py-4 px-6 tableHeaderClassName text-secondary w-[140px]">Ticket #</th>
              <th className="py-4 px-6 tableHeaderClassName text-secondary">Vendor</th>
              <th className="py-4 px-6 tableHeaderClassName text-secondary">Subject</th>
              <th className="py-4 px-6 tableHeaderClassName text-secondary w-[160px]">Priority</th>
              <th className="py-4 px-6 tableHeaderClassName text-secondary w-[120px]">Status</th>
              <th className="py-4 px-6 tableHeaderClassName text-secondary w-[120px]">Department</th>
              <th className="py-4 px-6 tableHeaderClassName text-secondary">Assigned</th>
              <th className="py-4 px-6 tableHeaderClassName text-secondary w-[140px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-default">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <span className="sectionLabelClassName text-secondary">Loading tickets...</span>
                </td>
              </tr>
            ) : filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <span className="sectionLabelClassName text-secondary">No tickets found.</span>
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-surface-hover/50 transition-colors">
                  <td className="py-4 px-6">
                    <span className="ticketIdClassName text-secondary">{ticket.ticketNo}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="sectionLabelClassName text-primary-hover">
                      {ticket.vendor || '—'}
                    </span>
                  </td>
                  <td className="py-4 px-6 pr-12">
                    <span className="sectionLabelClassName text-primary-hover leading-snug block">
                      {ticket.subject}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <HelpdeskPriorityBadge priority={ticket.priority} isOverdue={ticket.isOverdue} />
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="py-4 px-6">
                    {ticket.department ? (
                      <span className="inline-block px-3 py-1 bg-surface-active text-secondary badgeClassName rounded-full whitespace-nowrap">
                        {ticket.department}
                      </span>
                    ) : (
                      <span className="captionClassName text-secondary">—</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className="captionClassName text-secondary">
                      {ticket.assignedTo || '—'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => navigate(`/helpdesk/ticket/${ticket.id}`)}
                        className="sectionLabelClassName text-primary border border-default px-4 py-2 rounded-control hover:bg-surface-hover transition-colors"
                      >
                        View Details
                      </button>
                      <button className="sectionLabelClassName text-white bg-primary px-4 py-2 rounded-control hover:bg-primary-hover transition-colors">
                        Assign to Me
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
