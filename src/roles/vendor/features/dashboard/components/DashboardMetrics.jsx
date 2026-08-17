import { useMemo } from 'react';
import { Ticket, CircleDot, Hourglass, Clock, Check, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { TicketMetrics } from '../../../../../shared/components/TicketMetrics.jsx';
import { useGetTicketListQuery } from '../../../../../shared/api/apiSlice.js';
import { selectUserProfile, selectUserRole } from '../../../../../features/user/store/selectors.js';

/**
 * DashboardMetrics — Vendor-specific metrics configuration.
 * Uses the shared TicketMetrics component with Vendor metric cards.
 * Displays all ticket statuses: Total, Open, In Progress, On Hold, Resolved, Closed, Escalated.
 */
export const DashboardMetrics = () => {
  const profile = useSelector(selectUserProfile);
  const role = useSelector(selectUserRole);

  const { data: tickets = [], isLoading, isError } = useGetTicketListQuery({
    userCode: profile?.userCode,
    role,
  }, {
    skip: !profile?.userCode || !role,
  });

  // Derive per-status counts from the ticket list
  const counts = useMemo(() => {
    const result = {
      total: tickets.length,
      open: 0,
      inProgress: 0,
      onHold: 0,
      resolved: 0,
      closed: 0,
      escalated: 0,
    };
    for (const ticket of tickets) {
      const s = (ticket.status || '').toLowerCase();
      if (s === 'open') result.open++;
      else if (s === 'in progress') result.inProgress++;
      else if (s === 'on hold') result.onHold++;
      else if (s === 'resolved') result.resolved++;
      else if (s === 'closed') result.closed++;
      else if (s === 'escalated') result.escalated++;
    }
    return result;
  }, [tickets]);

  const metrics = [
    {
      label: 'Total tickets',
      value: counts.total,
      icon: Ticket,
      iconBg: 'bg-surface-active',
      iconColor: 'text-primary',
    },
    {
      label: 'Open',
      value: counts.open,
      icon: CircleDot,
      iconBg: 'bg-info-soft',
      iconColor: 'text-info',
    },
    {
      label: 'In progress',
      value: counts.inProgress,
      icon: Hourglass,
      iconBg: 'bg-warning-soft',
      iconColor: 'text-warning',
    },
    {
      label: 'On hold',
      value: counts.onHold,
      icon: Clock,
      iconBg: 'bg-secondary-soft',
      iconColor: 'text-secondary',
    },
    {
      label: 'Resolved',
      value: counts.resolved,
      icon: Check,
      iconBg: 'bg-success-soft',
      iconColor: 'text-success',
    },
    {
      label: 'Closed',
      value: counts.closed,
      icon: CheckCircle2,
      iconBg: 'bg-secondary-soft',
      iconColor: 'text-secondary',
    },
    {
      label: 'Escalated',
      value: counts.escalated,
      icon: AlertTriangle,
      iconBg: 'bg-danger-soft',
      iconColor: 'text-danger',
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

export default DashboardMetrics;
