import React from 'react';
import { CategoryTag } from '../badges/CategoryTag';
import { MatchTag } from '../badges/MatchTag';

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
  onSave?: (e?: React.MouseEvent) => void;
  url?: string;
  variant?: ArticleCardVariant;
  className?: string;
  /**
   * Optional extra action rendered inline with the save bookmark — used by
   * the dashboard to drop in an "Analyze with AI" button without coupling
   * this design-system component to the news feature.
   */
  extraActions?: React.ReactNode;
}

/** Botón de guardado con animación bounce + color */
const BookmarkButton: React.FC<{
  saved: boolean;
  onSave?: (e?: React.MouseEvent) => void;
  size?: 'sm' | 'md';
}> = ({ saved, onSave, size = 'md' }) => {
  const textSize = size === 'sm' ? 'text-xl' : 'text-[22px]';

  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onSave?.(e); }}
      aria-label={saved ? 'Quitar de guardados' : 'Guardar artículo'}
      className={`
        relative shrink-0 flex items-center justify-center rounded-full w-8 h-8
        transition-colors duration-200 group
        ${saved
          ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40'
          : 'text-gray-400 bg-transparent hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
        }
      `}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {/* Ripple ring on save */}
      {saved && (
        <span
          className="absolute inset-0 rounded-full border-2 border-amber-400 opacity-0"
          style={{ animation: 'bookmarkRipple 0.5s ease-out forwards' }}
        />
      )}

      <span
        className={`material-symbols-outlined ${textSize} select-none transition-transform duration-200`}
        style={{
          animation: saved ? 'bookmarkBounce 0.4s cubic-bezier(0.36,0.07,0.19,0.97)' : undefined,
          fontVariationSettings: saved ? "'FILL' 1" : "'FILL' 0",
          color: saved ? '#f59e0b' : undefined,
        }}
      >
        bookmark
      </span>

      <style>{`
        @keyframes bookmarkBounce {
          0%   { transform: scale(1); }
          30%  { transform: scale(1.45); }
          55%  { transform: scale(0.88); }
          75%  { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        @keyframes bookmarkRipple {
          0%   { transform: scale(0.7); opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>
    </button>
  );
};

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
  // `url` stays in the prop type for caller compatibility but is no longer
  // consumed inside the card — the dashboard's drawer handles opening the
  // article. Not destructured here to avoid an unused-locals warning.
  variant = 'full',
  className = '',
  extraActions,
}) => {
  if (variant === 'compact') {
    return (
      <div className={`flex gap-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow ${className}`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <CategoryTag label={category} category={categoryType} />
            <span className="text-xs text-gray-400">{timestamp}</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
            {title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{source}</p>
        </div>
        <BookmarkButton saved={saved} onSave={onSave} size="sm" />
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
        <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-snug line-clamp-1">
          {title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{excerpt}</p>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span className="text-xs text-gray-400 font-medium truncate">{source}</span>
          <div className="flex items-center gap-1.5 shrink-0">
            {extraActions}
            <BookmarkButton saved={saved} onSave={onSave} />
          </div>
        </div>
      </div>
    </div>
  );
};
