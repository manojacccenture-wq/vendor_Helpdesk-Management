import React from 'react';
import { StatusBadge } from './StatusBadge.jsx';
import { InfoChip } from './TicketDetailHelpers.jsx';
import { TicketActions } from './TicketActions.jsx';
import { TicketCommentsDrawer } from './TicketCommentsDrawer.jsx';
import { TicketHistoryDrawer } from './TicketHistoryDrawer.jsx';
import { getSectionField } from '../services/emailNotifications.js';

/**
 * TicketHero — Displays ticket identity (number, status, priority) and action buttons.
 */
export const TicketHero = ({
  ticketId,
  ticketNo,
  status,
  statusColorHex,
  priority,
  canUpdateStatus,
  ticketDetails,
  subject,
  ticketHistoryStages,
  visibleCommentButton,
  visibleAssignButton,
  visibleFeedbackButton,
}) => {
  const sections = ticketDetails?.sections || [];
  const vendorEmail = getSectionField(sections, 'Ticket Information', 'Vendor Email');

  return (
  <div className="px-5 pt-4 pb-3 border-b border-default">
    <div className="flex items-center justify-between gap-3 mb-2">
      <div className="flex items-center gap-3">
        <h1 
        
        className=" font-mono text-secondary"
        >#{ticketNo}</h1>
        <StatusBadge status={status} colorHex={statusColorHex} />
        <div className="flex items-center gap-2">
          {priority && (
            <InfoChip>{priority}</InfoChip>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {canUpdateStatus && (
          <TicketActions
            ticketId={ticketId}
            ticket={{ ...ticketDetails, visibleAssignButton }}
            currentStatus={status}
            onActionComplete={() => {}}
          />
        )}
        {Boolean(visibleCommentButton ?? ticketDetails?.visibleCommentButton) && (
          <TicketCommentsDrawer ticketId={ticketId} ticketNo={ticketNo} ticketSubject={subject} vendorEmail={vendorEmail} />
        )}
        <TicketHistoryDrawer ticketId={ticketId} stages={ticketHistoryStages} />
      </div>
    </div>

    <h2 className="page-heading text-primary">{subject}</h2>
  </div>
  );
};
