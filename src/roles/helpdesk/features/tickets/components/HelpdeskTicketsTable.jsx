import { usePagination } from '../../../../../shared/hooks/usePagination.js';
import { Pagination } from '../../../../../shared/components/Pagination.jsx';
import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../../../../../shared/components/StatusBadge.jsx';
import { HelpdeskPriorityBadge } from './HelpdeskPriorityBadge.jsx';
import { AssignTicketModal } from '../../../../../shared/components/AssignTicketModal.jsx';
import { Button } from '../../../../../shared/components/Button.jsx';
import { Table } from '../../../../../shared/components/Table.jsx';
import { useGetTicketListQuery, useGetDepartmentsQuery, useAssignTicketMutation } from '../../../../../shared/api/apiSlice.js';
import { selectUserProfile, selectUserRole } from '../../../../../features/user/store/selectors.js';
import { useNotification } from '../../../../../shared/notifications/index.js';
import { formatDate } from '../../../../../shared/utils/date.js';

/**
 * HelpdeskTicketsTable — Ticket list for Helpdesk role.
 * Uses the reusable Table component with ticket-specific column configuration.
 */
export const HelpdeskTicketsTable = ({ searchTerm, statusFilter, priorityFilter }) => {
  const profile = useSelector(selectUserProfile);
  const role = useSelector(selectUserRole);
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assignTicket, { isLoading: isAssigning }] = useAssignTicketMutation();

  const { data: tickets = [], isLoading, isError } = useGetTicketListQuery({
    userCode: profile?.userCode,
    role,
    statusId: statusFilter !== 'all' ? statusFilter : undefined,
    priorityId: priorityFilter !== 'all' ? priorityFilter : undefined,
    categoryId: undefined
  }, {
    skip: !profile?.userCode || !role
  });

  const { data: departments = [] } = useGetDepartmentsQuery({ role, userCode: profile?.userCode }, { skip: !profile?.userCode || !role });

  // Client-side filtering for search
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        const matchesSearch =
          ticket.ticketNo?.toLowerCase().includes(lowerSearch) ||
          ticket.subject?.toLowerCase().includes(lowerSearch);
        if (!matchesSearch) return false;
      }
      return true;
    });
  }, [tickets, searchTerm]);

  const { paginatedData, currentPage, totalPages, nextPage, prevPage } = usePagination(filteredTickets, 10);

  const handleAssignClick = (ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const handleAssign = async (assignmentData) => {
    try {
      // Extract user code from format "Name(Code)", fallback to original string if no match
      const extractedCode = assignmentData.agent?.match(/\(([^)]+)\)/)?.[1] || assignmentData.agent;

      const response = await assignTicket({
        ticketId: parseInt(assignmentData.ticketId, 10),
        assignedDepartmentId: parseInt(assignmentData.department, 10),
        assignedDeptBL1UserCode: extractedCode,
      }).unwrap();

      if (response?.isSuccessful === false) {
        showError(response?.message || 'Failed to assign ticket. Please try again.');
        return;
      }

      showSuccess('Ticket assigned successfully.');
      setIsModalOpen(false);
      setSelectedTicket(null);
    } catch (error) {
      showError(error?.data?.message || 'Failed to assign ticket. Please try again.');
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
  };

  // ─── Column Configuration ───
  const columns = useMemo(() => [
    {
      key: 'ticketNo',
      header: 'Ticket No',
      width: '160px',
      nowrap: true,
      truncate: false,
      render: (row) => (
        <code className='text-secondary text-sm'>{row.ticketNo}</code>
      ),
    },
    {
      key: 'subject',
      header: 'Subject',
      flex: 0.9,
      truncate: true,
      render: (row) => (
        <span className='text-primary-hover leading-snug block' title={row.subject}>
          {row.subject}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '110px',
      nowrap: true,
      truncate: false,
      render: (row) => (
        <StatusBadge status={row.status} colorHex={row.statusColorHex} />
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      width: '110px',
      nowrap: true,
      truncate: false,
      render: (row) => (
        <HelpdeskPriorityBadge priority={row.priority} colorHex={row.priorityColorHex} />
      ),
    },
    {
      key: 'createAt',
      header: 'Created At',
      width: '150px',
      nowrap: true,
      truncate: false,
      render: (row) => (
        <small className='text-secondary whitespace-nowrap'>
          {formatDate(row.createAt) || '—'}
        </small>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '130px',
      nowrap: true,
      truncate: false,
      align: 'left',
      render: (row) => (
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => navigate(`/helpdesk/ticket/${row.id}`)}
          >
            👁 View
          </Button>
          {row.status?.toLowerCase() !== 'resolved' && (
            <Button
              variant='black'
              size='sm'
              onClick={() => handleAssignClick(row)}
            >
              Assign
            </Button>
          )}
        </div>
      ),
    },
  ], [navigate]);

  if (isError) {
    return (
      <div className='w-full bg-surface border border-default rounded-control p-8 text-center'>
        <span className='text-danger'>Failed to load tickets. Please try again.</span>
      </div>
    );
  }

  return (
    <>
      <Table columns={columns}
        data={paginatedData}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        emptyMessage='No tickets found.'
      />

      {/* Assign Ticket Modal */}
      
      <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onNext={nextPage} 
          onPrev={prevPage} 
        />
      <AssignTicketModal
        isOpen={isModalOpen}
        ticket={selectedTicket}
        departments={departments}
        onAssign={handleAssign}
        onCancel={handleCancel}
        isSubmitting={isAssigning}
      />
    </>
  );
};
