import React from 'react';

interface FilterChipProps {
  label: string;
  onRemove?: () => void;
  className?: string;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  onRemove,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 ${className}`}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="hover:text-blue-900 dark:hover:text-blue-100 transition-colors focus:outline-none"
          aria-label={`Eliminar filtro ${label}`}
        >
          <span className="material-symbols-outlined text-sm leading-none">close</span>
        </button>
      )}
    </span>
  );
};
