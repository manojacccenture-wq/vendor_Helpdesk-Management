import React from 'react';
import { CollapsibleSection } from './CollapsibleSection.jsx';
import { FieldRow } from './TicketDetailHelpers.jsx';
import { formatDate } from '../utils/date.js';

/**
 * TicketInformation — Displays vendor/ticket metadata in a collapsible 2-column grid.
 */
export const TicketInformation = ({
  vendorName,
  refNo,
  source,
  btsNo,
  processingDays,
  category,
  subcategory,
  tags,
  billSubmittedDate,
}) => (
  <CollapsibleSection title="Ticket Information" defaultOpen={true}>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
      <div>
        <FieldRow label="Vendor" value={vendorName} />
        <FieldRow label="Reference No" value={refNo} />
        <FieldRow label="Source" value={source} />
        <FieldRow label="BTS Number" value={btsNo} />
        <FieldRow label="Processing Days" value={processingDays} />
      </div>
      <div>
        <FieldRow label="Category" value={category} />
        <FieldRow label="Sub Category" value={subcategory} />
        <FieldRow label="Tags" value={tags} />
        <FieldRow label="Bill Submitted" value={billSubmittedDate ? formatDate(billSubmittedDate) : null} />
      </div>
    </div>
  </CollapsibleSection>
);
