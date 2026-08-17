import React from 'react';
import { CollapsibleSection } from './CollapsibleSection.jsx';
import { FieldRow } from './TicketDetailHelpers.jsx';

/**
 * TicketTimeline — Displays ticket dates in a collapsible 2-column grid.
 */
export const TicketTimeline = ({
  createdAt,
  dueAt,
  resolvedAt,
  updatedAt,
  firstResponseAt,
  closedAt,
}) => (
  <CollapsibleSection title="Timeline" defaultOpen={false}>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 mb-6">
      <div>
        <FieldRow label="Created" value={createdAt} />
        <FieldRow label="Due Date" value={dueAt} />
        <FieldRow label="Resolved" value={resolvedAt} />
      </div>
      <div>
        <FieldRow label="Updated" value={updatedAt} />
        <FieldRow label="First Response" value={firstResponseAt} />
        <FieldRow label="Closed" value={closedAt} />
      </div>
    </div>
  </CollapsibleSection>
);
