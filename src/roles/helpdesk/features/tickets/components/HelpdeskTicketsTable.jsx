import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../../../../../shared/components/StatusBadge.jsx';
import { HelpdeskPriorityBadge } from './HelpdeskPriorityBadge.jsx';
import { AssignTicketModal } from '../../../../../shared/components/AssignTicketModal.jsx';
import { Button } from '../../../../../shared/components/Button.jsx';
import { useGetTicketListQuery, useGetDepartmentsQuery } from '../../../../../shared/api/apiSlice.js';
import { selectUserProfile, selectUserRole } from '../../../../../features/user/store/selectors.js';

export const HelpdeskTicketsTable = ({ searchTerm, statusFilter, priorityFilter }) => {
  const profile = useSelector(selectUserProfile);
  const role = useSelector(selectUserRole);
  const navigate = useNavigate();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: tickets = [], isLoading, isError } = useGetTicketListQuery({
    userCode: profile?.userCode,
    role,
    statusId: statusFilter !== 'all' ? statusFilter : undefined,
    categoryId: undefined
  }, {
    skip: !profile?.userCode || !role
  });

  const { data: departments = [] } = useGetDepartmentsQuery({ role, userCode: profile?.userCode }, { skip: !profile?.userCode || !role });

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

  const handleAssignClick = (ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const handleAssign = (assignmentData) => {
    // TODO: Call API to assign ticket
    setIsModalOpen(false);
    setSelectedTicket(null);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
  };

  if (isError) {
    return (
      <div className="w-full bg-surface border border-default rounded-control p-8 text-center">
        <span className="text-danger">Failed to load tickets. Please try again.</span>
      </div>
    );
  }

  return (
    <>
      <div className="w-full bg-surface border border-default rounded-control overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-default bg-surface-hover">
                <th className="py-4 px-6 text-secondary w-[140px]">Ticket #</th>
                <th className="py-4 px-6 text-secondary">Vendor</th>
                <th className="py-4 px-6 text-secondary">Subject</th>
                <th className="py-4 px-6 text-secondary w-[160px]">Priority</th>
                <th className="py-4 px-6 text-secondary w-[120px]">Status</th>
                <th className="py-4 px-6 text-secondary w-[120px]">Department</th>
                <th className="py-4 px-6 text-secondary">Assigned</th>
                <th className="py-4 px-6 text-secondary w-[140px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-default">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <span className="text-secondary">Loading tickets...</span>
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <span className="text-secondary">No tickets found.</span>
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="py-4 px-6">
                      <code className="text-secondary">{ticket.ticketNo}</code>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-primary-hover">
                        {ticket.vendor || '—'}
                      </span>
                    </td>
                    <td className="py-4 px-6 pr-12">
                      <span className="text-primary-hover leading-snug block">
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
                        <small className="inline-block px-3 py-1 bg-surface-active text-secondary rounded-full whitespace-nowrap">
                          {ticket.department}
                        </small>
                      ) : (
                        <small className="text-secondary">—</small>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <small className="text-secondary">
                        {ticket.assignedTo || '—'}
                      </small>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          onClick={() => navigate(`/helpdesk/ticket/${ticket.id}`)}
                        >
                         👁 View
                        </Button>
                        <Button
                          variant="black"
                          onClick={() => handleAssignClick(ticket)}
                        >
                          Assign
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Ticket Modal */}
      <AssignTicketModal
        isOpen={isModalOpen}
        ticket={selectedTicket}
        departments={departments}
        onAssign={handleAssign}
        onCancel={handleCancel}
      />
    </>
  );
};
