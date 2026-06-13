import React from 'react';
import type { MediBotMessage } from '@features/chat/hooks/useMediBot';
import { ChatInput } from '../inputs/ChatInput';

function renderBotText(text: string): React.ReactNode {
  const blocks = text.split(/\n{2,}/);
  return blocks.map((block, bi) => {
    const lines = block.split('\n');
    const isList = lines.every((l) => /^[-*]\s/.test(l.trim()) || l.trim() === '');
    const isHeader = lines.length === 1 && /^###\s/.test(lines[0]);
    // Use block index with a type prefix for stable-enough keys in bot-rendered text
    const blockKey = `block-${bi}-${block.slice(0, 8)}`;

    if (isHeader) {
      return (
        <p key={blockKey} className="font-semibold text-xs mb-1">
          {inlineFormat(lines[0].replace(/^###\s/, ''))}
        </p>
      );
    }
    if (isList) {
      return (
        <ul key={blockKey} className="list-disc list-inside space-y-0.5 mb-1">
          {lines.filter((l) => l.trim()).map((l, li) => (
            <li key={`item-${bi}-${li}-${l.slice(0, 8)}`}>{inlineFormat(l.replace(/^[-*]\s/, ''))}</li>
          ))}
        </ul>
      );
    }
    return <p key={blockKey} className="mb-1">{lines.map((l, li) => <span key={`line-${bi}-${li}-${l.slice(0, 8)}`}>{inlineFormat(l)}{li < lines.length - 1 && <br />}</span>)}</p>;
  });
}

function inlineFormat(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part) =>
    /^\*\*[^*]+\*\*$/.test(part)
      ? <strong key={part}>{part.slice(2, -2)}</strong>
      : part
  );
}

interface ChatCardProps {
  messages: MediBotMessage[];
  isLoading?: boolean;
  onClose?: () => void;
  onSend: (message: string) => void;
  className?: string;
}

export const ChatCard: React.FC<ChatCardProps> = ({
  messages,
  isLoading = false,
  onClose,
  onSend,
  className = '',
}) => {
  return (
    <div className={`w-[calc(100vw-3rem)] max-w-[320px] sm:w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-4 py-3 bg-accent text-white">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">smart_toy</span>
          <span className="text-sm font-bold">MediBot IA</span>
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
        {messages.length === 0 && !isLoading && (
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
              {msg.role === 'bot' ? renderBotText(msg.text) : msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <output
              aria-label="MediBot está escribiendo"
              className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-2xl rounded-bl-sm text-gray-500 dark:text-gray-400 text-sm"
            >
              ···
            </output>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gray-100 dark:border-gray-700">
        <ChatInput onSend={onSend} disabled={isLoading} />
      </div>
    </div>
  );
};
