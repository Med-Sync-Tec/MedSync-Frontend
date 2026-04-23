import React, { forwardRef } from 'react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, id, className, ...props },
  ref
) {
  return (
    <div className={`flex items-center ${className ?? ''}`}>
      <input
        ref={ref}
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
});
