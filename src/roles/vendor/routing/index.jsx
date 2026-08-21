import { RoleGuard } from '../../../shared/guards/RoleGuard.jsx';
import { VendorLayout } from '../layout/VendorLayout.jsx';

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
      async lazy() {
        const { DashboardPage } = await import('../../../shared/features/dashboard/DashboardPage.jsx');
        return { Component: DashboardPage };
      }
    },
    {
      path: 'create',
      async lazy() {
        const { CreateVendorTicketPage } = await import('../features/tickets/pages/CreateVendorTicketPage.jsx');
        const Component = () => (
          <div className="py-8">
            <CreateVendorTicketPage />
          </div>
        );
        return { Component };
      }
    },
    {
      path: 'ticket/:id',
      async lazy() {
        const { TicketDetailsPage } = await import('../features/tickets/pages/TicketDetailsPage.jsx');
        const Component = () => (
          <div className="py-8">
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
          <div className="py-8 h-[calc(100vh-64px)]">
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
          <div className="py-8 h-[calc(100vh-64px)]">
            <TicketHistoryPage backPath="/vendor" />
          </div>
        );
        return { Component };
      }
    }
  ]
};
