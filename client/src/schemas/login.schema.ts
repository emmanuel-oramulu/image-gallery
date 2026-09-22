import { z } from 'zod';

export const loginSchema = z.object({
	email: z.string().trim().email().toLowerCase(),
	password: z.string().min(1, 'Password is required'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;