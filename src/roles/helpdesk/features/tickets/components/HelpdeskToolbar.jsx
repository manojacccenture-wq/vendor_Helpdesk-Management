import { TicketToolbar } from '../../../../../shared/components/TicketToolbar.jsx';
import { useGetTicketStatusesQuery, useGetPrioritiesQuery } from '../../../../../shared/api/apiSlice.js';

/**
 * HelpdeskToolbar — Helpdesk-specific toolbar configuration.
 * Uses the shared TicketToolbar with Status and Priority filters.
 */
export const HelpdeskToolbar = ({
  searchTerm,
  statusFilter,
  priorityFilter,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onClearFilters,
}) => {
  const { data: statuses = [], isLoading: isLoadingStatuses } = useGetTicketStatusesQuery();
  const { data: priorities = [], isLoading: isLoadingPriorities } = useGetPrioritiesQuery();

  const statusOptions = [
    { label: isLoadingStatuses ? 'Loading...' : 'All status', value: 'all' },
    ...statuses.map(s => ({ label: s.text ?? s.Text, value: s.value ?? s.Value }))
  ];

  const priorityOptions = [
    { label: isLoadingPriorities ? 'Loading...' : 'All priority', value: 'all' },
    ...priorities.map(p => ({ label: p.text ?? p.Text, value: p.value ?? p.Value }))
  ];

  const filters = [
    {
      label: 'Status',
      value: statusFilter,
      onChange: onStatusChange,
      options: statusOptions,
      isLoading: isLoadingStatuses,
      width: 'sm:min-w-[160px]',
    },
    {
      label: 'Priority',
      value: priorityFilter,
      onChange: onPriorityChange,
      options: priorityOptions,
      isLoading: isLoadingPriorities,
      width: 'sm:min-w-[160px]',
    },
  ];

  return (
    <TicketToolbar
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      filters={filters}
      onClearFilters={onClearFilters}
    />
  );
};

export default HelpdeskToolbar;
