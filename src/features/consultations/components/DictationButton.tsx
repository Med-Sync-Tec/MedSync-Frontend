import React from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useVoiceDictation } from '../hooks/useVoiceDictation';
import type { SOAPDictationResult } from '../schemas';

interface DictationButtonProps {
  onResult: (fields: SOAPDictationResult) => void;
}

export const DictationButton: React.FC<DictationButtonProps> = ({ onResult }) => {
  const { state, error, start, stop } = useVoiceDictation(onResult);

  const isRecording = state === 'recording';
  const isProcessing = state === 'processing';

  const handleClick = () => {
    if (isRecording) stop();
    else start();
  };

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={isProcessing}
        aria-label={isRecording ? 'Detener grabación' : 'Iniciar dictado IA'}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed
          ${isRecording
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
            : 'bg-primary hover:bg-primary-hover text-white'
          }`}
      >
        {isProcessing && (
          <>
            <Loader2 size={16} className="animate-spin" />
            Procesando dictado...
          </>
        )}
        {!isProcessing && isRecording && (
          <>
            <MicOff size={16} />
            Grabando... (toca para detener)
          </>
        )}
        {!isProcessing && !isRecording && (
          <>
            <Mic size={16} />
            Dictado IA
          </>
        )}
      </button>

      {state === 'error' && error && (
        <p className="text-xs text-danger">{error}</p>
      )}
    </div>
  );
};
