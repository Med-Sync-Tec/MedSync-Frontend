import React from 'react';
import { Link2 } from 'lucide-react';
import type { ContextoTipo } from '@features/patients/schemas';
import { TIPO_PALETTES } from '../palette';

interface TagChipProps {
  tipo: ContextoTipo;
  valor: string;
  matched: boolean;
  /** Optional click handler — when present the chip is rendered as a button. */
  onClick?: () => void;
  ariaLabel?: string;
  title?: string;
  /** Renders a small "× N" superscript inside the chip (used on contexto chips). */
  count?: number;
  /** Force a muted style even when not matched (e.g., contexto with 0 article hits). */
  forceMuted?: boolean;
  /** Selected outline ring — used for contexto chips when active as a filter. */
  selected?: boolean;
  /** Trailing children (e.g., the contexto delete X button). */
  trailing?: React.ReactNode;
}

/**
 * Shared chip primitive for matching tags & contexto entries. Color comes
 * from {@link TIPO_PALETTES}; matched state swaps to the solid {@code active}
 * fill and prepends the link icon — that icon is the metaphor "this chip
 * is connected to something on the other side of the screen".
 */
export const TagChip: React.FC<TagChipProps> = ({
  tipo,
  valor,
  matched,
  onClick,
  ariaLabel,
  title,
  count,
  forceMuted = false,
  selected = false,
  trailing,
}) => {
  const palette = TIPO_PALETTES[tipo];
  const isActive = matched && !forceMuted;
  const colorClass = isActive ? palette.active : palette.muted;
  const ringClass = selected
    ? 'ring-2 ring-offset-1 ring-offset-surface ring-text-primary/60'
    : '';
  const interactiveClass = onClick
    ? 'hover:brightness-95 active:brightness-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring cursor-pointer'
    : '';
  const mutedExtra = forceMuted ? 'opacity-60' : '';

  const inner = (
    <>
      {isActive && (
        <Link2
          size={11}
          strokeWidth={2.5}
          aria-hidden="true"
          className="shrink-0"
        />
      )}
      <span className="max-w-[200px] truncate" title={title ?? valor}>
        {valor}
      </span>
      {typeof count === 'number' && count > 0 && (
        <span
          className={`shrink-0 inline-flex items-center gap-0.5 text-[10px] font-mono font-semibold tabular-nums ${
            isActive ? 'text-white/90' : 'text-text-muted'
          }`}
          aria-label={`Aparece en ${count} artículos relevantes`}
        >
          <Link2 size={9} strokeWidth={2.5} aria-hidden="true" />
          {count}
        </span>
      )}
      {trailing}
    </>
  );

  const baseClass = `inline-flex items-center gap-1 pl-2 pr-2 py-0.5 rounded-full border text-[11px] font-medium tracking-tight transition-colors ${colorClass} ${ringClass} ${interactiveClass} ${mutedExtra}`;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        aria-pressed={selected}
        className={baseClass}
      >
        {inner}
      </button>
    );
  }

  return (
    <span className={baseClass} aria-label={ariaLabel}>
      {inner}
    </span>
  );
};
