import React, { useState } from 'react';
import { HelpdeskMetrics } from '../components/HelpdeskMetrics.jsx';
import { HelpdeskToolbar } from '../../tickets/components/HelpdeskToolbar.jsx';
import { HelpdeskTicketsTable } from '../../tickets/components/HelpdeskTicketsTable.jsx';

export const HelpdeskDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      
      {/* 4 Metric Cards */}
      <HelpdeskMetrics />

      {/* Main Page Title */}
      <h1 className="text-[20px] font-[700] text-[#1E293B] mb-6">
        All Tickets
      </h1>

      {/* Toolbar (Search, Filters, Clear) */}
      <HelpdeskToolbar
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        onSearchChange={setSearchTerm}
        onStatusChange={setStatusFilter}
        onPriorityChange={setPriorityFilter}
        onClearFilters={handleClearFilters}
      />

      {/* Data Table */}
      <HelpdeskTicketsTable
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
      />

    </div>
  );
};
