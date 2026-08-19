import React from 'react';
import { RoleGuard } from '../../../shared/guards/RoleGuard.jsx';
import { DepartmentLayout } from '../layout/DepartmentLayout.jsx';
import { DepartmentDashboard } from '../features/dashboard/pages/DepartmentDashboard.jsx';
import { TicketDetailsPage } from '../features/tickets/pages/TicketDetailsPage.jsx';
import { TicketCommentsPage } from '../../../shared/components/TicketCommentsPage.jsx';
import { TicketHistoryPage } from '../../../shared/components/TicketHistoryPage.jsx';

export const departmentRoutes = {
  path: 'department',
  element: (
    <RoleGuard requiredRole={['BL1', 'HOD', 'VH', 'MD']} redirectPath="/">
      <DepartmentLayout />
    </RoleGuard>
  ),
  children: [
    {
      index: true,
      element: <DepartmentDashboard />
    },
    {
      path: 'ticket/:id',
      element: (
        <div className="px-6 py-8">
          <TicketDetailsPage />
        </div>
      )
    },
    {
      path: 'ticket/:id/comments',
      element: (
        <div className="px-6 py-8 h-[calc(100vh-64px)]">
          <TicketCommentsPage />
        </div>
      )
    },
    {
      path: 'ticket/:id/history',
      element: (
        <div className="px-6 py-8 h-[calc(100vh-64px)]">
          <TicketHistoryPage backPath="/department" />
        </div>
      )
    }
  ]
};
