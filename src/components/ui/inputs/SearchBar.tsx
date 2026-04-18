import React from 'react';

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  className = '',
  ...props
}) => {
  return (
    <div className={`relative ${className}`}>
      <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
        <span className="material-symbols-outlined text-xl">search</span>
      </span>
      <input
        type="search"
        placeholder="Buscar noticias, pacientes..."
        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] transition-all"
        onChange={(e) => onSearch?.(e.target.value)}
        {...props}
      />
    </div>
  );
};
