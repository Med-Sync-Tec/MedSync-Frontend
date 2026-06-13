import { TIPO_PALETTES, TIPO_ORDER, tipoLabel } from './palette';
import { CONTEXTO_TIPOS } from '@features/patients/schemas';

describe('TIPO_PALETTES', () => {
  it('defines a palette for every contexto tipo', () => {
    for (const tipo of CONTEXTO_TIPOS) {
      expect(TIPO_PALETTES[tipo]).toBeDefined();
    }
  });

  it.each(CONTEXTO_TIPOS)('palette for %s has all four visual fields', (tipo) => {
    const palette = TIPO_PALETTES[tipo];

    expect(palette.label).toBeTruthy();
    expect(palette.muted).toMatch(/bg-/);
    expect(palette.active).toMatch(/bg-/);
    expect(palette.dot).toMatch(/bg-/);
  });

  it('uses distinct hues per tipo', () => {
    const dots = Object.values(TIPO_PALETTES).map((p) => p.dot);

    expect(new Set(dots).size).toBe(dots.length);
  });
});

describe('TIPO_ORDER', () => {
  it('covers all tipos exactly once in the documented order', () => {
    expect(TIPO_ORDER).toEqual(['enfermedad', 'sintoma', 'tratamiento', 'medicamento']);
  });
});

describe('tipoLabel', () => {
  it.each([
    ['enfermedad', 'Enfermedad'],
    ['sintoma', 'Síntoma'],
    ['tratamiento', 'Tratamiento'],
    ['medicamento', 'Medicamento'],
  ] as const)('returns the Spanish label for %s', (tipo, expected) => {
    expect(tipoLabel(tipo)).toBe(expected);
  });
});
