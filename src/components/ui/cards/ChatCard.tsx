import React, { useState } from 'react';
import { ChatInput } from '../inputs/ChatInput';

interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
}

interface ChatCardProps {
  title?: string;
  initialMessages?: ChatMessage[];
  onClose?: () => void;
  onSend?: (message: string) => void;
  className?: string;
}

export const ChatCard: React.FC<ChatCardProps> = ({
  title = 'MediBot IA',
  initialMessages = [],
  onClose,
  onSend,
  className = '',
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  const handleSend = (text: string) => {
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    onSend?.(text);
  };

  return (
    <div className={`w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-4 py-3 bg-accent text-white">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">smart_toy</span>
          <span className="text-sm font-bold">{title}</span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
            aria-label="Cerrar chat"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-72">
        {messages.length === 0 && (
          <p className="text-xs text-gray-400 text-center mt-4">
            Hola, soy MediBot. ¿En qué puedo ayudarte?
          </p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-br-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-gray-100 dark:border-gray-700">
        <ChatInput onSend={handleSend} />
      </div>
    </div>
  );
};
