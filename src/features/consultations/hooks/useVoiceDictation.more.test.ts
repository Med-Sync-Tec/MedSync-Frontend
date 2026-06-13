import { renderHook, act, waitFor } from '@testing-library/react';

jest.mock('../api', () => ({
  sendDictation: jest.fn(),
}));

import { sendDictation } from '../api';
import { useVoiceDictation } from './useVoiceDictation';

const mockSendDictation = jest.mocked(sendDictation);

type Listener = (event: unknown) => void;

let recorders: FakeMediaRecorder[] = [];

class FakeMediaRecorder {
  static readonly isTypeSupported = jest.fn().mockReturnValue(true);

  state: 'inactive' | 'recording' = 'inactive';
  readonly stream: unknown;
  readonly options: { mimeType?: string } | undefined;
  private readonly listeners = new Map<string, Listener[]>();

  constructor(stream: unknown, options?: { mimeType?: string }) {
    this.stream = stream;
    this.options = options;
    recorders.push(this);
  }

  addEventListener(type: string, listener: Listener): void {
    const existing = this.listeners.get(type) ?? [];
    this.listeners.set(type, [...existing, listener]);
  }

  start(): void {
    this.state = 'recording';
  }

  stop(): void {
    this.state = 'inactive';
    this.emit('stop', {});
  }

  emit(type: string, event: unknown): void {
    for (const listener of this.listeners.get(type) ?? []) {
      listener(event);
    }
  }
}

const trackStop = jest.fn();

function stubMediaDevices(): void {
  Object.defineProperty(globalThis.navigator, 'mediaDevices', {
    value: {
      getUserMedia: jest.fn().mockResolvedValue({
        getTracks: () => [{ stop: trackStop }],
      }),
    },
    configurable: true,
  });
}

const DICTATION_RESULT = {
  motivoConsulta: 'Dolor torácico',
  subjetivo: null,
  objetivo: null,
  evaluacion: null,
  diagnostico: null,
  plan: null,
  prescripcion: null,
};

const originalMediaRecorder = globalThis.MediaRecorder;

beforeEach(() => {
  jest.clearAllMocks();
  recorders = [];
  FakeMediaRecorder.isTypeSupported.mockReturnValue(true);
  globalThis.MediaRecorder = FakeMediaRecorder as unknown as typeof MediaRecorder;
  stubMediaDevices();
});

afterEach(() => {
  globalThis.MediaRecorder = originalMediaRecorder;
});

describe('useVoiceDictation (recording lifecycle)', () => {
  it('transitions to recording and requests audio-only media on start', async () => {
    const { result } = renderHook(() => useVoiceDictation(jest.fn()));

    await act(async () => {
      await result.current.start();
    });

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(result.current.state).toBe('recording');
    expect(result.current.error).toBeNull();
    expect(recorders).toHaveLength(1);
    expect(recorders[0].state).toBe('recording');
  });

  it('prefers audio/webm;codecs=opus when supported', async () => {
    const { result } = renderHook(() => useVoiceDictation(jest.fn()));

    await act(async () => {
      await result.current.start();
    });

    expect(recorders[0].options?.mimeType).toBe('audio/webm;codecs=opus');
  });

  it('falls back to audio/webm when opus is not supported', async () => {
    FakeMediaRecorder.isTypeSupported.mockReturnValue(false);
    const { result } = renderHook(() => useVoiceDictation(jest.fn()));

    await act(async () => {
      await result.current.start();
    });

    expect(recorders[0].options?.mimeType).toBe('audio/webm');
  });

  it('sends the recorded audio and returns to idle on success', async () => {
    mockSendDictation.mockResolvedValue(DICTATION_RESULT);
    const onResult = jest.fn();
    const { result } = renderHook(() => useVoiceDictation(onResult));

    await act(async () => {
      await result.current.start();
    });

    const recorder = recorders[0];
    act(() => {
      recorder.emit('dataavailable', { data: new Blob(['chunk-1']) });
      recorder.emit('dataavailable', { data: new Blob([]) }); // size 0 — ignored
      result.current.stop();
    });

    await waitFor(() => expect(result.current.state).toBe('idle'));
    expect(onResult).toHaveBeenCalledWith(DICTATION_RESULT);
    expect(mockSendDictation).toHaveBeenCalledTimes(1);

    const sentBlob = mockSendDictation.mock.calls[0][0];
    expect(sentBlob).toBeInstanceOf(Blob);
    expect(sentBlob.size).toBe(new Blob(['chunk-1']).size);
    expect(sentBlob.type).toBe('audio/webm;codecs=opus');
    expect(trackStop).toHaveBeenCalled();
    expect(result.current.error).toBeNull();
  });

  it('moves to error state with a Spanish message when sendDictation fails', async () => {
    mockSendDictation.mockRejectedValue(new Error('500'));
    const onResult = jest.fn();
    const { result } = renderHook(() => useVoiceDictation(onResult));

    await act(async () => {
      await result.current.start();
    });

    act(() => {
      recorders[0].emit('dataavailable', { data: new Blob(['chunk']) });
      result.current.stop();
    });

    await waitFor(() => expect(result.current.state).toBe('error'));
    expect(result.current.error).toBe('No se pudo procesar el audio. Intenta de nuevo.');
    expect(onResult).not.toHaveBeenCalled();
  });

  it('enters processing state while the dictation request is in flight', async () => {
    let resolveDictation: (value: typeof DICTATION_RESULT) => void = () => {};
    mockSendDictation.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveDictation = resolve;
        }),
    );
    const { result } = renderHook(() => useVoiceDictation(jest.fn()));

    await act(async () => {
      await result.current.start();
    });

    act(() => {
      recorders[0].emit('dataavailable', { data: new Blob(['chunk']) });
      result.current.stop();
    });

    await waitFor(() => expect(result.current.state).toBe('processing'));

    await act(async () => {
      resolveDictation(DICTATION_RESULT);
    });
    await waitFor(() => expect(result.current.state).toBe('idle'));
  });

  it('stop() only stops the recorder while it is recording', async () => {
    const { result } = renderHook(() => useVoiceDictation(jest.fn()));

    await act(async () => {
      await result.current.start();
    });

    const recorder = recorders[0];
    const stopSpy = jest.spyOn(recorder, 'stop');

    act(() => {
      result.current.stop();
    });
    expect(stopSpy).toHaveBeenCalledTimes(1);

    // Second stop: recorder is now inactive, so stop() must not be re-invoked.
    act(() => {
      result.current.stop();
    });
    expect(stopSpy).toHaveBeenCalledTimes(1);
  });

  it('clears a previous error when starting a new recording', async () => {
    mockSendDictation.mockRejectedValue(new Error('500'));
    const { result } = renderHook(() => useVoiceDictation(jest.fn()));

    await act(async () => {
      await result.current.start();
    });
    act(() => {
      recorders[0].emit('dataavailable', { data: new Blob(['chunk']) });
      result.current.stop();
    });
    await waitFor(() => expect(result.current.state).toBe('error'));

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.state).toBe('recording');
  });
});
