import React from 'react';
import { Search } from 'lucide-react';
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
        <input
          type="text"
          placeholder="Search tickets..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-10 pl-10 pr-4 border border-[#E2E8F0] rounded-[6px] text-[14px] text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent"
        />
      </div>

      {/* Status Filter */}
      <div className="w-full sm:w-auto sm:min-w-[160px]">
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          disabled={isLoadingStatuses}
          className="w-full h-10 px-4 border border-[#E2E8F0] rounded-[6px] text-[14px] text-[#1E293B] bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Priority Filter */}
      <div className="w-full sm:w-auto sm:min-w-[160px]">
        <select
          value={priorityFilter}
          onChange={(e) => onPriorityChange(e.target.value)}
          disabled={isLoadingPriorities}
          className="w-full h-10 px-4 border border-[#E2E8F0] rounded-[6px] text-[14px] text-[#1E293B] bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent"
        >
          {priorityOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters Button */}
      <button
        onClick={onClearFilters}
        className="h-10 px-4 rounded-[6px] border border-[#CBD5E1] bg-white text-[#64748B] text-[13px] font-[500] hover:bg-[#F8FAFC] transition-colors whitespace-nowrap"
      >
        Clear filters
      </button>

    </div>
  );
};
