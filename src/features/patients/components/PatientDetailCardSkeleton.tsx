import React from 'react';

export const PatientDetailCardSkeleton: React.FC = () => {
  return (
    <article
      role="status"
      aria-live="polite"
      aria-label="Cargando datos del paciente"
      className="rounded-2xl border border-border-subtle bg-surface shadow-card overflow-hidden"
    >
      <header className="px-5 pt-5 pb-4 border-b border-border-subtle">
        <div className="flex items-start gap-3">
          <span
            className="w-11 h-11 rounded-full bg-surface-muted animate-pulse shrink-0"
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1 space-y-2">
            <span className="block h-4 w-3/4 rounded bg-surface-muted animate-pulse" aria-hidden="true" />
            <span className="block h-3 w-1/2 rounded bg-surface-muted animate-pulse" aria-hidden="true" />
            <span className="block h-2.5 w-1/3 rounded bg-surface-muted animate-pulse" aria-hidden="true" />
          </div>
        </div>
      </header>

      <section className="px-5 py-4 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <span className="h-3 w-1/3 rounded bg-surface-muted animate-pulse" aria-hidden="true" />
            <span className="h-3 w-2/5 rounded bg-surface-muted animate-pulse" aria-hidden="true" />
          </div>
        ))}
      </section>

      <section className="grid grid-cols-2 gap-px bg-border-subtle border-y border-border-subtle">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-surface-subtle px-4 py-4 space-y-2">
            <span className="block h-2.5 w-2/3 rounded bg-surface-muted animate-pulse" aria-hidden="true" />
            <span className="block h-5 w-1/2 rounded bg-surface-muted animate-pulse" aria-hidden="true" />
            <span className="block h-2.5 w-1/3 rounded bg-surface-muted animate-pulse" aria-hidden="true" />
          </div>
        ))}
      </section>

      <div className="px-5 py-4 flex items-center gap-2">
        <span className="h-8 w-20 rounded-md bg-surface-muted animate-pulse" aria-hidden="true" />
        <span className="h-8 w-8 rounded-md bg-surface-muted animate-pulse" aria-hidden="true" />
        <span className="h-8 w-8 rounded-md bg-surface-muted animate-pulse" aria-hidden="true" />
      </div>
    </article>
  );
};

export const ConsultationTimelineSkeleton: React.FC<{ items?: number }> = ({ items = 4 }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Cargando historial de consultas"
      className="space-y-3"
    >
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl border border-border-subtle bg-surface px-4 py-3"
        >
          <span className="w-12 h-12 rounded-lg bg-surface-muted animate-pulse shrink-0" aria-hidden="true" />
          <div className="min-w-0 flex-1 space-y-2">
            <span className="block h-2.5 w-1/4 rounded bg-surface-muted animate-pulse" aria-hidden="true" />
            <span className="block h-4 w-3/5 rounded bg-surface-muted animate-pulse" aria-hidden="true" />
            <span className="block h-3 w-4/5 rounded bg-surface-muted animate-pulse" aria-hidden="true" />
          </div>
          <span className="h-8 w-20 rounded-lg bg-surface-muted animate-pulse shrink-0" aria-hidden="true" />
        </div>
      ))}
    </div>
  );
};
