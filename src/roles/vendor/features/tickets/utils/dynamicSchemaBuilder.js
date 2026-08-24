import { z } from 'zod';

/**
 * Builds a dynamic Zod schema by extending a base schema with dynamic controls.
 * Optionally enforces attachment requirements based on subcategory metadata.
 *
 * @param {z.ZodObject} baseSchema The static base schema.
 * @param {Array} dynamicControls The controls returned from the subcategory mapping API.
 * @param {Object} [options] Additional options for schema extension.
 * @param {Object|null} [options.subcategoryMetadata] Parsed metadata from the selected subcategory.
 * @param {boolean} [options.subcategoryMetadata.required] Whether attachments are required.
 * @param {Array<{name: string}>} [options.subcategoryMetadata.attachments] List of required attachment names.
 * @returns {z.ZodObject} The combined schema.
 */
export const buildDynamicSchema = (baseSchema, dynamicControls = [], options = {}) => {
  // Start with either the base schema or a dynamically extended one
  let schema = baseSchema;

  // 1. Extend with dynamic string-based controls
  if (dynamicControls && dynamicControls.length > 0) {
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

    schema = schema.extend(dynamicShape);
  }

  // 2. If subcategory metadata requires attachments, enforce minimum upload count
  const meta = options?.subcategoryMetadata;
  if (meta && meta.required === true) {
    const requiredNames = (meta.attachments || [])
      .map(a => a?.name)
      .filter(Boolean);

    const message = requiredNames.length > 0
      ? `Please upload the required attachment(s): ${requiredNames.join(', ')}.`
      : 'At least one attachment is required for this subcategory.';

    schema = schema.extend({
      attachments: z.array(
        z.any()
          .refine((file) => file instanceof File, { message: 'Invalid file object' })
          .refine((file) => file.size <= 5 * 1024 * 1024, { message: 'Max file size is 5MB' })
          .refine(
            (file) => ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(file.type),
            { message: 'Only PDF, JPG, or PNG files are allowed' }
          )
      )
      .min(1, { message })
      .max(5, { message: 'You can upload a maximum of 5 files' })
      .nullable()
      .optional(),
    });
  }

  return schema;
};
