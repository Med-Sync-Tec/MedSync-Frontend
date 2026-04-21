import React from 'react';

type Category =
  | 'cardiologia'
  | 'farmacologia'
  | 'endocrinologia'
  | 'infecciosas'
  | 'neurologia'
  | 'default';

interface CategoryTagProps {
  label: string;
  category?: Category;
  className?: string;
}

const colorMap: Record<Category, string> = {
  cardiologia: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  farmacologia: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  endocrinologia: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  infecciosas: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  neurologia: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

export const CategoryTag: React.FC<CategoryTagProps> = ({
  label,
  category = 'default',
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide ${colorMap[category]} ${className}`}
    >
      {label}
    </span>
  );
};
