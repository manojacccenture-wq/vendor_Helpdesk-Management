import React from 'react';
import { RoleGuard } from '../../../shared/guards/RoleGuard.jsx';
import { DepartmentLayout } from '../layout/DepartmentLayout.jsx';

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
      async lazy() {
        const { DashboardPage } = await import('../../../shared/features/dashboard/DashboardPage.jsx');
        return { Component: DashboardPage };
      }
    },
    {
      path: 'ticket/:id',
      async lazy() {
        const { TicketDetailsPage } = await import('../features/tickets/pages/TicketDetailsPage.jsx');
        const Component = () => (
          <div className="px-6 py-8">
            <TicketDetailsPage />
          </div>
        );
        return { Component };
      }
    },
    {
      path: 'ticket/:id/comments',
      async lazy() {
        const { TicketCommentsPage } = await import('../../../shared/components/TicketCommentsPage.jsx');
        const Component = () => (
          <div className="px-6 py-8 h-[calc(100vh-64px)]">
            <TicketCommentsPage />
          </div>
        );
        return { Component };
      }
    },
    {
      path: 'ticket/:id/history',
      async lazy() {
        const { TicketHistoryPage } = await import('../../../shared/components/TicketHistoryPage.jsx');
        const Component = () => (
          <div className="px-6 py-8 h-[calc(100vh-64px)]">
            <TicketHistoryPage backPath="/department" />
          </div>
        );
        return { Component };
      }
    }
  ]
};
