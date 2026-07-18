import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardMetrics } from '../components/DashboardMetrics.jsx';
import { VendorTabs } from '../components/VendorTabs.jsx';
import { TicketsToolbar } from '../../tickets/components/TicketsToolbar.jsx';
import { TicketsTable } from '../../tickets/components/TicketsTable.jsx';

export const VendorDashboard = () => {
  const navigate = useNavigate();

  const handleRaiseTicket = () => {
    navigate('/vendor/create');
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      
      {/* 3 Metric Cards */}
      <DashboardMetrics />
      
      {/* Navigation Tabs (MY TICKETS, CREATE TICKET, PROFILE) */}
      <VendorTabs />

      {/* Main Page Title */}
      <h1 className="text-[20px] font-[700] text-[#1E293B] mb-6">
        My Tickets
      </h1>

      {/* Toolbar (Search, Filters, Button) */}
      <TicketsToolbar onRaiseTicket={handleRaiseTicket} />

      {/* Data Table */}
      <TicketsTable />

    </div>
  );
};
