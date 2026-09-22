import { z } from 'zod';

export const registerSchema = z.object({
	name: z
		.string()
		.trim()
		.min(3, 'Name must be at least 3 characters')
		.max(20, 'Name cannot exceed 20 characters'),

	email: z
		.string()
		.trim()
		.email('Please provide a valid email address')
		.toLowerCase(),

	password: z
		.string()
		.min(8, 'Password must be atleast 8 characters long')
		.regex(/(?=.*[0-9])/, 'Password must contain at least one number')
		.regex(/(?=.*[A-Z])/, 'Password must contain at least one uppercase')
		.regex(/(?=.*[a-z])/, 'Password must contain at least one lowercase')
		.regex(/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`])/, 'Password must contain at least one special character (e.g., !, @, $, #)')
});

export type RegisterFormValues = z.infer<typeof registerSchema>;