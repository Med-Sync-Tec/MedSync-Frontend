import React, { useState } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, id, className, error, ...props }) => {
  return (
    <div className={`space-y-1.5 ${className || ''}`}>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <input 
        id={id}
        className={`block w-full rounded-xl border px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 transition-all sm:text-sm ${
          error 
            ? 'border-red-400 bg-red-50/50 dark:bg-red-900/10 focus:border-red-500 focus:ring-red-500/20' 
            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-primary focus:ring-primary/20'
        }`}
        {...props}
      />
      <p className={`text-xs font-medium mt-1 h-4 leading-none ${error ? 'text-red-500' : 'invisible select-none'}`}>
        {error ?? ''}
      </p>
    </div>
  );
};

export const PasswordInput: React.FC<InputProps> = ({ label, id, className, error, ...props }) => {
  const [show, setShow] = useState(false);
  
  return (
    <div className={`space-y-1.5 ${className || ''}`}>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative">
        <input 
          id={id}
          type={show ? "text" : "password"}
          className={`block w-full rounded-xl border px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 transition-all sm:text-sm ${
            error 
              ? 'border-red-400 bg-red-50/50 dark:bg-red-900/10 focus:border-red-500 focus:ring-red-500/20' 
              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-primary focus:ring-primary/20'
          }`}
          {...props}
        />
        <button 
          type="button" 
          onClick={() => setShow(!show)}
          className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <span className="material-symbols-outlined text-lg">
            {show ? 'visibility_off' : 'visibility'}
          </span>
        </button>
      </div>
      <p className={`text-xs font-medium mt-1 h-4 leading-none ${error ? 'text-red-500' : 'invisible select-none'}`}>
        {error ?? ''}
      </p>
    </div>
  );
};
