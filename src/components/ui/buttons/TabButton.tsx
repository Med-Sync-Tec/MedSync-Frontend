import React from 'react';

interface TabButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  count: number;
  icon?: React.ReactNode;
  active?: boolean;
}

export const TabButton: React.FC<TabButtonProps> = ({
  label,
  count,
  icon,
  active = false,
  className = '',
  ...props
}) => {
  return (
    <button
      type="button"
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 ${
        active
          ? 'bg-primary text-white shadow-md'
          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
      } ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
      <span
        className={`min-w-[1.5rem] h-6 px-1.5 rounded-full flex items-center justify-center text-xs font-bold ${
          active
            ? 'bg-white/20 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
        }`}
      >
        {count}
      </span>
    </button>
  );
};
