import { z } from 'zod';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const createTicketSchema = z.object({
  departmentId: z.string()
    .min(1, { message: 'Please select a department' }),

  subject: z.string()
    .trim()
    .min(1, { message: 'Subject is required' })
    .min(5, { message: 'Subject must contain at least 5 characters' })
    .max(200, { message: 'Subject must not exceed 200 characters' }),
    
  categoryId: z.string()
    .min(1, { message: 'Please select a category' }),
    
  subCategoryId: z.string().optional().or(z.literal('')),
    
  description: z.string()
    .trim()
    .min(1, { message: 'Description is required' })
    .min(10, { message: 'Description must contain at least 10 characters' })
    .max(2000, { message: 'Description must not exceed 2000 characters' }),
    
  attachments: z.any()
    .refine((file) => !file || file instanceof File, { message: 'Invalid file object' })
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, { message: 'Max file size is 10MB' })
    .nullable()
    .optional(),
});
