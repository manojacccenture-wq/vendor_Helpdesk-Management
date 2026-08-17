import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button.jsx';

/**
 * TicketFooter — Status action buttons for department roles + Back to Dashboard.
 */
export const TicketFooter = ({
  isDepartmentRole,
  onStatusAction,
  isUpdatingStatus,
  isLoadingStatuses,
  ticketStatuses = [],
  backPath,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center py-4">
      <div className="flex-1">
        {isDepartmentRole && (
          <div className="flex flex-wrap gap-2">
            <Button
              className="bg-priority-medium text-priority-medium-text hover:opacity-90"
              onClick={() => onStatusAction('On Hold')}
              disabled={isUpdatingStatus || isLoadingStatuses}
            >
              Put on hold
            </Button>
            <Button
              className="bg-info text-white hover:opacity-90"
              onClick={() => onStatusAction('Resolved')}
              disabled={isUpdatingStatus || isLoadingStatuses}
            >
              Resolved
            </Button>
            {ticketStatuses.some(s => {
              const txt = (s.text ?? s.Text)?.toLowerCase();
              return txt === 'cancel' || txt === 'cancelled';
            }) && (
              <Button
                className="bg-priority-escalate text-priority-escalate-text hover:opacity-90"
                onClick={() => {
                  const cancelStr = ticketStatuses.find(s => {
                    const txt = (s.text ?? s.Text)?.toLowerCase();
                    return txt === 'cancel' || txt === 'cancelled';
                  });
                  onStatusAction(cancelStr?.text ?? cancelStr?.Text);
                }}
                disabled={isUpdatingStatus || isLoadingStatuses}
              >
                Cancel
              </Button>
            )}
          </div>
        )}
      </div>
      <Button variant="black" onClick={() => navigate(backPath)} className="ml-4">
        Back to Dashboard
      </Button>
    </div>
  );
};
