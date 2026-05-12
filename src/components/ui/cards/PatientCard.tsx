import React, { forwardRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { Avatar } from '../avatars/Avatar';

export type PatientCardStatus = 'estable' | 'critico' | 'en-observacion' | 'alta';

export interface PatientCardProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  name: string;
  patientId: string;
  status?: PatientCardStatus;
  needsAttention?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

const BASE_STYLES =
  'group relative w-full flex items-center gap-3 pl-3 pr-2 py-2.5 rounded-xl text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring';

const STATE_STYLES = {
  idle:
    'bg-transparent hover:bg-surface-subtle border border-transparent hover:border-border-subtle',
  selected:
    'bg-primary-subtle border border-primary/25 shadow-card',
} as const;

const STATUS_RING: Record<PatientCardStatus, string> = {
  estable: 'ring-status-stable-ring/40',
  critico: 'ring-status-critical-ring/60',
  'en-observacion': 'ring-status-observation-ring/55',
  alta: 'ring-status-discharge-ring/45',
};

export const PatientCard = forwardRef<HTMLButtonElement, PatientCardProps>(function PatientCard(
  {
    name,
    patientId,
    status,
    needsAttention = false,
    selected = false,
    onClick,
    className = '',
    type = 'button',
    ...rest
  },
  ref
) {
  const state = selected ? 'selected' : 'idle';
  const ringClass = status ? STATUS_RING[status] : 'ring-border-strong/40';

  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      aria-pressed={selected}
      className={`${BASE_STYLES} ${STATE_STYLES[state]} ${className}`}
      {...rest}
    >
      <span
        aria-hidden="true"
        className={`absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full transition-all ${
          selected ? 'bg-primary opacity-100' : 'bg-primary opacity-0 group-hover:opacity-40'
        }`}
      />

      <span className={`relative shrink-0 rounded-full ring-2 ring-offset-2 ring-offset-transparent ${ringClass}`}>
        <Avatar name={name} size="md" />
        {needsAttention && (
          <span
            aria-hidden="true"
            className="absolute -top-0.5 -right-0.5 inline-flex w-2.5 h-2.5"
          >
            <span className="absolute inline-flex w-full h-full rounded-full text-danger medsync-pulse-ring" />
            <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-danger ring-2 ring-surface medsync-pulse-dot" />
          </span>
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={`block text-sm font-semibold tracking-tight truncate ${
            selected ? 'text-primary' : 'text-text-primary'
          }`}
        >
          {name}
        </span>
        <span className="mt-0.5 flex items-center gap-1.5">
          <span className="font-mono text-[11px] text-text-subtle tracking-tight">#{patientId}</span>
          {needsAttention && (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-danger">
              Atención
            </span>
          )}
        </span>
      </span>

      <ChevronRight
        size={16}
        strokeWidth={2}
        aria-hidden="true"
        className={`shrink-0 text-text-subtle transition-all ${
          selected
            ? 'opacity-100 translate-x-0 text-primary'
            : 'opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0'
        }`}
      />
    </button>
  );
});
