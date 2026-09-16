import { z } from 'zod';

export const sendMessageSchema = z.object({
  content: z.string().trim().min(1).max(1000),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

export const placeVersionSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  scale: z.number().min(0.1).max(1),
});

export type PlaceVersionInput = z.infer<typeof placeVersionSchema>;
