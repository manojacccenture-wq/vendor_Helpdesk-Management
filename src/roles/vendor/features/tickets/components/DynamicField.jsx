import React from 'react';
import { Input } from '../../../../../shared/components/Input.jsx';
import { Select } from '../../../../../shared/components/Select.jsx';
import { Textarea } from '../../../../../shared/components/Textarea.jsx';

export const DynamicField = React.memo(({ control, register, error, disabled }) => {
  const { label, columnName, controlType, required, dataType } = control;
  const displayLabel = required ? `${label} *` : label;

  switch (controlType?.toLowerCase()) {
    case 'textbox':
      if (dataType?.toLowerCase() === 'date' || dataType?.toLowerCase() === 'date-time') {
        return (
          <Input 
            type="date"
            label={displayLabel}
            error={error}
            disabled={disabled}
            {...register(columnName)}
          />
        );
      }
      return (
        <Input 
          type="text"
          label={displayLabel}
          error={error}
          disabled={disabled}
          {...register(columnName)}
        />
      );
      
    case 'textarea':
      return (
        <Textarea 
          label={displayLabel}
          error={error}
          disabled={disabled}
          {...register(columnName)}
        />
      );
      
    case 'dropdown':
    case 'select':
      return (
        <Select 
          label={displayLabel}
          error={error}
          disabled={disabled}
          options={[]} // Options to be populated if apiURL is provided in future
          placeholder={`Select ${label}`}
          {...register(columnName)}
        />
      );
      
    default:
      return (
        <Input 
          type="text"
          label={displayLabel}
          error={error}
          disabled={disabled}
          {...register(columnName)}
        />
      );
  }
});

DynamicField.displayName = 'DynamicField';
