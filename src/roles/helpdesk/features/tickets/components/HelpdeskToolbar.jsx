import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '../../../../../shared/components/Input.jsx';
import { Select } from '../../../../../shared/components/Select.jsx';
import { Button } from '../../../../../shared/components/Button.jsx';
import { useGetTicketStatusesQuery, useGetPrioritiesQuery } from '../../../../../shared/api/apiSlice.js';

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

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
      
      {/* Search Input */}
      <div className="relative flex-1 w-full sm:w-auto sm:min-w-[280px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary z-10" />
        <Input
          type="text"
          placeholder="Search tickets..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Status Filter */}
      <div className="w-full sm:w-auto sm:min-w-[160px]">
        <Select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          options={statusOptions}
          disabled={isLoadingStatuses}
        />
      </div>

      {/* Priority Filter */}
      <div className="w-full sm:w-auto sm:min-w-[160px]">
        <Select
          value={priorityFilter}
          onChange={(e) => onPriorityChange(e.target.value)}
          options={priorityOptions}
          disabled={isLoadingPriorities}
        />
      </div>

      {/* Clear Filters Button */}
      <Button
        variant="ghost"
        onClick={onClearFilters}
        className="whitespace-nowrap"
      >
        Clear filters
      </Button>

    </div>
  );
};
