import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '../../../../../shared/components/Input.jsx';
import { Select } from '../../../../../shared/components/Select.jsx';
import { Button } from '../../../../../shared/components/Button.jsx';
import { useGetTicketStatusesQuery, useGetCategoriesQuery } from '../../../../../shared/api/apiSlice.js';

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

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
      
      {/* Filters Left */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted z-10" />
          <Input 
            type="text" 
            placeholder="Search tickets..." 
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status Dropdown */}
        <div className="relative w-full sm:w-36">
          <Select 
            value={statusId}
            onChange={(e) => onStatusChange(e.target.value)}
            options={statusOptions}
            disabled={isLoadingStatuses}
          />
        </div>

        {/* Category Dropdown */}
        <div className="relative w-full sm:w-44">
          <Select 
            value={categoryId}
            onChange={(e) => onCategoryChange(e.target.value)}
            options={categoryOptions}
            disabled={isLoadingCategories}
          />
        </div>

        {/* Clear Filters */}
        <Button 
          variant="ghost"
          onClick={onClearFilters}
          className="whitespace-nowrap"
        >
          Clear filters
        </Button>
      </div>

      {/* Action Right */}
      <Button 
        variant="primary"
        onClick={onRaiseTicket}
        className="w-full sm:w-auto bg-primary"
      >
        <span>+</span> Raise ticket
      </Button>

    </div>
  );
};
