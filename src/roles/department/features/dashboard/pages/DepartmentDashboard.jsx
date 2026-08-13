import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Ticket, Hourglass, Check } from 'lucide-react';
import { TicketMetrics } from '../../../../../shared/components/TicketMetrics.jsx';
import { TicketToolbar } from '../../../../../shared/components/TicketToolbar.jsx';
import { Table } from '../../../../../shared/components/Table.jsx';
import { StatusBadge } from '../../../../../shared/components/StatusBadge.jsx';
import { Button } from '../../../../../shared/components/Button.jsx';
import { PipelineStepper } from '../../../../vendor/features/tickets/components/PipelineStepper.jsx';
import { 
  useGetTicketListQuery, 
  useGetTicketCountQuery,
  useGetTicketStatusesQuery,
  useGetCategoriesQuery
} from '../../../../../shared/api/apiSlice.js';
import { selectUserProfile, selectUserRole } from '../../../../../features/user/store/selectors.js';

export const DepartmentDashboard = () => {
  const navigate = useNavigate();
  const profile = useSelector(selectUserProfile);
  const role = useSelector(selectUserRole);

  const [statusId, setStatusId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // ─── Fetch Data ───
  // For BL1, we rely on the backend to filter tickets by the user's mapped department
  // using role="BL1" and their userCode.
  const { data: metricsData, isLoading: isLoadingMetrics, isError: isErrorMetrics } = useGetTicketCountQuery({ 
    role, userCode: profile?.userCode 
  }, { skip: !profile?.userCode || !role });

  const { data: tickets = [], isLoading: isLoadingTickets, isError: isErrorTickets } = useGetTicketListQuery({
    role, userCode: profile?.userCode, statusId, categoryId
  }, { skip: !profile?.userCode || !role });

  const { data: statusesData } = useGetTicketStatusesQuery();
  const { data: categoriesData } = useGetCategoriesQuery();

  // ─── Metrics Config ───
  const metrics = [
    { label: 'Total tickets', value: metricsData?.totalCount, icon: Ticket, iconBg: 'bg-surface-active', iconColor: 'text-primary' },
    { label: 'In progress', value: metricsData?.inProgress, icon: Hourglass, iconBg: 'bg-warning-soft', iconColor: 'text-warning' },
    { label: 'Resolved', value: metricsData?.resolved, icon: Check, iconBg: 'bg-success-soft', iconColor: 'text-success' },
  ];

  // ─── Filters Config ───
  const statusOptions = [
    { label: 'All status', value: '' }, 
    ...(statusesData?.map(s => ({ label: s.statusName, value: s.id })) || [])
  ];
  const categoryOptions = [
    { label: 'All categories', value: '' }, 
    ...(categoriesData?.map(c => ({ label: c.categoryName, value: c.id })) || [])
  ];

  const filters = [
    { value: statusId, onChange: setStatusId, options: statusOptions },
    { value: categoryId, onChange: setCategoryId, options: categoryOptions }
  ];

  const handleClearFilters = () => {
    setStatusId('');
    setCategoryId('');
    setSearchTerm('');
  };

  // ─── Table Search & Columns ───
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      if (!searchTerm) return true;
      const lowerSearch = searchTerm.toLowerCase();
      return (ticket.subject?.toLowerCase().includes(lowerSearch) || ticket.ticketNo?.toLowerCase().includes(lowerSearch));
    });
  }, [tickets, searchTerm]);

  const columns = useMemo(() => [
    {
      key: 'ticketNo', header: 'Ticket #', width: '150px',
      render: (row) => <code className='text-secondary text-sm'>{row.ticketNo}</code>,
    },
    {
      key: 'subject', header: 'Subject', flex: 1, truncate: true,
      render: (row) => <span className='text-primary-hover leading-snug block' title={row.subject}>{row.subject}</span>,
    },
    {
      key: 'category', header: 'Category', width: '180px',
      render: (row) => <small className='inline-block px-3 py-1 bg-surface-active text-secondary rounded-full whitespace-nowrap'>{row.category}</small>,
    },
    {
      key: 'status', header: 'Status', width: '110px',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'pipeline', header: 'Pipeline', width: '120px',
      render: (row) => <PipelineStepper status={row.status} />
    },
    {
      key: 'createAt', header: 'Created', width: '130px', align: 'center',
      render: (row) => <small className='text-secondary whitespace-nowrap'>{row.createAt ? new Date(row.createAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</small>,
    },
    {
      key: 'actions', header: 'Action', width: '100px',
      render: (row) => (
        <Button variant='ghost' size='sm' onClick={() => navigate(`/department/ticket/${row.id}`)}>
          👁 View
        </Button>
      ),
    },
  ], [navigate]);

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      {/* 3 Metric Cards */}
      <TicketMetrics metrics={metrics} isLoading={isLoadingMetrics} isError={isErrorMetrics} />
      
      {/* Main Page Title */}
      <h1 className="text-primary mt-8 mb-6">
        My Department Tickets
      </h1>

      {/* Toolbar (Search, Filters) */}
      <TicketToolbar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        onClearFilters={handleClearFilters}
      />

      {/* Data Table */}
      {isErrorTickets ? (
        <div className='w-full bg-surface border border-default rounded-control p-8 text-center'>
          <span className='text-danger'>Failed to load tickets. Please try again.</span>
        </div>
      ) : (
        <Table
          columns={columns}
          data={filteredTickets}
          rowKey={(row) => row.id}
          isLoading={isLoadingTickets}
          emptyMessage='No tickets found.'
        />
      )}
    </div>
  );
};

export default DepartmentDashboard;
