import React from 'react';
import { CollapsibleSection } from './CollapsibleSection.jsx';
import { FieldRow } from './TicketDetailHelpers.jsx';

/**
 * TicketProcessing — Displays assignment and escalation info in a collapsible 2-column grid.
 */
export const TicketProcessing = ({
  assignedDept,
  assignedAgent,
  helpdeskAgentId,
  isEscalated,
  escalationLevel,
  createdBy,
  ticketUpdatedBy,
  reopenedCount,
}) => (
  <CollapsibleSection title="Processing & Assignment" defaultOpen={false}>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
      <div>
        <FieldRow label="Assigned Dept" value={assignedDept ? `Department #${assignedDept}` : null} />
        <FieldRow label="Assigned Agent" value={assignedAgent} />
        <FieldRow label="Helpdesk Agent" value={helpdeskAgentId} />
        <FieldRow label="Escalated" value={isEscalated === true ? 'Yes' : isEscalated === false ? 'No' : null} />
        <FieldRow label="Escalation Level" value={escalationLevel ?? null} />
      </div>
      <div>
        <FieldRow label="Created By" value={createdBy} />
        <FieldRow label="Updated By" value={ticketUpdatedBy} />
        <FieldRow label="Reopened" value={reopenedCount ?? null} />
      </div>
    </div>
  </CollapsibleSection>
);
