import React, { useState } from 'react';

interface ChatInputProps {
  onSend?: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  placeholder = 'Escribe tu pregunta a MediBot...',
  disabled = false,
  className = '',
}) => {
  const [value, setValue] = useState('');

  const handleSend = () => {
    if (!value.trim()) return;
    onSend?.(value.trim());
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`flex items-center gap-2 p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 bg-transparent px-2 py-1.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none disabled:opacity-50"
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="w-9 h-9 rounded-lg bg-[#4f46e5] hover:bg-[#4338ca] text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30"
        aria-label="Enviar mensaje"
      >
        <span className="material-symbols-outlined text-lg">send</span>
      </button>
    </div>
  );
};
