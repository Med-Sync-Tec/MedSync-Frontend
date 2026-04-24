import React from 'react';
import { Bookmark, Construction } from 'lucide-react';

export const SavedNewsPage: React.FC = () => {
  return (
    <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-6">
      <header className="space-y-1 mb-6">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-text-muted">
          <Bookmark size={12} strokeWidth={2} aria-hidden="true" />
          Biblioteca
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-text-primary">
          Noticias guardadas
        </h1>
        <p className="text-sm text-text-muted">
          Tus artículos médicos marcados para consulta posterior.
        </p>
      </header>

      <section className="flex flex-col items-center justify-center text-center py-20 rounded-2xl border border-dashed border-border-strong bg-surface-subtle">
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-muted text-text-muted mb-4">
          <Construction size={20} strokeWidth={2} aria-hidden="true" />
        </span>
        <h2 className="text-sm font-semibold text-text-primary tracking-tight">
          En construcción
        </h2>
        <p className="mt-1 text-xs text-text-muted max-w-sm">
          Pronto podrás guardar artículos desde el feed de Noticias Médicas Relevantes y
          encontrarlos aquí organizados por especialidad y relevancia clínica.
        </p>
      </section>
    </main>
  );
};
