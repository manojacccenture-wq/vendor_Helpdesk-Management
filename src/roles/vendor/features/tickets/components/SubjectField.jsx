import React from 'react';
import { useWatch } from 'react-hook-form';
import { Input } from '../../../../../shared/components/Input.jsx';

/**
 * SubjectField — Extracted Subject input with character counter.
 *
 * Uses useWatch('subject') internally so that typing only re-renders
 * this component, not the entire VendorTicketForm.
 *
 * @param {Object} props
 * @param {Object} props.control - react-hook-form control (stable reference)
 * @param {Function} props.register - react-hook-form register function (stable reference)
 * @param {string|undefined} props.subjectError - specific error message for subject
 */
export const SubjectField = React.memo(({ control, register, subjectError }) => {
  const subjectValue = useWatch({ name: 'subject', control }) || '';
  const isSubjectAtLimit = subjectValue.length >= 40;
  const isSubjectNearLimit = subjectValue.length >= 35;

  const subjectFieldProps = register('subject');

  return (
    <div className="w-full relative">
      <div className="absolute top-0 right-0 flex items-center h-[20px]">
        <small className={`${isSubjectAtLimit ? 'text-danger' : isSubjectNearLimit ? 'text-warning' : 'text-secondary'}`}>
          {subjectValue.length} / 40
        </small>
      </div>
      <Input
        label="Subject *"
        placeholder="Enter brief issue subject"
        error={subjectError}
        maxLength={40}
        {...subjectFieldProps}
      />
      {isSubjectAtLimit && !subjectError && (
        <small className="text-warning mt-1.5 block">
          Maximum 40 characters allowed.
        </small>
      )}
    </div>
  );
});

SubjectField.displayName = 'SubjectField';
