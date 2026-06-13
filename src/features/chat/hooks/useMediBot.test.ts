import { renderHook, act } from '@testing-library/react';

jest.mock('../api', () => ({
  sendChatMessage: jest.fn(),
}));

import { sendChatMessage } from '../api';
import { useMediBot } from './useMediBot';

const mockSend = jest.mocked(sendChatMessage);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useMediBot', () => {
  it('starts with empty messages and isLoading=false', () => {
    const { result } = renderHook(() => useMediBot());
    expect(result.current.messages).toHaveLength(0);
    expect(result.current.isLoading).toBe(false);
  });

  it('send() adds user message immediately', async () => {
    mockSend.mockResolvedValue({ response: 'bot reply', isCritical: false });

    const { result } = renderHook(() => useMediBot());
    await act(async () => {
      await result.current.send('hola');
    });

    expect(result.current.messages[0]).toMatchObject({ role: 'user', text: 'hola' });
  });

  it('send() adds bot response after success', async () => {
    mockSend.mockResolvedValue({ response: 'El ibuprofeno es un NSAID.', isCritical: false });

    const { result } = renderHook(() => useMediBot());
    await act(async () => {
      await result.current.send('pregunta');
    });

    const botMsg = result.current.messages.find((m) => m.role === 'bot');
    expect(botMsg?.text).toBe('El ibuprofeno es un NSAID.');
  });

  it('isLoading is false after response arrives', async () => {
    mockSend.mockResolvedValue({ response: 'ok', isCritical: false });

    const { result } = renderHook(() => useMediBot());
    await act(async () => {
      await result.current.send('pregunta');
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('adds error message when API throws', async () => {
    mockSend.mockRejectedValue(new Error('network error'));

    const { result } = renderHook(() => useMediBot());
    await act(async () => {
      await result.current.send('pregunta');
    });

    const botMsg = result.current.messages.find((m) => m.role === 'bot');
    expect(botMsg).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('clear() empties the messages array', async () => {
    mockSend.mockResolvedValue({ response: 'ok', isCritical: false });

    const { result } = renderHook(() => useMediBot());
    await act(async () => {
      await result.current.send('hola');
    });
    act(() => result.current.clear());

    expect(result.current.messages).toHaveLength(0);
  });
});
