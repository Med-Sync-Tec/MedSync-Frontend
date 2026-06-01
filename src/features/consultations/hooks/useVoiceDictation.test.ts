import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('../api', () => ({
  sendDictation: vi.fn(),
}));

import { useVoiceDictation } from './useVoiceDictation';

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(globalThis.navigator, 'mediaDevices', {
    value: {
      getUserMedia: vi.fn().mockResolvedValue({
        getTracks: () => [{ stop: vi.fn() }],
      }),
    },
    configurable: true,
  });
});

describe('useVoiceDictation', () => {
  it('starts in idle state with no error', () => {
    const { result } = renderHook(() => useVoiceDictation(vi.fn()));
    expect(result.current.state).toBe('idle');
    expect(result.current.error).toBeNull();
  });

  it('transitions to error when microphone is denied', async () => {
    Object.defineProperty(globalThis.navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockRejectedValue(new DOMException('Permission denied', 'NotAllowedError')),
      },
      configurable: true,
    });

    const { result } = renderHook(() => useVoiceDictation(vi.fn()));
    await act(async () => { await result.current.start(); });

    expect(result.current.state).toBe('error');
    expect(result.current.error).toContain('micrófono');
  });

  it('stop() without active recording does nothing', () => {
    const { result } = renderHook(() => useVoiceDictation(vi.fn()));
    expect(() => result.current.stop()).not.toThrow();
    expect(result.current.state).toBe('idle');
  });

  it('transitions to error when MediaRecorder is not available', async () => {
    // Simulate browser without MediaRecorder support
    vi.stubGlobal('MediaRecorder', undefined);

    const { result } = renderHook(() => useVoiceDictation(vi.fn()));
    await act(async () => { await result.current.start(); });

    expect(result.current.state).toBe('error');
    vi.unstubAllGlobals();
  });
});
