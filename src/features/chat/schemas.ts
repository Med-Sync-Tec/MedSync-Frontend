import { z } from 'zod';

export const ChatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
});

export const ChatResponseSchema = z.object({
  response: z.string(),
  isCritical: z.boolean(),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;
