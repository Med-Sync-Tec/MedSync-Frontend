import React from 'react';
import { ChevronRight, FileText } from 'lucide-react';
import type { ConsultationSummary, ConsultationType } from '@features/consultations/types';

export type { ConsultationSummary } from '@features/consultations/types';

interface ConsultationCardProps {
  consultation: ConsultationSummary;
  onViewSOAP: (id: string) => void;
  className?: string;
}

const TYPE_LABELS: Record<ConsultationType, string> = {
  general: 'Medicina general',
  especialista: 'Especialista',
  seguimiento: 'Seguimiento',
};

const CARD_STYLES =
  'group relative flex items-center gap-4 rounded-xl border border-border-subtle bg-surface px-4 py-3 shadow-card hover:border-primary/30 hover:shadow-elevated transition-all duration-200 focus-within:ring-2 focus-within:ring-focus-ring';

const DATE_BLOCK_STYLES =
  'shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-lg border border-border-subtle bg-surface-subtle';

const monthFormatter = new Intl.DateTimeFormat('es-MX', { month: 'short' });
const dayFormatter = new Intl.DateTimeFormat('es-MX', { day: '2-digit' });
const yearFormatter = new Intl.DateTimeFormat('es-MX', { year: 'numeric' });

function cleanMonth(value: string): string {
  return value.replace('.', '').toUpperCase();
}

export const ConsultationCard: React.FC<ConsultationCardProps> = ({
  consultation,
  onViewSOAP,
  className = '',
}) => {
  const date = new Date(consultation.date);
  const hasValidDate = !Number.isNaN(date.getTime());

  return (
    <article className={`${CARD_STYLES} ${className}`}>
      <div className={DATE_BLOCK_STYLES} aria-hidden="true">
        <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-text-muted">
          {hasValidDate ? cleanMonth(monthFormatter.format(date)) : '—'}
        </span>
        <span className="text-base font-semibold tracking-tight text-text-primary tabular-nums leading-none mt-0.5">
          {hasValidDate ? dayFormatter.format(date) : '—'}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-text-muted">
          <span className="truncate">{TYPE_LABELS[consultation.type]}</span>
          <span aria-hidden="true" className="w-1 h-1 rounded-full bg-border-strong" />
          <time dateTime={consultation.date} className="font-mono tracking-tight">
            {hasValidDate ? yearFormatter.format(date) : ''}
          </time>
        </div>
        <h3 className="mt-0.5 text-sm font-semibold tracking-tight text-text-primary truncate">
          {consultation.reason}
        </h3>
        <p className="text-xs text-text-muted truncate leading-snug">
          {consultation.diagnosis}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onViewSOAP(consultation.id)}
        className="shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border-subtle bg-surface text-xs font-medium text-text-primary hover:bg-primary-subtle hover:text-primary hover:border-primary/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        aria-label={`Ver SOAP de ${consultation.reason}`}
      >
        <FileText size={13} strokeWidth={2} aria-hidden="true" />
        <span className="hidden sm:inline">Ver SOAP</span>
        <ChevronRight
          size={13}
          strokeWidth={2}
          aria-hidden="true"
          className="transition-transform group-hover:translate-x-0.5"
        />
      </button>
    </article>
  );
};
