import React from 'react';
import { CategoryTag } from '../badges/CategoryTag';
import { MatchTag } from '../badges/MatchTag';
import { IconButton } from '../buttons/IconButton';

type ArticleCardVariant = 'full' | 'compact';

interface ArticleCardProps {
  category: string;
  categoryType?: 'cardiologia' | 'farmacologia' | 'endocrinologia' | 'infecciosas' | 'neurologia' | 'default';
  timestamp: string;
  title: string;
  excerpt: string;
  source: string;
  matchText?: string;
  matchVariant?: 'normal' | 'alert';
  saved?: boolean;
  onSave?: () => void;
  variant?: ArticleCardVariant;
  className?: string;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  category,
  categoryType = 'default',
  timestamp,
  title,
  excerpt,
  source,
  matchText,
  matchVariant = 'normal',
  saved = false,
  onSave,
  variant = 'full',
  className = '',
}) => {
  if (variant === 'compact') {
    return (
      <div className={`flex gap-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow ${className}`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <CategoryTag label={category} category={categoryType} />
            <span className="text-xs text-gray-400">{timestamp}</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">{title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{source}</p>
        </div>
        <button
          type="button"
          onClick={onSave}
          className="shrink-0 text-gray-400 hover:text-primary transition-colors"
          aria-label={saved ? 'Quitar de guardados' : 'Guardar artículo'}
        >
          <span className="material-symbols-outlined text-xl">{saved ? 'bookmark' : 'bookmark_border'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden ${className}`}>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <CategoryTag label={category} category={categoryType} />
          <span className="text-xs text-gray-400">{timestamp}</span>
        </div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-3">{excerpt}</p>
      </div>
      <div className="px-5 pb-5 flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium">{source}</span>
          {matchText && <MatchTag text={matchText} variant={matchVariant} />}
        </div>
        <IconButton
          icon={
            <span className="material-symbols-outlined text-xl">{saved ? 'bookmark' : 'bookmark_border'}</span>
          }
          onClick={onSave}
          title={saved ? 'Quitar de guardados' : 'Guardar'}
          className="w-8 h-8"
        />
      </div>
    </div>
  );
};
