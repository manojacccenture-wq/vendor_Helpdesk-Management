import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '../../../../../shared/components/Input.jsx';
import { Select } from '../../../../../shared/components/Select.jsx';
import { Button } from '../../../../../shared/components/Button.jsx';

export const HelpdeskToolbar = ({
  searchTerm,
  statusFilter,
  priorityFilter,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onClearFilters,
}) => {
  const statusOptions = [
    { label: 'All status', value: 'all' },
    { label: 'New', value: 'new' },
    { label: 'Open', value: 'open' },
    { label: 'In Progress', value: 'in progress' },
    { label: 'On Hold', value: 'on hold' },
    { label: 'Resolved', value: 'resolved' },
    { label: 'Closed', value: 'closed' },
  ];

  const priorityOptions = [
    { label: 'All priority', value: 'all' },
    { label: 'High', value: 'high' },
    { label: 'Medium', value: 'medium' },
    { label: 'Low', value: 'low' },
    { label: 'Escalate', value: 'escalate' },
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
