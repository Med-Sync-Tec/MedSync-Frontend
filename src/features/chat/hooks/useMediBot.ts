import { useState } from 'react';
import { sendChatMessage } from '../api';

export interface MediBotMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
}

interface UseMediBotReturn {
  messages: MediBotMessage[];
  isLoading: boolean;
  send: (text: string) => Promise<void>;
  clear: () => void;
}

const ERROR_MESSAGE = 'Ocurrió un error al conectar. Intenta de nuevo.';

export function useMediBot(): UseMediBotReturn {
  const [messages, setMessages] = useState<MediBotMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const send = async (text: string) => {
    const userMsg: MediBotMessage = { id: Date.now().toString(), role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const result = await sendChatMessage(text);
      const botMsg: MediBotMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: result.response,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errMsg: MediBotMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: ERROR_MESSAGE,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clear = () => setMessages([]);

  return { messages, isLoading, send, clear };
}
