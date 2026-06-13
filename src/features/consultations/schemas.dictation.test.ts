import { SOAPDictationResultSchema } from './schemas';

describe('SOAPDictationResultSchema', () => {
  it('accepts object with all fields', () => {
    expect(() => SOAPDictationResultSchema.parse({
      motivoConsulta: 'Dolor abdominal',
      subjetivo: 'Fiebre y dolor',
      objetivo: 'Abdomen rígido',
      evaluacion: 'Apendicitis probable',
      diagnostico: 'Apendicitis aguda',
      plan: 'Derivar a cirugía',
      prescripcion: 'Ibuprofeno 400mg',
    })).not.toThrow();
  });

  it('accepts object with partial fields (nulls)', () => {
    expect(() => SOAPDictationResultSchema.parse({
      motivoConsulta: 'Dolor de cabeza',
      subjetivo: 'Cefalea',
      objetivo: null,
      evaluacion: null,
      diagnostico: null,
      plan: null,
      prescripcion: null,
    })).not.toThrow();
  });

  it('accepts object with undefined fields', () => {
    expect(() => SOAPDictationResultSchema.parse({
      motivoConsulta: 'Solo motivo',
    })).not.toThrow();
  });

  it('rejects a plain string', () => {
    expect(() => SOAPDictationResultSchema.parse('invalid')).toThrow();
  });
});
