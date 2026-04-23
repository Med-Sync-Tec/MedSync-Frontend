import React from 'react';

interface FABProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon?: React.ReactNode;
}

export const FAB: React.FC<FABProps> = ({
  label,
  icon,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full shadow-md">
        {label}
      </span>
      <button
        type="button"
        className="w-14 h-14 rounded-full bg-primary hover:bg-primary-hover text-white shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        {...props}
      >
        {icon ?? (
          <span className="material-symbols-outlined text-2xl">smart_toy</span>
        )}
      </button>
    </div>
  );
};
