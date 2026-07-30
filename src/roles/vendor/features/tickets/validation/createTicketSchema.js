import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

// This is now the base schema, it will be extended with dynamic fields
export const baseTicketSchema = z.object({
  departmentId: z.string()
    .min(1, { message: 'Please select a department' }),

  subject: z.string()
    .trim()
    .min(1, { message: 'Subject is required' })
    .min(5, { message: 'Subject must contain at least 5 characters' })
    .max(40, { message: 'Subject must not exceed 40 characters' }),
    
  categoryId: z.string()
    .min(1, { message: 'Please select a category' }),
    
  subCategoryId: z.string().optional().or(z.literal('')),
    
  description: z.string()
    .trim()
    .min(1, { message: 'Description is required' })
    .min(10, { message: 'Description must contain at least 10 characters' })
    .max(2000, { message: 'Description must not exceed 2000 characters' }),
    
  attachments: z.array(
    z.any()
      .refine((file) => file instanceof File, { message: 'Invalid file object' })
      .refine((file) => file.size <= MAX_FILE_SIZE, { message: 'Max file size is 5MB' })
      .refine((file) => ALLOWED_MIME_TYPES.includes(file.type), { message: 'Only PDF, JPG, or PNG files are allowed' })
  )
  .max(5, { message: 'You can upload a maximum of 5 files' })
  .nullable()
  .optional()
  .default([]),
});
