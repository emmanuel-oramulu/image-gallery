import {
  z
} from 'zod';

export const imageUploadSchema = z.object({
  title: z
    .string({
      error: 'Title is required'
    })
    .trim()
    .min(15, 'Title must be at least 15 characters')
    .max(80, 'Title must not exceed 80 characters'),

  tags: z
    .array(z.string().trim().min(1, 'Tag cannot be empty').max(25, 'Tag must not exceed 25 characters').toLowerCase())
    .min(1, 'At least one tag is required')
    .max(10, 'You can add a maximum of 10 tags'),

  imageData: z
    .string({
      error: 'Image is required'
    })
    .regex(/^data:image\/(png|jpeg|jpg|webp);base64,/, 'Invalid image format')
});