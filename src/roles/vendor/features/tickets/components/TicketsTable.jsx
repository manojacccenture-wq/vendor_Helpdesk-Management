import { usePagination } from '../../../../../shared/hooks/usePagination.js';
import { Pagination } from '../../../../../shared/components/Pagination.jsx';
import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../../../../../shared/components/StatusBadge.jsx';
import { PipelineStepper } from './PipelineStepper.jsx';
import { Button } from '../../../../../shared/components/Button.jsx';
import { TicketFeedbackModal } from '../../../../../shared/components/TicketFeedbackModal.jsx';
import { Table } from '../../../../../shared/components/Table.jsx';
import { useGetTicketListQuery } from '../../../../../shared/api/apiSlice.js';
import { selectUserProfile, selectUserRole } from '../../../../../features/user/store/selectors.js';

/**
 * TicketsTable — Ticket list for Vendor role.
 * Uses the reusable Table component with ticket-specific column configuration.
 */
export const TicketsTable = ({ statusId, categoryId, searchTerm }) => {
  const profile = useSelector(selectUserProfile);
  const role = useSelector(selectUserRole);
  const navigate = useNavigate();
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedFeedbackTicket, setSelectedFeedbackTicket] = useState(null);

  const { data: tickets = [], isLoading, isError } = useGetTicketListQuery({
    userCode: profile?.userCode,
    role,
    statusId,
    categoryId
  }, {
    skip: !profile?.userCode || !role
  });

  // Client-side filtering for search
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      if (!searchTerm) return true;
      const lowerSearch = searchTerm.toLowerCase();
      return (
        ticket.subject?.toLowerCase().includes(lowerSearch) ||
        ticket.ticketNo?.toLowerCase().includes(lowerSearch)
      );
    });
  }, [tickets, searchTerm]);

  const { paginatedData, currentPage, totalPages, nextPage, prevPage } = usePagination(filteredTickets, 10);

  // ─── Column Configuration ───
  const columns = useMemo(() => [
    {
      key: 'ticketNo',
      header: 'Ticket #',
      width: '150px',
      nowrap: true,
      truncate: false,
      render: (row) => (
        <code className='text-secondary text-sm'>{row.ticketNo}</code>
      ),
    },
    {
      key: 'subject',
      header: 'Subject',
      flex: 1,
      truncate: true,
      render: (row) => (
        <span className='text-primary-hover leading-snug block' title={row.subject}>
          {row.subject}
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      width: '180px',
      nowrap: true,
      truncate: false,
      render: (row) => (
        <small className='inline-block px-3 py-1 bg-surface-active text-secondary rounded-full whitespace-nowrap'>
          {row.category}
        </small>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '110px',
      nowrap: true,
      truncate: false,
      render: (row) => (
        <StatusBadge status={row.status} />
      ),
    },
    {
      key: 'pipeline',
      header: 'Pipeline',
      width: '120px',
      nowrap: true,
      truncate: false,
      render: (row) => (
        <PipelineStepper status={row.status} />
      ),
    },
    {
      key: 'createAt',
      header: 'Created',
      width: '130px',
      nowrap: true,
      truncate: false,
      align: 'center',
      render: (row) => (
        <small className='text-secondary whitespace-nowrap'>
          {row.createAt ? new Date(row.createAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
        </small>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      width: '180px',
      nowrap: true,
      truncate: false,
      render: (row) => (
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => navigate(`/vendor/ticket/${row.id}`)}
          >
            👁 View
          </Button>
          {row.statusId === 5 && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => {
                setSelectedFeedbackTicket({ id: row.id, ticketNo: row.ticketNo });
                setIsFeedbackModalOpen(true);
              }}
            >
              ★ Feedback
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

      
      <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onNext={nextPage} 
          onPrev={prevPage} 
        />
      <TicketFeedbackModal
        isOpen={isFeedbackModalOpen}
        ticketId={selectedFeedbackTicket?.id}
        ticketNo={selectedFeedbackTicket?.ticketNo}
        onClose={() => {
          setIsFeedbackModalOpen(false);
          setSelectedFeedbackTicket(null);
        }}
      />
    </>
  );
};
