import { z } from 'zod';

export const createDesignProjectSchema = z.object({
  productId: z.string().min(1),
  title: z.string().trim().min(1).max(120).optional(),
});

export type CreateDesignProjectInput = z.infer<typeof createDesignProjectSchema>;
