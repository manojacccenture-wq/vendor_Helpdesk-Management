import React from 'react';
import { RoleGuard } from '../../../shared/guards/RoleGuard.jsx';
import { HelpdeskLayout } from '../layout/HelpdeskLayout.jsx';
import { HelpdeskDashboard } from '../features/dashboard/pages/HelpdeskDashboard.jsx';

export const helpdeskRoutes = {
  path: 'helpdesk',
  element: (
    <RoleGuard requiredRole={['L2', 'HelpdeskExecutive']} redirectPath="/">
      <HelpdeskLayout />
    </RoleGuard>
  ),
  children: [
    {
      index: true,
      element: <HelpdeskDashboard />
    }
  ]
};
