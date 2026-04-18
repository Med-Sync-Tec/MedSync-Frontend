import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, id, className, ...props }) => {
  return (
    <div className={`flex items-center ${className || ''}`}>
      <input 
        id={id} 
        type="checkbox" 
        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700" 
        {...props} 
      />
      <label htmlFor={id} className="ml-2 block text-sm text-gray-600 dark:text-gray-400">
        {label}
      </label>
    </div>
  );
};
