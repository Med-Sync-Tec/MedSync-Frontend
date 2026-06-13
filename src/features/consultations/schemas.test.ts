import {
  ConsultationTypeSchema,
  SOAPDataSchema,
  ConsultationSummarySchema,
  ConsultationSchema,
  ConsultaSchema,
  CreateConsultaInputSchema,
  VocabularyStatusSchema,
  ConsultaSuggestionSchema,
  ConsultaAnalysisResponseSchema,
} from './schemas';

const VALID_SOAP = {
  subjective: 'Dolor de cabeza',
  objective: 'TA 120/80',
  assessment: 'Migraña',
  plan: 'Paracetamol',
};

const VALID_SUMMARY = {
  id: 'c1',
  date: '2024-05-10',
  reason: 'Cefalea',
  diagnosis: 'Migraña',
  type: 'general',
};

describe('ConsultationTypeSchema', () => {
  it('accepts the three known consultation types', () => {
    expect(ConsultationTypeSchema.parse('general')).toBe('general');
    expect(ConsultationTypeSchema.parse('especialista')).toBe('especialista');
    expect(ConsultationTypeSchema.parse('seguimiento')).toBe('seguimiento');
  });

  it('rejects unknown consultation types', () => {
    expect(ConsultationTypeSchema.safeParse('urgencia').success).toBe(false);
  });
});

describe('SOAPDataSchema', () => {
  it('parses a complete SOAP object', () => {
    expect(SOAPDataSchema.parse(VALID_SOAP)).toEqual(VALID_SOAP);
  });

  it('rejects an object with a missing section', () => {
    const incomplete = {
      subjective: VALID_SOAP.subjective,
      objective: VALID_SOAP.objective,
      assessment: VALID_SOAP.assessment,
    };
    expect(SOAPDataSchema.safeParse(incomplete).success).toBe(false);
  });
});

describe('ConsultationSummarySchema', () => {
  it('parses a valid summary', () => {
    expect(ConsultationSummarySchema.parse(VALID_SUMMARY)).toEqual(VALID_SUMMARY);
  });

  it('rejects a summary with an invalid type', () => {
    expect(
      ConsultationSummarySchema.safeParse({ ...VALID_SUMMARY, type: 'otro' }).success,
    ).toBe(false);
  });
});

describe('ConsultationSchema', () => {
  it('parses a full consultation extending the summary', () => {
    const parsed = ConsultationSchema.parse({
      ...VALID_SUMMARY,
      doctorName: 'Dra. López',
      soap: VALID_SOAP,
    });

    expect(parsed.doctorName).toBe('Dra. López');
    expect(parsed.soap).toEqual(VALID_SOAP);
  });

  it('rejects a consultation without soap data', () => {
    expect(
      ConsultationSchema.safeParse({ ...VALID_SUMMARY, doctorName: 'Dr. X' }).success,
    ).toBe(false);
  });
});

describe('ConsultaSchema', () => {
  const base = {
    id: 'c1',
    fecha: '2024-05-10T10:00:00',
    createdAt: '2024-05-10T10:05:00',
  };

  it('transforms null SOAP fields into empty strings', () => {
    const parsed = ConsultaSchema.parse({
      ...base,
      motivoConsulta: null,
      subjetivo: null,
      objetivo: null,
      evaluacion: null,
      plan: null,
      prescripcion: null,
      diagnostico: null,
    });

    expect(parsed.motivoConsulta).toBe('');
    expect(parsed.subjetivo).toBe('');
    expect(parsed.objetivo).toBe('');
    expect(parsed.evaluacion).toBe('');
    expect(parsed.plan).toBe('');
    expect(parsed.prescripcion).toBe('');
    expect(parsed.diagnostico).toBe('');
  });

  it('transforms missing SOAP fields into empty strings', () => {
    const parsed = ConsultaSchema.parse(base);

    expect(parsed.motivoConsulta).toBe('');
    expect(parsed.diagnostico).toBe('');
  });

  it('preserves provided SOAP field values', () => {
    const parsed = ConsultaSchema.parse({
      ...base,
      motivoConsulta: 'Dolor',
      subjetivo: 'Subj',
      diagnostico: 'Dx',
    });

    expect(parsed.motivoConsulta).toBe('Dolor');
    expect(parsed.subjetivo).toBe('Subj');
    expect(parsed.diagnostico).toBe('Dx');
  });

  it('rejects when id or fecha are missing', () => {
    expect(ConsultaSchema.safeParse({ fecha: 'x', createdAt: 'y' }).success).toBe(false);
    expect(ConsultaSchema.safeParse({ id: 'c1', createdAt: 'y' }).success).toBe(false);
  });
});

