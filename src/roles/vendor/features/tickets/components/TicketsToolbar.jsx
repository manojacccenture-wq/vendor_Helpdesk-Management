import { TicketToolbar } from '../../../../../shared/components/TicketToolbar.jsx';
import { useGetTicketStatusesQuery, useGetCategoriesQuery } from '../../../../../shared/api/apiSlice.js';

/**
 * TicketsToolbar — Vendor-specific toolbar configuration.
 * Uses the shared TicketToolbar with Status and Category filters + Raise Ticket action.
 */
export const TicketsToolbar = ({ 
  statusId, 
  categoryId, 
  searchTerm, 
  onStatusChange, 
  onCategoryChange, 
  onSearchChange, 
  onClearFilters, 
  onRaiseTicket 
}) => {
  const { data: statuses = [], isLoading: isLoadingStatuses } = useGetTicketStatusesQuery();
  const { data: categories = [], isLoading: isLoadingCategories } = useGetCategoriesQuery();

  const statusOptions = [
    { label: isLoadingStatuses ? 'Loading...' : 'All status', value: '' },
    ...statuses.map(s => ({ label: s.text ?? s.Text, value: s.value ?? s.Value }))
  ];

  const categoryOptions = [
    { label: isLoadingCategories ? 'Loading...' : 'All categories', value: '' },
    ...categories.map(c => ({ label: c.text ?? c.Text, value: c.value ?? c.Value }))
  ];

  const filters = [
    {
      label: 'Status',
      value: statusId,
      onChange: onStatusChange,
      options: statusOptions,
      isLoading: isLoadingStatuses,
      width: 'sm:w-36',
    },
    {
      label: 'Category',
      value: categoryId,
      onChange: onCategoryChange,
      options: categoryOptions,
      isLoading: isLoadingCategories,
      width: 'sm:w-44',
    },
  ];

  const actions = [
    {
      label: '+ Raise ticket',
      onClick: onRaiseTicket,
      variant: 'primary',
      className: 'bg-primary',
    },
  ];

  return (
    <TicketToolbar
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      filters={filters}
      onClearFilters={onClearFilters}
      actions={actions}
    />
  );
};

export default TicketsToolbar;
