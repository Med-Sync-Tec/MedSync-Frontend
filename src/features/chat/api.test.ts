
jest.mock('@lib/http/client', () => ({
  apiFetch: jest.fn(),
}));

import { apiFetch } from '@lib/http/client';
import { sendChatMessage } from './api';

const mockApiFetch = jest.mocked(apiFetch);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('sendChatMessage', () => {
  it('calls POST /api/chat with the correct body', async () => {
    mockApiFetch.mockResolvedValue({ response: 'ok', isCritical: false });

    await sendChatMessage('hola');

    expect(mockApiFetch).toHaveBeenCalledWith('/api/chat', {
      method: 'POST',
      body: { message: 'hola' },
    });
  });

  it('returns the response string on success', async () => {
    mockApiFetch.mockResolvedValue({ response: 'respuesta del bot', isCritical: false });

    const result = await sendChatMessage('pregunta');

    expect(result).toEqual({ response: 'respuesta del bot', isCritical: false });
  });

  it('throws if the response does not match the schema', async () => {
    mockApiFetch.mockResolvedValue({ unexpected: 'data' });

    await expect(sendChatMessage('pregunta')).rejects.toThrow();
  });
});
