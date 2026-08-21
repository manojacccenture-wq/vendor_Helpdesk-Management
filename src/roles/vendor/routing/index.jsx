import { RoleGuard } from '../../../shared/guards/RoleGuard.jsx';
import { VendorLayout } from '../layout/VendorLayout.jsx';
import { VendorDashboard } from '../features/dashboard/pages/VendorDashboard.jsx';
import { CreateVendorTicketPage } from '../features/tickets/pages/CreateVendorTicketPage.jsx';
import { TicketDetailsPage } from '../features/tickets/pages/TicketDetailsPage.jsx';
import { TicketCommentsPage } from '../../../shared/components/TicketCommentsPage.jsx';
import { TicketHistoryPage } from '../../../shared/components/TicketHistoryPage.jsx';

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
        <div className="py-8">
          <CreateVendorTicketPage />
        </div>
      )
    },
    {
      path: 'ticket/:id',
      element: (
        <div className="py-8">
          <TicketDetailsPage />
        </div>
      )
    },
    {
      path: 'ticket/:id/comments',
      element: (
        <div className="py-8 h-[calc(100vh-64px)]">
          <TicketCommentsPage />
        </div>
      )
    },
    {
      path: 'ticket/:id/history',
      element: (
        <div className="py-8 h-[calc(100vh-64px)]">
          <TicketHistoryPage backPath="/vendor" />
        </div>
      )
    }
  ]
};