describe('CreateConsultaInputSchema', () => {
  it('requires a non-empty fecha', () => {
    const result = CreateConsultaInputSchema.safeParse({ fecha: '' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['fecha']);
      expect(result.error.issues[0].message).toBe('Requerido');
    }
  });

  it('parses with only fecha and leaves optional fields undefined', () => {
    const result = CreateConsultaInputSchema.parse({ fecha: '2024-05-10T10:00:00' });

    expect(result.fecha).toBe('2024-05-10T10:00:00');
    expect(result.motivoConsulta).toBeUndefined();
    expect(result.subjetivo).toBeUndefined();
    expect(result.objetivo).toBeUndefined();
    expect(result.evaluacion).toBeUndefined();
    expect(result.plan).toBeUndefined();
    expect(result.prescripcion).toBeUndefined();
    expect(result.diagnostico).toBeUndefined();
  });

  it('trims optional fields and converts whitespace-only values to undefined', () => {
    const result = CreateConsultaInputSchema.parse({
      fecha: '2024-05-10T10:00:00',
      motivoConsulta: '  Dolor abdominal  ',
      subjetivo: '   ',
      objetivo: '',
      evaluacion: '  Eval  ',
      plan: '  Plan  ',
      prescripcion: '   ',
      diagnostico: '  Dx  ',
    });

    expect(result.motivoConsulta).toBe('Dolor abdominal');
    expect(result.subjetivo).toBeUndefined();
    expect(result.objetivo).toBeUndefined();
    expect(result.evaluacion).toBe('Eval');
    expect(result.plan).toBe('Plan');
    expect(result.prescripcion).toBeUndefined();
    expect(result.diagnostico).toBe('Dx');
  });

  it.each([
    ['motivoConsulta', 2000],
    ['diagnostico', 2000],
    ['subjetivo', 5000],
    ['objetivo', 5000],
    ['evaluacion', 5000],
    ['plan', 5000],
    ['prescripcion', 5000],
  ] as const)('rejects %s longer than %i characters', (field, max) => {
    const result = CreateConsultaInputSchema.safeParse({
      fecha: '2024-05-10T10:00:00',
      [field]: 'x'.repeat(max + 1),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual([field]);
      expect(result.error.issues[0].message).toBe(`Máximo ${max} caracteres`);
    }
  });

  it.each([
    ['motivoConsulta', 2000],
    ['subjetivo', 5000],
  ] as const)('accepts %s with exactly %i characters', (field, max) => {
    const result = CreateConsultaInputSchema.safeParse({
      fecha: '2024-05-10T10:00:00',
      [field]: 'x'.repeat(max),
    });

    expect(result.success).toBe(true);
  });
});

describe('VocabularyStatusSchema', () => {
  it('accepts POPULATED and EMPTY', () => {
    expect(VocabularyStatusSchema.parse('POPULATED')).toBe('POPULATED');
    expect(VocabularyStatusSchema.parse('EMPTY')).toBe('EMPTY');
  });

  it('rejects unknown statuses', () => {
    expect(VocabularyStatusSchema.safeParse('PARTIAL').success).toBe(false);
  });
});

describe('ConsultaSuggestionSchema', () => {
  it('parses a suggestion with tipo and valor', () => {
    expect(ConsultaSuggestionSchema.parse({ tipo: 'enfermedad', valor: 'Asma' })).toEqual({
      tipo: 'enfermedad',
      valor: 'Asma',
    });
  });

  it('rejects a suggestion without valor', () => {
    expect(ConsultaSuggestionSchema.safeParse({ tipo: 'sintoma' }).success).toBe(false);
  });
});

describe('ConsultaAnalysisResponseSchema', () => {
  const validResponse = {
    consultaId: 'c1',
    especialidadId: 'e1',
    especialidadSlug: 'cardiologia',
    vocabularyStatus: 'POPULATED',
    suggestions: [{ tipo: 'enfermedad', valor: 'Hipertensión' }],
    modelUsed: 'llama-3.3-70b',
    promptTokens: 120,
    completionTokens: 45,
  };

  it('parses a valid analysis response', () => {
    expect(ConsultaAnalysisResponseSchema.parse(validResponse)).toEqual(validResponse);
  });

  it('parses an empty suggestions array', () => {
    const parsed = ConsultaAnalysisResponseSchema.parse({
      ...validResponse,
      vocabularyStatus: 'EMPTY',
      suggestions: [],
    });

    expect(parsed.suggestions).toEqual([]);
    expect(parsed.vocabularyStatus).toBe('EMPTY');
  });

  it('rejects non-integer token counts', () => {
    expect(
      ConsultaAnalysisResponseSchema.safeParse({ ...validResponse, promptTokens: 1.5 }).success,
    ).toBe(false);
  });

  it('rejects an invalid vocabularyStatus', () => {
    expect(
      ConsultaAnalysisResponseSchema.safeParse({
        ...validResponse,
        vocabularyStatus: 'UNKNOWN',
      }).success,
    ).toBe(false);
  });
});
