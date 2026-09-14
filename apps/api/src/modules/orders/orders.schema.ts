import { z } from 'zod';

export const payOrderSchema = z.object({
  cardToken: z.string().min(1).max(200),
});

export type PayOrderInput = z.infer<typeof payOrderSchema>;
