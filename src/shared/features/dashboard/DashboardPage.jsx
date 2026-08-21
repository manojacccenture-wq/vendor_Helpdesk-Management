import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUserProfile, selectUserRole } from '../../../features/user/store/selectors.js';
import { useGetTicketStatusesQuery, useGetCategoriesQuery, useGetPrioritiesQuery } from '../../api/apiSlice.js';
import { useMetricStatusClick } from '../../hooks/useMetricStatusClick.js';
import { TicketMetrics } from '../../components/TicketMetrics.jsx';
import { TicketToolbar } from '../../components/TicketToolbar.jsx';
import { Table } from '../../components/Table.jsx';
import { Pagination } from '../../components/Pagination.jsx';
import { getDashboardConfig } from './dashboardConfig.jsx';
import { useDashboardData } from './hooks/useDashboardData.js';

/**
 * DashboardPage — Single shared Dashboard for Vendor, Helpdesk, and Department.
 *
 * Architecture:
 *   1. Reads the current user's role from Redux.
 *   2. Looks up the role-specific configuration from the registry.
 *   3. Manages shared filter state (statusId, categoryId, priorityFilter, searchTerm).
 *   4. Fetches ticket data via the unified useDashboardData hook.
 *   5. Uses useMetricStatusClick for card-click → status-filter behavior.
 *   6. Renders using shared components (TicketMetrics, TicketToolbar, Table, Pagination)
 *      configured with role-specific data from the config object.
 *
 * No role-based conditionals exist in this component. All role differences
 * are expressed through the configuration object.
 */
