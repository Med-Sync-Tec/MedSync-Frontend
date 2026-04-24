import React from 'react';
import { CategoryTag } from '../badges/CategoryTag';
import { MatchTag } from '../badges/MatchTag';
import { IconButton } from '../buttons/IconButton';

type CategoryType = 'cardiologia' | 'farmacologia' | 'endocrinologia' | 'infecciosas' | 'neurologia' | 'default';
type ArticleCardVariant = 'full' | 'compact';

const sidebarColor: Record<CategoryType, string> = {
  cardiologia:    'bg-red-500',
  farmacologia:   'bg-purple-500',
  endocrinologia: 'bg-orange-500',
  infecciosas:    'bg-teal-500',
  neurologia:     'bg-indigo-500',
  default:        'bg-gray-400',
};

const sidebarIcon: Record<CategoryType, string> = {
  cardiologia:    'favorite',
  farmacologia:   'medication',
  endocrinologia: 'water_drop',
  infecciosas:    'coronavirus',
  neurologia:     'neurology',
  default:        'article',
};

interface ArticleCardProps {
  category: string;
  categoryType?: CategoryType;
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
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex items-stretch ${className}`}>
      {/* Colored left strip with icon */}
      <div className={`shrink-0 w-20 sm:w-24 flex items-center justify-center ${sidebarColor[categoryType]}`}>
        <span className="material-symbols-outlined text-[26px] text-white">{sidebarIcon[categoryType]}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col py-3 px-4 sm:py-3.5 sm:px-5 gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <CategoryTag label={category} category={categoryType} />
            <span className="text-xs text-gray-400 shrink-0">{timestamp}</span>
          </div>
          {matchText && <MatchTag text={matchText} variant={matchVariant} />}
        </div>
        <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-snug line-clamp-1">{title}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{excerpt}</p>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span className="text-xs text-gray-400 font-medium truncate">{source}</span>
          <IconButton
            icon={<span className="material-symbols-outlined text-xl">{saved ? 'bookmark' : 'bookmark_border'}</span>}
            onClick={onSave}
            title={saved ? 'Quitar de guardados' : 'Guardar'}
            className="w-7 h-7 shrink-0"
          />
        </div>
      </div>
    </div>
  );
};
