import React, { forwardRef, useState } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const FIELD_BASE =
  'block w-full rounded-xl border px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 transition-all sm:text-sm';

const fieldState = (hasError: boolean): string =>
  hasError
    ? 'border-red-400 bg-red-50/50 dark:bg-red-900/10 focus:border-red-500 focus:ring-red-500/20'
    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-primary focus:ring-primary/20';

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, id, className, error, ...props },
  ref
) {
  return (
    <div className={`space-y-1.5 ${className ?? ''}`}>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        aria-invalid={Boolean(error)}
        className={`${FIELD_BASE} ${fieldState(Boolean(error))}`}
        {...props}
      />
      <p
        className={`text-xs font-medium mt-1 h-4 leading-none ${
          error ? 'text-red-500' : 'invisible select-none'
        }`}
      >
        {error ?? ''}
      </p>
    </div>
  );
});

export const PasswordInput = forwardRef<HTMLInputElement, InputProps>(function PasswordInput(
  { label, id, className, error, ...props },
  ref
) {
  const [show, setShow] = useState(false);

  return (
    <div className={`space-y-1.5 ${className ?? ''}`}>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={show ? 'text' : 'password'}
          aria-invalid={Boolean(error)}
          className={`${FIELD_BASE} ${fieldState(Boolean(error))}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={show}
          className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <span className="material-symbols-outlined text-lg" aria-hidden="true">
            {show ? 'visibility_off' : 'visibility'}
          </span>
        </button>
      </div>
      <p
        className={`text-xs font-medium mt-1 h-4 leading-none ${
          error ? 'text-red-500' : 'invisible select-none'
        }`}
      >
        {error ?? ''}
      </p>
    </div>
  );
});
