import { apiFetch } from '@lib/http/client';
import { ChatResponseSchema, type ChatResponse } from './schemas';

export async function sendChatMessage(message: string): Promise<ChatResponse> {
  const raw = await apiFetch<unknown>('/api/chat', {
    method: 'POST',
    body: { message },
  });
  return ChatResponseSchema.parse(raw);
}
