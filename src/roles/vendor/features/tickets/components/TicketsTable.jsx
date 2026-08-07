import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../../../../../shared/components/StatusBadge.jsx';
import { PipelineStepper } from './PipelineStepper.jsx';
import { useGetTicketListQuery } from '../../../../../shared/api/apiSlice.js';
import { selectUserProfile, selectUserRole } from '../../../../../features/user/store/selectors.js';

export const TicketsTable = ({ statusId, categoryId, searchTerm }) => {
  const profile = useSelector(selectUserProfile);
  const role = useSelector(selectUserRole);
  const navigate = useNavigate();

  const { data: tickets = [], isLoading, isError } = useGetTicketListQuery({
    userCode: profile?.userCode,
    role,
    statusId,
    categoryId
  }, {
    skip: !profile?.userCode || !role
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
      <div className="w-full bg-surface border border-default rounded-control p-8 text-center">
        <span className="sectionLabelClassName text-danger">Failed to load tickets. Please try again.</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-surface border border-default rounded-control overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-default bg-surface-hover">
              <th className="py-4 px-6 tableHeaderClassName text-secondary w-[140px]">Ticket #</th>
              <th className="py-4 px-6 tableHeaderClassName text-secondary">Subject</th>
              <th className="py-4 px-6 tableHeaderClassName text-secondary w-[220px]">Category</th>
              <th className="py-4 px-6 tableHeaderClassName text-secondary w-[120px]">Status</th>
              <th className="py-4 px-6 tableHeaderClassName text-secondary w-[120px]">Pipeline</th>
              <th className="py-4 px-6 tableHeaderClassName text-secondary w-[120px]">Created</th>
              <th className="py-4 px-6 tableHeaderClassName text-secondary w-[140px]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-default">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <span className="sectionLabelClassName text-secondary">Loading tickets...</span>
                </td>
              </tr>
            ) : filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <span className="sectionLabelClassName text-secondary">No tickets found.</span>
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-surface-hover/50 transition-colors">
                  <td className="py-4 px-6">
                    <span className="ticketIdClassName text-secondary">{ticket.ticketNo}</span>
                  </td>
                  <td className="py-4 px-6 pr-12">
                    <span className="sectionLabelClassName text-primary-hover leading-snug block">
                      {ticket.subject}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-block px-3 py-1 bg-surface-active text-secondary badgeClassName rounded-full whitespace-nowrap">
                      {ticket.category}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="py-4 px-6">
                    {/* Mapping is now handled internally by PipelineStepper based on status */}
                    <PipelineStepper status={ticket.status} />
                  </td>
                  <td className="py-4 px-6">
                    <span className="captionClassName text-secondary whitespace-nowrap">
                      {ticket.createAt ? new Date(ticket.createAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => navigate(`/vendor/ticket/${ticket.id}`)}
                        className="sectionLabelClassName text-primary hover:underline"
                      >
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
