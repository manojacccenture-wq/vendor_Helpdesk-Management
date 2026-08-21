import { RoleGuard } from '../../../shared/guards/RoleGuard.jsx';
import { HelpdeskLayout } from '../layout/HelpdeskLayout.jsx';

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
      async lazy() {
        const { DashboardPage } = await import('../../../shared/features/dashboard/DashboardPage.jsx');
        return { Component: DashboardPage };
      }
    },
    {
      path: 'ticket/:id',
      async lazy() {
        const { HelpdeskTicketView } = await import('../features/tickets/pages/HelpdeskTicketView.jsx');
        const Component = () => (
          <div className="px-6 py-8">
            <HelpdeskTicketView />
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
            <TicketHistoryPage backPath="/helpdesk" />
          </div>
        );
        return { Component };
      }
    }
  ]
};
