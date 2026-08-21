import { useMemo, useCallback } from 'react';
import { Ticket, CircleDot, Hourglass, Clock, Check, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { TicketMetrics } from '../../../../../shared/components/TicketMetrics.jsx';
import { useGetTicketCountQuery, useGetTicketListQuery } from '../../../../../shared/api/apiSlice.js';
import { selectUserProfile, selectUserRole } from '../../../../../features/user/store/selectors.js';
import { useMetricStatusClick } from '../../../../../shared/hooks/useMetricStatusClick.js';

/**
 * DashboardMetrics — Vendor-specific metrics configuration.
 * Uses the shared TicketMetrics component with Vendor metric cards.
 * Displays all ticket statuses: Total, Open, In Progress, On Hold, Resolved, Closed, Escalated.
 *
 * @param {Object} props
 * @param {string|number} props.statusId - Current active status filter (empty string = all)
 * @param {Function} props.onStatusChange - Callback to update the status filter
 */
export const DashboardMetrics = ({ statusId = '', onStatusChange }) => {
  const profile = useSelector(selectUserProfile);
  const role = useSelector(selectUserRole);

  const { data: countData, isLoading, isError } = useGetTicketCountQuery({ role, userCode: profile?.userCode }, {
    skip: !profile?.userCode || !role,
  });

  const { data: tickets = [] } = useGetTicketListQuery({
    userCode: profile?.userCode,
    role,
  }, {
    skip: !profile?.userCode || !role,
  });

  const { onCardClick, isActive } = useMetricStatusClick(statusId, onStatusChange);

  // Derive per-status counts from the ticket list
  const counts = useMemo(() => {
    const result = {
      total: countData?.total ?? countData?.totalCount ?? tickets.length,
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
  }, [tickets, countData]);

  const metrics = [
    {
      label: 'Total tickets',
      value: counts.total,
      icon: Ticket,
      iconBg: 'bg-surface-active',
      iconColor: 'text-primary',
      onClick: () => onCardClick('Total tickets'),
      active: isActive('Total tickets'),
    },
    {
      label: 'Open',
      value: counts.open,
      icon: CircleDot,
      iconBg: 'bg-info-soft',
      iconColor: 'text-info',
      onClick: () => onCardClick('Open'),
      active: isActive('Open'),
    },
    {
      label: 'In progress',
      value: counts.inProgress,
      icon: Hourglass,
      iconBg: 'bg-warning-soft',
      iconColor: 'text-warning',
      onClick: () => onCardClick('In progress'),
      active: isActive('In progress'),
    },
    {
      label: 'On hold',
      value: counts.onHold,
      icon: Clock,
      iconBg: 'bg-secondary-soft',
      iconColor: 'text-secondary',
      onClick: () => onCardClick('On hold'),
      active: isActive('On hold'),
    },
    {
      label: 'Resolved',
      value: counts.resolved,
      icon: Check,
      iconBg: 'bg-success-soft',
      iconColor: 'text-success',
      onClick: () => onCardClick('Resolved'),
      active: isActive('Resolved'),
    },
    {
      label: 'Closed',
      value: counts.closed,
      icon: CheckCircle2,
      iconBg: 'bg-secondary-soft',
      iconColor: 'text-secondary',
      onClick: () => onCardClick('Closed'),
      active: isActive('Closed'),
    },
    {
      label: 'Escalated',
      value: counts.escalated,
      icon: AlertTriangle,
      iconBg: 'bg-danger-soft',
      iconColor: 'text-danger',
      onClick: () => handleClick('Escalated'),
      active: isActive('Escalated'),
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
