import { useMemo, useCallback } from 'react';
import { Ticket, CircleDot, Hourglass, Clock, Check, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { TicketMetrics } from '../../../../../shared/components/TicketMetrics.jsx';
import { useGetTicketCountQuery, useGetTicketListQuery, useGetTicketStatusesQuery } from '../../../../../shared/api/apiSlice.js';
import { selectUserProfile, selectUserRole } from '../../../../../features/user/store/selectors.js';

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

  const { data: statuses = [] } = useGetTicketStatusesQuery();

  // Build a map: lowercase label → status value (string)
  const labelToId = useMemo(() => {
    const map = {};
    for (const s of statuses) {
      const text = (s.text ?? s.Text ?? '').toLowerCase();
      const value = String(s.value ?? s.Value ?? '');
      if (text && value) {
        map[text] = value;
      }
    }
    return map;
  }, [statuses]);

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

  // Click handler: maps label to status ID and updates the filter
  const handleClick = useCallback((label) => {
    if (!onStatusChange) return;
    // "Total tickets" clears the filter
    if (label === 'Total tickets') {
      onStatusChange('');
      return;
    }
    const id = labelToId[label.toLowerCase()];
    if (id) {
      // Toggle: clicking the same card again clears the filter
      onStatusChange(String(statusId) === id ? '' : id);
    }
  }, [onStatusChange, labelToId, statusId]);

  // Check which card is currently active
  const isActive = useCallback((label) => {
    if (statusId === '' || statusId == null) {
      return label === 'Total tickets';
    }
    if (label === 'Total tickets') return false;
    const id = labelToId[label.toLowerCase()];
    return id != null && String(statusId) === id;
  }, [statusId, labelToId]);

  const metrics = [
    {
      label: 'Total tickets',
      value: counts.total,
      icon: Ticket,
      iconBg: 'bg-surface-active',
      iconColor: 'text-primary',
      onClick: () => handleClick('Total tickets'),
      active: isActive('Total tickets'),
    },
    {
      label: 'Open',
      value: counts.open,
      icon: CircleDot,
      iconBg: 'bg-info-soft',
      iconColor: 'text-info',
      onClick: () => handleClick('Open'),
      active: isActive('Open'),
    },
    {
      label: 'In progress',
      value: counts.inProgress,
      icon: Hourglass,
      iconBg: 'bg-warning-soft',
      iconColor: 'text-warning',
      onClick: () => handleClick('In progress'),
      active: isActive('In progress'),
    },
    {
      label: 'On hold',
      value: counts.onHold,
      icon: Clock,
      iconBg: 'bg-secondary-soft',
      iconColor: 'text-secondary',
      onClick: () => handleClick('On hold'),
      active: isActive('On hold'),
    },
    {
      label: 'Resolved',
      value: counts.resolved,
      icon: Check,
      iconBg: 'bg-success-soft',
      iconColor: 'text-success',
      onClick: () => handleClick('Resolved'),
      active: isActive('Resolved'),
    },
    {
      label: 'Closed',
      value: counts.closed,
      icon: CheckCircle2,
      iconBg: 'bg-secondary-soft',
      iconColor: 'text-secondary',
      onClick: () => handleClick('Closed'),
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
