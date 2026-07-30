import React from 'react';
import { Search } from 'lucide-react';
import { Select } from '../../../../../shared/components/Select.jsx';
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input 
            type="text" 
            placeholder="Search tickets..." 
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-[6px] border border-[#CBD5E1] bg-white text-[13px] text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0F766E]"
          />
        </div>

        {/* Status Dropdown */}
        <div className="relative w-full sm:w-36">
          <label className="absolute -top-2 left-2 px-1 bg-white text-[10px] font-[600] text-[#94A3B8] uppercase">
            Status
          </label>
          <Select 
            value={statusId}
            onChange={(e) => onStatusChange(e.target.value)}
            options={statusOptions}
            className="w-full h-10 px-3 rounded-[6px] border border-[#CBD5E1] bg-white text-[13px] text-[#1E293B] focus:outline-none focus:border-[#0F766E] appearance-none m-0"
            disabled={isLoadingStatuses}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Category Dropdown */}
        <div className="relative w-full sm:w-44">
          <label className="absolute -top-2 left-2 px-1 bg-white text-[10px] font-[600] text-[#94A3B8] uppercase">
            Category
          </label>
          <Select 
            value={categoryId}
            onChange={(e) => onCategoryChange(e.target.value)}
            options={categoryOptions}
            className="w-full h-10 px-3 rounded-[6px] border border-[#CBD5E1] bg-white text-[13px] text-[#1E293B] focus:outline-none focus:border-[#0F766E] appearance-none m-0"
            disabled={isLoadingCategories}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Clear Filters */}
        <button 
          onClick={onClearFilters}
          className="h-10 px-4 rounded-[6px] border border-[#CBD5E1] bg-white text-[#64748B] text-[13px] font-[500] hover:bg-[#F8FAFC] transition-colors whitespace-nowrap"
        >
          Clear filters
        </button>
      </div>

      {/* Action Right */}
      <button 
        onClick={onRaiseTicket}
        className="w-full sm:w-auto h-10 px-5 rounded-[6px] bg-[#1E293B] text-white text-[13px] font-[500] hover:bg-[#0F172A] transition-colors flex items-center justify-center gap-2"
      >
        <span>+</span> Raise ticket
      </button>

    </div>
  );
};
