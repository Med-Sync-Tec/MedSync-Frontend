import React from 'react';

type MatchVariant = 'normal' | 'alert';

interface MatchTagProps {
  text: string;
  variant?: MatchVariant;
  className?: string;
}

export const MatchTag: React.FC<MatchTagProps> = ({
  text,
  variant = 'normal',
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
        variant === 'alert'
          ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-800'
          : 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
      } ${className}`}
    >
      <span className="material-symbols-outlined text-sm">
        {variant === 'alert' ? 'warning' : 'people'}
      </span>
      {text}
    </span>
  );
};
