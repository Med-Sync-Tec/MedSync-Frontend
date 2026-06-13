import { renderHook, act } from '@testing-library/react';

jest.mock('../api', () => ({
  sendDictation: jest.fn(),
}));

import { useVoiceDictation } from './useVoiceDictation';

beforeEach(() => {
  jest.clearAllMocks();
  Object.defineProperty(globalThis.navigator, 'mediaDevices', {
    value: {
      getUserMedia: jest.fn().mockResolvedValue({
        getTracks: () => [{ stop: jest.fn() }],
      }),
    },
    configurable: true,
  });
});

describe('useVoiceDictation', () => {
  it('starts in idle state with no error', () => {
    const { result } = renderHook(() => useVoiceDictation(jest.fn()));
    expect(result.current.state).toBe('idle');
    expect(result.current.error).toBeNull();
  });

  it('transitions to error when microphone is denied', async () => {
    Object.defineProperty(globalThis.navigator, 'mediaDevices', {
      value: {
        getUserMedia: jest.fn().mockRejectedValue(new DOMException('Permission denied', 'NotAllowedError')),
      },
      configurable: true,
    });

    const { result } = renderHook(() => useVoiceDictation(jest.fn()));
    await act(async () => { await result.current.start(); });

    expect(result.current.state).toBe('error');
    expect(result.current.error).toContain('micrófono');
  });

  it('stop() without active recording does nothing', () => {
    const { result } = renderHook(() => useVoiceDictation(jest.fn()));
    expect(() => result.current.stop()).not.toThrow();
    expect(result.current.state).toBe('idle');
  });

  it('transitions to error when MediaRecorder is not available', async () => {
    // Simulate browser without MediaRecorder support
    const originalMediaRecorder = globalThis.MediaRecorder;
    globalThis.MediaRecorder = undefined as unknown as typeof MediaRecorder;

    const { result } = renderHook(() => useVoiceDictation(jest.fn()));
    await act(async () => { await result.current.start(); });

    expect(result.current.state).toBe('error');
    globalThis.MediaRecorder = originalMediaRecorder;
  });
});
