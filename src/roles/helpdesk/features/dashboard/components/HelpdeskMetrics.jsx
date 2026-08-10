import { Ticket, Hourglass, Check, AlertTriangle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { TicketMetrics } from '../../../../../shared/components/TicketMetrics.jsx';
import { useGetTicketCountQuery } from '../../../../../shared/api/apiSlice.js';
import { selectUserProfile, selectUserRole } from '../../../../../features/user/store/selectors.js';

/**
 * HelpdeskMetrics — Helpdesk-specific metrics configuration.
 * Uses the shared TicketMetrics component with Helpdesk metric cards.
 */
export const HelpdeskMetrics = () => {
  const profile = useSelector(selectUserProfile);
  const role = useSelector(selectUserRole);
  const { data, isLoading, isError } = useGetTicketCountQuery({ role, userCode: profile?.userCode }, {
    skip: !profile?.userCode || !role
  });

  const metrics = [
    {
      label: 'New tickets',
      value: data?.totalCount,
      icon: Ticket,
      iconBg: 'bg-surface-active',
      iconColor: 'text-primary',
    },
    {
      label: 'In progress',
      value: data?.inProgress,
      icon: Hourglass,
      iconBg: 'bg-warning-soft',
      iconColor: 'text-warning',
    },
    {
      label: 'Resolved',
      value: data?.resolved,
      icon: Check,
      iconBg: 'bg-success-soft',
      iconColor: 'text-success',
    },
    {
      label: 'SLA overdue',
      value: data?.slaOverdue ?? data?.overdue,
      icon: AlertTriangle,
      iconBg: 'bg-surface/50',
      iconColor: 'text-warning',
      valueColor: 'text-warning',
      labelColor: 'text-warning',
      cardClassName: 'bg-warning-soft',
    },
  ];

  return (
    <TicketMetrics
      metrics={metrics}
      isLoading={isLoading}
      isError={isError}
    />
  );
};

export default HelpdeskMetrics;
