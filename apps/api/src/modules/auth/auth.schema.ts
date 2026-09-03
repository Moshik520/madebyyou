import { z } from 'zod';

export const registerSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  name: z.string().trim().min(2).max(80).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
