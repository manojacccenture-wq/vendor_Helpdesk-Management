import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardMetrics } from '../components/DashboardMetrics.jsx';
import { VendorTabs } from '../components/VendorTabs.jsx';
import { TicketsToolbar } from '../../tickets/components/TicketsToolbar.jsx';
import { TicketsTable } from '../../tickets/components/TicketsTable.jsx';

export const VendorDashboard = () => {
  const navigate = useNavigate();

  const [statusId, setStatusId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleRaiseTicket = () => {
    navigate('/vendor/create');
  };

  const handleClearFilters = () => {
    setStatusId('');
    setCategoryId('');
    setSearchTerm('');
  };

  return (
    <div className="py-8">

      {/* 3 Metric Cards */}
      <DashboardMetrics statusId={statusId} onStatusChange={setStatusId} />

      {/* Navigation Tabs (MY TICKETS, CREATE TICKET, PROFILE) */}
      <VendorTabs />

      {/* Main Page Title */}
      <h1 className="text-primary mb-6">
        My Tickets
      </h1>

      {/* Toolbar (Search, Filters, Button) */}
      <TicketsToolbar
        statusId={statusId}
        categoryId={categoryId}
        searchTerm={searchTerm}
        onStatusChange={setStatusId}
        onCategoryChange={setCategoryId}
        onSearchChange={setSearchTerm}
        onClearFilters={handleClearFilters}
        onRaiseTicket={handleRaiseTicket}
      />

      {/* Data Table */}
      <TicketsTable
        statusId={statusId}
        categoryId={categoryId}
        searchTerm={searchTerm}
      />

    </div>
  );
};
