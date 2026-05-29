import { useState, useRef } from 'react';
import { sendDictation } from '../api';
import type { SOAPDictationResult } from '../schemas';

export type DictationState = 'idle' | 'recording' | 'processing' | 'error';

interface UseVoiceDictationReturn {
  state: DictationState;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
}

export function useVoiceDictation(
  onResult: (fields: SOAPDictationResult) => void
): UseVoiceDictationReturn {
  const [state, setState] = useState<DictationState>('idle');
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const start = async () => {
    setError(null);
    try {
      if (typeof MediaRecorder === 'undefined') {
        throw new Error('MediaRecorder not supported');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.addEventListener('dataavailable', (e: BlobEvent) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      });

      recorder.addEventListener('stop', async () => {
        stream.getTracks().forEach((t) => t.stop());
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        setState('processing');
        try {
          const result = await sendDictation(audioBlob);
          onResult(result);
          setState('idle');
        } catch {
          setError('No se pudo procesar el audio. Intenta de nuevo.');
          setState('error');
        }
      });

      recorder.start();
      setState('recording');
    } catch {
      setError('Permiso de micrófono denegado. Actívalo en la configuración del navegador.');
      setState('error');
    }
  };

  const stop = () => {
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.stop();
    }
  };

  return { state, error, start, stop };
}
