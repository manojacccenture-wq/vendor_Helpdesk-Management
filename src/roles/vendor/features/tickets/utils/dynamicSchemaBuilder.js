import { z } from 'zod';

/**
 * Builds a dynamic Zod schema by extending a base schema with dynamic controls.
 * @param {z.ZodObject} baseSchema The static base schema.
 * @param {Array} dynamicControls The controls returned from the subcategory mapping API.
 * @returns {z.ZodObject} The combined schema.
 */
export const buildDynamicSchema = (baseSchema, dynamicControls = []) => {
  if (!dynamicControls || dynamicControls.length === 0) {
    return baseSchema;
  }

  const dynamicShape = {};

  dynamicControls.forEach(control => {
    let fieldValidator = z.string();
    
    // For non-required fields, allow empty string
    if (!control.required) {
      fieldValidator = fieldValidator.optional().or(z.literal(''));
    }

    // Apply required
    if (control.required) {
      fieldValidator = fieldValidator.min(1, { message: control.requiredMsg || `${control.label} is required` });
    }

    // Apply min/max length (applicable mostly for string types)
    if (control.minLength) {
      fieldValidator = fieldValidator.min(control.minLength, { 
        message: `${control.label} must be at least ${control.minLength} characters` 
      });
    }
    if (control.maxLength) {
      fieldValidator = fieldValidator.max(control.maxLength, { 
        message: `${control.label} must not exceed ${control.maxLength} characters` 
      });
    }

    dynamicShape[control.columnName] = fieldValidator;
  });

  return baseSchema.extend(dynamicShape);
};
