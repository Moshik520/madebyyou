import { z } from 'zod';

export const addCartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(99).default(1),
  designVersionId: z.string().min(1).optional(),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(99),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
