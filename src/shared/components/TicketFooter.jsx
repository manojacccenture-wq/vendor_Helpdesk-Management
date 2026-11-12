import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Forward } from 'lucide-react';
import { Button } from './Button.jsx';
import { ForwardTicketModal } from './ForwardTicketModal.jsx';
import { selectUserRole } from '../../features/user/store/selectors.js';

/**
 * Roles allowed to forward a ticket.
 * Strict allowlist — any other role (including unknown/null) hides the button.
 */
const FORWARD_ALLOWED_ROLES = ['BL1', 'HOD'];

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
  ticketId,
  ticketDetails,
  permissions = {},
}) => {
  const navigate = useNavigate();
  const role = useSelector(selectUserRole);
  const [isForwardOpen, setIsForwardOpen] = useState(false);

  // Backend flag is authoritative; the role allowlist remains only as a fallback
  // for responses that do not include `canForward`.
  const canForward = permissions.canForward ?? FORWARD_ALLOWED_ROLES.includes(role);

  const isBaseDisabled = isUpdatingStatus || isLoadingStatuses;
  const isOnHoldDisabled = isBaseDisabled || ticketDetails?.isOnHold === true;
  const isResolvedDisabled = isBaseDisabled || ticketDetails?.isResolved === true;
  const isForwardDisabled = isBaseDisabled || ticketDetails?.isForwarded === true;

  return (
    <>
      <div className="flex justify-between items-center py-4">
        <div className="flex-1">
          {isDepartmentRole && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="primary"
                onClick={() => onStatusAction('On Hold')}
                disabled={isOnHoldDisabled}
                title={ticketDetails?.isOnHold ? 'Ticket is currently on hold' : undefined}
              >
                Put on hold
              </Button>
              <Button
                variant="info"
                onClick={() => onStatusAction('Resolved')}
                disabled={isResolvedDisabled}
                title={ticketDetails?.isResolved ? 'Ticket has already been resolved' : undefined}
              >
                Resolved
              </Button>
              {canForward && (
                <Button
                  variant="forward"
                  className="flex items-center gap-1.5"
                  onClick={() => setIsForwardOpen(true)}
                  disabled={isForwardDisabled}
                  title={ticketDetails?.isForwarded ? 'Ticket has already been forwarded' : undefined}
                >
                  <Forward className="w-4 h-4" />
                  Forward
                </Button>
              )}
              {ticketStatuses.some(s => {
                const txt = (s.text ?? s.Text)?.toLowerCase();
                return txt === 'cancel' || txt === 'cancelled';
              }) && (
                <Button
                  variant="danger"
                  onClick={() => {
                    const cancelStr = ticketStatuses.find(s => {
                      const txt = (s.text ?? s.Text)?.toLowerCase();
                      return txt === 'cancel' || txt === 'cancelled';
                    });
                    onStatusAction(cancelStr?.text ?? cancelStr?.Text);
                  }}
                  disabled={isBaseDisabled}
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

      {/* Forward Ticket Modal — mounted only while open so its query and state are scoped to one open */}
      {canForward && isForwardOpen && !ticketDetails?.isForwarded && (
        <ForwardTicketModal
          ticketId={ticketId}
          ticketDetails={ticketDetails}
          onClose={() => setIsForwardOpen(false)}
        />
      )}
    </>
  );
};
