import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
}

export const IconButton: React.FC<IconButtonProps> = ({ 
  icon,
  className = '',
  ...props 
}) => {
  return (
    <button 
      className={`relative w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 hover:scale-105 active:scale-95 flex items-center justify-center overflow-hidden ${className}`}
      {...props}
    >
      <div className="flex items-center justify-center inset-0 absolute">
        {icon}
      </div>
    </button>
  );
};
