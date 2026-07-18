import React from 'react';
import { Outlet } from 'react-router-dom';
import { RoleGuard } from '../../../shared/guards/RoleGuard.jsx';
import { VendorLayout } from '../layout/VendorLayout.jsx';
import { VendorDashboard } from '../features/dashboard/pages/VendorDashboard.jsx';
import { CreateVendorTicketPage } from '../features/tickets/pages/CreateVendorTicketPage.jsx';

export const vendorRoutes = {
  path: 'vendor',
  element: (
    <RoleGuard requiredRole="L1" redirectPath="/">
      <VendorLayout />
    </RoleGuard>
  ),
  children: [
    {
      index: true,
      element: <VendorDashboard />
    },
    {
      path: 'create',
      element: (
        <div className="px-6 py-8">
          <CreateVendorTicketPage />
        </div>
      )
    }
  ]
};
