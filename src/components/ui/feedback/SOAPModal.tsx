import React, { useEffect } from 'react';
import {
  Brain,
  ClipboardList,
  FileText,
  MessageSquareText,
  Stethoscope,
  X,
  type LucideIcon,
} from 'lucide-react';
import type { SOAPData } from '@features/consultations/types';

export type { SOAPData } from '@features/consultations/types';

interface SOAPModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  doctorName: string;
  soap: SOAPData;
}

type SectionKey = 'S' | 'O' | 'A' | 'P';

interface SectionMeta {
  letter: SectionKey;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  accent: string;
  accentBar: string;
  chipBg: string;
  chipText: string;
}

const SECTIONS: ReadonlyArray<SectionMeta> = [
  {
    letter: 'S',
    title: 'Subjetivo',
    subtitle: 'Lo que refiere el paciente',
    icon: MessageSquareText,
    accent: 'text-indigo-600 dark:text-indigo-400',
    accentBar: 'bg-indigo-500/70 dark:bg-indigo-400/60',
    chipBg: 'bg-indigo-500/10 dark:bg-indigo-400/15',
    chipText: 'text-indigo-700 dark:text-indigo-300',
  },
  {
    letter: 'O',
    title: 'Objetivo',
    subtitle: 'Hallazgos clínicos',
    icon: Stethoscope,
    accent: 'text-sky-600 dark:text-sky-400',
    accentBar: 'bg-sky-500/70 dark:bg-sky-400/60',
    chipBg: 'bg-sky-500/10 dark:bg-sky-400/15',
    chipText: 'text-sky-700 dark:text-sky-300',
  },
  {
    letter: 'A',
    title: 'Análisis',
    subtitle: 'Evaluación y diagnóstico',
    icon: Brain,
    accent: 'text-violet-600 dark:text-violet-400',
    accentBar: 'bg-violet-500/70 dark:bg-violet-400/60',
    chipBg: 'bg-violet-500/10 dark:bg-violet-400/15',
    chipText: 'text-violet-700 dark:text-violet-300',
  },
  {
    letter: 'P',
    title: 'Plan',
    subtitle: 'Tratamiento y seguimiento',
    icon: ClipboardList,
    accent: 'text-emerald-600 dark:text-emerald-400',
    accentBar: 'bg-emerald-500/70 dark:bg-emerald-400/60',
    chipBg: 'bg-emerald-500/10 dark:bg-emerald-400/15',
    chipText: 'text-emerald-700 dark:text-emerald-300',
  },
];

const SECTION_KEY_TO_FIELD: Record<SectionKey, keyof SOAPData> = {
  S: 'subjective',
  O: 'objective',
  A: 'assessment',
  P: 'plan',
};

export const SOAPModal: React.FC<SOAPModalProps> = ({
  isOpen,
  onClose,
  date,
  doctorName,
  soap,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formattedDate = new Date(date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <dialog
      open
      aria-modal="true"
      aria-labelledby="soap-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent border-0 max-w-none w-full h-full"
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-popover animate-in fade-in zoom-in duration-150">
        <header className="flex items-start justify-between gap-4 px-6 py-5 border-b border-border-subtle bg-surface-subtle">
          <div className="flex items-center gap-3 min-w-0">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary-subtle text-primary ring-1 ring-primary/15">
              <FileText size={18} strokeWidth={2.25} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2
                id="soap-modal-title"
                className="text-base font-semibold tracking-tight text-text-primary"
              >
                Resumen SOAP
              </h2>
              <p className="text-xs text-text-muted truncate">
                <span className="font-medium text-text-primary">{formattedDate}</span>
                <span className="mx-1.5 text-text-subtle">•</span>
                Dr. {doctorName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            aria-label="Cerrar resumen"
          >
            <X size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const content = soap[SECTION_KEY_TO_FIELD[section.letter]];
              return (
                <section
                  key={section.letter}
                  className="relative flex flex-col rounded-xl border border-border-subtle bg-surface-subtle/60 overflow-hidden"
                >
                  <span
                    aria-hidden="true"
                    className={`absolute inset-y-0 left-0 w-[3px] ${section.accentBar}`}
                  />
                  <div className="flex items-center gap-2.5 px-4 pt-4 pb-2">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-[13px] font-bold ${section.chipBg} ${section.chipText}`}
                    >
                      {section.letter}
                    </span>
                    <div className="flex flex-col leading-tight min-w-0">
                      <h3 className={`text-[13px] font-semibold tracking-tight ${section.accent}`}>
                        {section.title}
                      </h3>
                      <span className="text-[11px] text-text-subtle truncate">
                        {section.subtitle}
                      </span>
                    </div>
                    <Icon
                      size={16}
                      strokeWidth={2}
                      aria-hidden="true"
                      className={`ml-auto ${section.accent} opacity-60`}
                    />
                  </div>
                  <p className="px-4 pb-4 pt-1 text-sm leading-relaxed text-text-primary whitespace-pre-line">
                    {content}
                  </p>
                </section>
              );
            })}
          </div>
        </div>

        <footer className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border-subtle bg-surface-subtle">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium tracking-tight hover:bg-primary-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            Cerrar
          </button>
        </footer>
      </div>
    </dialog>
  );
};