export const DashboardPage = () => {
  const navigate = useNavigate();
  const profile = useSelector(selectUserProfile);
  const role = useSelector(selectUserRole);
  const config = getDashboardConfig(role);

  // ─── Filter State ───
  // Each role uses different filter combinations, but the state shape is the same.
  // The default values match what each role's existing Dashboard used.
  const [statusId, setStatusId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  // Helpdesk uses 'all' as default for priority (not '').
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // ─── Modals State ───
  // Vendor: TicketFeedbackModal
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedFeedbackTicket, setSelectedFeedbackTicket] = useState(null);

  // Helpdesk: AssignTicketModal (state managed by the HelpdeskAssignModal component inside config)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedAssignTicket, setSelectedAssignTicket] = useState(null);

  // ─── Build API query params from filter state ───
  // Each role passes different params to the ticket list API.
  // Vendor/Department: statusId + categoryId
  // Helpdesk: statusId + priorityId
  const queryParams = useMemo(() => {
    if (!config) return {};
    return {
      statusId: statusId || undefined,
      categoryId: config.filterTypes.includes('category') ? (categoryId || undefined) : undefined,
      priorityId: config.filterTypes.includes('priority') ? (priorityFilter !== 'all' ? priorityFilter : undefined) : undefined,
    };
  }, [statusId, categoryId, priorityFilter, config]);

  // ─── Data ───
  const data = useDashboardData(queryParams, searchTerm);

  // ─── Metric card click → status filter ───
  const { onCardClick, isActive } = useMetricStatusClick(statusId, setStatusId);

  // ─── Clear filters ───
  const handleClearFilters = () => {
    setStatusId('');
    setCategoryId('');
    setPriorityFilter('all');
    setSearchTerm('');
  };

  // ─── Fetch filter option data ───
  const { data: statusesData = [], isLoading: isLoadingStatuses } = useGetTicketStatusesQuery();
  const { data: categoriesData = [], isLoading: isLoadingCategories } = useGetCategoriesQuery();
  const { data: prioritiesData = [], isLoading: isLoadingPriorities } = useGetPrioritiesQuery();

  // ─── Build filter options for TicketToolbar ───
  const filters = useMemo(() => {
    if (!config) return [];

    const result = [];

    if (config.filterTypes.includes('status')) {
      const coerceValues = config.coerceStatusValues;
      result.push({
        label: 'Status',
        value: statusId,
        onChange: setStatusId,
        isLoading: isLoadingStatuses,
        width: config.filterWidths?.status || 'sm:w-36',
        options: [
          { label: isLoadingStatuses ? 'Loading...' : 'All status', value: '' },
          ...statusesData.map(s => ({
            label: s.text ?? s.Text,
            value: coerceValues ? String(s.value ?? s.Value) : (s.value ?? s.Value),
          })),
        ],
      });
    }

    if (config.filterTypes.includes('category')) {
      result.push({
        label: 'Category',
        value: categoryId,
        onChange: setCategoryId,
        isLoading: isLoadingCategories,
        width: 'sm:w-44',
        options: [
          { label: isLoadingCategories ? 'Loading...' : 'All categories', value: '' },
          ...categoriesData.map(c => ({
            label: c.text ?? c.Text,
            value: c.value ?? c.Value,
          })),
        ],
      });
    }

    if (config.filterTypes.includes('priority')) {
      result.push({
        label: 'Priority',
        value: priorityFilter,
        onChange: setPriorityFilter,
        isLoading: isLoadingPriorities,
        width: 'sm:min-w-[160px]',
        options: [
          { label: isLoadingPriorities ? 'Loading...' : 'All priority', value: 'all' },
          ...prioritiesData.map(p => ({
            label: p.text ?? p.Text,
            value: p.value ?? p.Value,
          })),
        ],
      });
    }

    return result;
  }, [config, statusId, categoryId, priorityFilter, statusesData, categoriesData, prioritiesData, isLoadingStatuses, isLoadingCategories, isLoadingPriorities]);

  // ─── Build metric cards with click/active state ───
  const metrics = useMemo(() => {
    if (!config) return [];

    const cards = config.metricCards.map(card => ({
      ...card,
      value: card.key === 'total'
        ? (config.useCountDataTotal
            ? (data.countData?.total ?? data.countData?.totalCount ?? data.counts.total)
            : data.counts.total)
        : data.counts[card.key] ?? 0,
      onClick: () => onCardClick(card.label),
      active: isActive(card.label),
    }));

    // Append extra metric cards if the config defines them (e.g., SLA overdue for Helpdesk)
    if (config.getExtraMetricCards) {
      const extras = config.getExtraMetricCards();
      for (const card of extras) {
        cards.push({
          ...card,
          value: config.resolveExtraMetricValue(card, data.counts, data.countData),
          onClick: card.key !== 'slaOverdue' ? () => onCardClick(card.label) : undefined,
          active: card.key !== 'slaOverdue' ? isActive(card.label) : false,
        });
      }
    }

    return cards;
  }, [config, data.counts, data.countData, onCardClick, isActive]);

  // ─── Build table columns ───
  const columns = useMemo(() => {
    if (!config?.getColumns) return [];

    const context = {
      onFeedbackClick: (row) => {
        setSelectedFeedbackTicket({ id: row.id, ticketNo: row.ticketNo });
        setIsFeedbackModalOpen(true);
      },
      onAssignClick: (row) => {
        setSelectedAssignTicket(row);
        setIsAssignModalOpen(true);
      },
    };

    return config.getColumns(navigate, context);
  }, [config, navigate]);

  // ─── Build toolbar actions ───
  const toolbarActions = useMemo(() => {
    if (!config?.getToolbarActions) return [];
    return config.getToolbarActions(navigate);
  }, [config, navigate]);

  // ─── Guard: unknown role ───
  if (!config) {
    return (
      <div className='max-w-[1200px] mx-auto px-6 py-8'>
        <div className='bg-surface p-6 rounded-card shadow border border-danger'>
          <p className='text-danger'>Unable to load dashboard.</p>
          <p className='text-secondary mt-3'>Your role does not have a configured dashboard.</p>
        </div>
      </div>
    );
  }

  // ─── Render ───
  return (
    <div className={config.containerClassName || 'py-8'}>

      {/* Role-specific section before metrics (e.g., VendorTabs) */}
      {config.beforeTitle?.()}

      {/* Metric Cards */}
      <TicketMetrics
        metrics={metrics}
        isLoading={data.isLoading}
        isError={data.isError}
      />

      {/* Main Page Title */}
      <h1 className='text-primary mt-8 mb-6'>
        {config.pageTitle}
      </h1>

      {/* Toolbar (Search, Filters, Actions) */}
      <TicketToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        onClearFilters={handleClearFilters}
        actions={toolbarActions}
      />

      {/* Error State */}
      {data.isError ? (
        <div className='w-full bg-surface border border-default rounded-control p-8 text-center'>
          <span className='text-danger'>Failed to load tickets. Please try again.</span>
        </div>
      ) : (
        <>
          {/* Data Table */}
          <Table
            columns={columns}
            data={data.paginatedData}
            rowKey={(row) => row.id}
            isLoading={data.isLoading}
            emptyMessage='No tickets found.'
          />

          {/* Pagination */}
          <Pagination
            currentPage={data.currentPage}
            totalPages={data.totalPages}
            onNext={data.nextPage}
            onPrev={data.prevPage}
            totalItems={data.totalItems}
            itemsPerPage={data.itemsPerPage}
            onItemsPerPageChange={data.setItemsPerPage}
          />
        </>
      )}

      {/* Role-specific Row Action Modals */}
      {config.RowActionModals && config === getDashboardConfig('vendor') && (
        <config.RowActionModals
          isOpen={isFeedbackModalOpen}
          ticketId={selectedFeedbackTicket?.id}
          ticketNo={selectedFeedbackTicket?.ticketNo}
          onClose={() => {
            setIsFeedbackModalOpen(false);
            setSelectedFeedbackTicket(null);
          }}
        />
      )}

      {config.RowActionModals && config === getDashboardConfig('helpdesk') && (
        <config.RowActionModals
          isOpen={isAssignModalOpen}
          ticket={selectedAssignTicket}
          onClose={() => {
            setIsAssignModalOpen(false);
            setSelectedAssignTicket(null);
          }}
          profile={profile}
          role={role}
        />
      )}
    </div>
  );
};

export default DashboardPage;
