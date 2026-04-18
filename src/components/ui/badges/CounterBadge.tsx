import React from 'react';

interface CounterBadgeProps {
  text: string;
  variant?: 'info' | 'warning' | 'success';
  className?: string;
}

const variantStyles: Record<string, string> = {
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  warning: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
};

export const CounterBadge: React.FC<CounterBadgeProps> = ({
  text,
  variant = 'info',
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${variantStyles[variant]} ${className}`}
    >
      {text}
    </span>
  );
};
