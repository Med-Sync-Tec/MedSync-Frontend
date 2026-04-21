import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  id,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={4}
        className={`block w-full rounded-xl border px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 transition-all sm:text-sm resize-none ${
          error
            ? 'border-red-400 bg-red-50/50 dark:bg-red-900/10 focus:border-red-500 focus:ring-red-500/20'
            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-[#4f46e5] focus:ring-[#4f46e5]/20'
        }`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 font-medium mt-1">{error}</p>}
    </div>
  );
};
