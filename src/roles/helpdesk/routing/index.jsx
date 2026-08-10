import { RoleGuard } from '../../../shared/guards/RoleGuard.jsx';
import { HelpdeskLayout } from '../layout/HelpdeskLayout.jsx';
import { HelpdeskDashboard } from '../features/dashboard/pages/HelpdeskDashboard.jsx';
import { HelpdeskTicketView } from '../features/tickets/pages/HelpdeskTicketView.jsx';
import { TicketCommentsPage } from '../../../shared/components/TicketCommentsPage.jsx';

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
    },
    {
      path: 'ticket/:id',
      element: (
        <div className="px-6 py-8">
          <HelpdeskTicketView />
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
    }
  ]
};
