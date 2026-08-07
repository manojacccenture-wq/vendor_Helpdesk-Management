import React from 'react';
import { Ticket, Hourglass, Check, AlertCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Card } from '../../../../../shared/components/Card.jsx';
import { useGetTicketCountQuery } from '../../../../../shared/api/apiSlice.js';
import { selectUserProfile, selectUserRole } from '../../../../../features/user/store/selectors.js';

export const DashboardMetrics = () => {
  const profile = useSelector(selectUserProfile);
  const role = useSelector(selectUserRole);
  const { data, isLoading, isError } = useGetTicketCountQuery({ role, userCode: profile?.userCode }, {
    skip: !profile?.userCode || !role
  });

  if (isError) {
    return (
      <div className="flex items-center gap-2 text-danger bg-danger-soft p-4 rounded-card mb-8 shadow-sm">
        <AlertCircle className="w-5 h-5" />
        <span className="sectionLabelClassName">Failed to load ticket metrics. Please try again.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      
      <Card className="flex-1 p-6 rounded-card shadow-sm flex items-center justify-between">
        <div>
          <p className="text-secondary sectionLabelClassName mb-1">Total tickets</p>
          <h2 className="text-primary metricValueClassName">
            {isLoading ? '...' : data?.totalCount ?? 0}
          </h2>
        </div>
        <div className="w-12 h-12 rounded-control bg-surface-active flex items-center justify-center">
          <Ticket className="w-6 h-6 text-primary" />
        </div>
      </Card>

      <Card className="flex-1 p-6 rounded-card shadow-sm flex items-center justify-between">
        <div>
          <p className="text-secondary sectionLabelClassName mb-1">In progress</p>
          <h2 className="text-primary metricValueClassName">
            {isLoading ? '...' : data?.inProgress ?? 0}
          </h2>
        </div>
        <div className="w-12 h-12 rounded-control bg-warning-soft flex items-center justify-center">
          <Hourglass className="w-6 h-6 text-warning" />
        </div>
      </Card>

      <Card className="flex-1 p-6 rounded-card shadow-sm flex items-center justify-between">
        <div>
          <p className="text-secondary sectionLabelClassName mb-1">Resolved</p>
          <h2 className="text-primary metricValueClassName">
            {isLoading ? '...' : data?.resolved ?? 0}
          </h2>
        </div>
        <div className="w-12 h-12 rounded-control bg-success-soft flex items-center justify-center">
          <Check className="w-6 h-6 text-success" />
        </div>
      </Card>

    </div>
  );
};
