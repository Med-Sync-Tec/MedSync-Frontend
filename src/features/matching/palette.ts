import type { ContextoTipo } from '@features/patients/schemas';

/**
 * Single source of truth for tipo colors. Reused by contexto chips, article
 * tag chips, and the "Why does this match?" side panel so a color always
 * means the same thing across the patient detail screen.
 *
 * Two visual densities per tipo:
 *  - {@code muted}   — non-matching state, default chip background.
 *  - {@code active}  — solid-fill highlight applied to matching pairs.
 */
export interface TipoPalette {
  label: string;
  muted: string;
  active: string;
  dot: string;
}

export const TIPO_PALETTES: Record<ContextoTipo, TipoPalette> = {
  enfermedad: {
    label: 'Enfermedad',
    muted: 'bg-rose-50 text-rose-700 border-rose-200',
    active: 'bg-rose-600 text-white border-rose-700 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]',
    dot: 'bg-rose-500',
  },
  sintoma: {
    label: 'Síntoma',
    muted: 'bg-amber-50 text-amber-700 border-amber-200',
    active: 'bg-amber-500 text-white border-amber-600 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]',
    dot: 'bg-amber-500',
  },
  tratamiento: {
    label: 'Tratamiento',
    muted: 'bg-sky-50 text-sky-700 border-sky-200',
    active: 'bg-sky-600 text-white border-sky-700 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]',
    dot: 'bg-sky-500',
  },
  medicamento: {
    label: 'Medicamento',
    muted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    active: 'bg-emerald-600 text-white border-emerald-700 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]',
    dot: 'bg-emerald-500',
  },
};

export const TIPO_ORDER: ContextoTipo[] = [
  'enfermedad',
  'sintoma',
  'tratamiento',
  'medicamento',
];

export function tipoLabel(tipo: ContextoTipo): string {
  return TIPO_PALETTES[tipo].label;
}
