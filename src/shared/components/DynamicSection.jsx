import React from 'react';
import { CollapsibleSection } from './CollapsibleSection.jsx';
import { FieldRow } from './TicketDetailHelpers.jsx';

/**
 * DynamicSection — Renders a collapsible section from the API's sections[] array.
 * Splits fields into a 2-column grid layout, matching the existing section design.
 *
 * @param {Object} props
 * @param {string} props.title - Section title (from sections[].title)
 * @param {Array<{label: string, value: string|null}>} props.fields - Fields array (from sections[].fields)
 * @param {boolean} props.defaultOpen - Whether the section starts open
 */
export const DynamicSection = ({ title, fields = [], defaultOpen = false }) => {
  const midpoint = Math.ceil(fields.length / 2);
  const leftFields = fields.slice(0, midpoint);
  const rightFields = fields.slice(midpoint);

  return (
    <CollapsibleSection title={title} defaultOpen={defaultOpen}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
        <div>
          {leftFields.map((field, index) => (
            <FieldRow key={`left-${index}`} label={field.label} value={field.value} />
          ))}
        </div>
        <div>
          {rightFields.map((field, index) => (
            <FieldRow key={`right-${index}`} label={field.label} value={field.value} />
          ))}
        </div>
      </div>
    </CollapsibleSection>
  );
};
