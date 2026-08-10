import { Ticket, Hourglass, Check } from 'lucide-react';
import { useSelector } from 'react-redux';
import { TicketMetrics } from '../../../../../shared/components/TicketMetrics.jsx';
import { useGetTicketCountQuery } from '../../../../../shared/api/apiSlice.js';
import { selectUserProfile, selectUserRole } from '../../../../../features/user/store/selectors.js';

/**
 * DashboardMetrics — Vendor-specific metrics configuration.
 * Uses the shared TicketMetrics component with Vendor metric cards.
 */
export const DashboardMetrics = () => {
  const profile = useSelector(selectUserProfile);
  const role = useSelector(selectUserRole);
  const { data, isLoading, isError } = useGetTicketCountQuery({ role, userCode: profile?.userCode }, {
    skip: !profile?.userCode || !role
  });

  const metrics = [
    {
      label: 'Total tickets',
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
