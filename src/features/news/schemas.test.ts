import {
  TipoClinicoSchema,
  ArticleTagSchema,
  AnalyzeArticleResponseSchema,
} from './schemas';

describe('TipoClinicoSchema', () => {
  it.each(['enfermedad', 'sintoma', 'tratamiento', 'medicamento'] as const)(
    'accepts the lowercase clinical type "%s"',
    (tipo) => {
      expect(TipoClinicoSchema.parse(tipo)).toBe(tipo);
    },
  );

  it('rejects uppercase variants', () => {
    expect(TipoClinicoSchema.safeParse('ENFERMEDAD').success).toBe(false);
  });

  it('rejects unknown values', () => {
    expect(TipoClinicoSchema.safeParse('diagnostico').success).toBe(false);
  });
});

describe('ArticleTagSchema', () => {
  it('accepts a tag with a canonical lowercase tipo', () => {
    // Arrange
    const tag = { id: 't1', tipo: 'enfermedad', valor: 'hipertensión' };

    // Act
    const parsed = ArticleTagSchema.parse(tag);

    // Assert
    expect(parsed).toEqual(tag);
  });

  it('accepts a tag with an arbitrary string tipo (backend uppercase)', () => {
    // Arrange
    const tag = { id: 't2', tipo: 'MEDICAMENTO', valor: 'metformina' };

    // Act
    const parsed = ArticleTagSchema.parse(tag);

    // Assert
    expect(parsed.tipo).toBe('MEDICAMENTO');
  });

  it('rejects a tag missing valor', () => {
    expect(ArticleTagSchema.safeParse({ id: 't3', tipo: 'sintoma' }).success).toBe(false);
  });

  it('rejects a tag with a non-string tipo', () => {
    expect(
      ArticleTagSchema.safeParse({ id: 't4', tipo: 42, valor: 'fiebre' }).success,
    ).toBe(false);
  });
});

describe('AnalyzeArticleResponseSchema', () => {
  const validResponse = {
    articleId: 'a1',
    especialidadId: 'esp-1',
    especialidadNombre: 'Cardiología',
    tags: [{ id: 't1', tipo: 'ENFERMEDAD', valor: 'hipertensión' }],
    modelUsed: 'llama-3.3-70b-versatile',
    promptTokens: 500,
    completionTokens: 80,
    hadAbstract: true,
  };

  it('parses a fully-populated response', () => {
    expect(AnalyzeArticleResponseSchema.parse(validResponse)).toEqual(validResponse);
  });

  it('accepts null especialidadId and especialidadNombre', () => {
    // Arrange
    const response = { ...validResponse, especialidadId: null, especialidadNombre: null };

    // Act
    const parsed = AnalyzeArticleResponseSchema.parse(response);

    // Assert
    expect(parsed.especialidadId).toBeNull();
    expect(parsed.especialidadNombre).toBeNull();
  });

  it('accepts an empty tags array', () => {
    const parsed = AnalyzeArticleResponseSchema.parse({ ...validResponse, tags: [] });
    expect(parsed.tags).toEqual([]);
  });

  it('accepts hadAbstract=false', () => {
    const parsed = AnalyzeArticleResponseSchema.parse({ ...validResponse, hadAbstract: false });
    expect(parsed.hadAbstract).toBe(false);
  });

  it('rejects undefined especialidadId (must be present, even if null)', () => {
    // Arrange
    const withoutEspecialidad: Partial<typeof validResponse> = { ...validResponse };
    delete withoutEspecialidad.especialidadId;

    // Act + Assert
    expect(AnalyzeArticleResponseSchema.safeParse(withoutEspecialidad).success).toBe(false);
  });

  it('rejects non-integer token counts', () => {
    expect(
      AnalyzeArticleResponseSchema.safeParse({ ...validResponse, promptTokens: 1.5 }).success,
    ).toBe(false);
  });

  it('rejects string token counts', () => {
    expect(
      AnalyzeArticleResponseSchema.safeParse({ ...validResponse, completionTokens: '80' }).success,
    ).toBe(false);
  });

  it('rejects a non-boolean hadAbstract', () => {
    expect(
      AnalyzeArticleResponseSchema.safeParse({ ...validResponse, hadAbstract: 'yes' }).success,
    ).toBe(false);
  });

  it('rejects tags with missing fields', () => {
    expect(
      AnalyzeArticleResponseSchema.safeParse({
        ...validResponse,
        tags: [{ id: 't1', tipo: 'ENFERMEDAD' }],
      }).success,
    ).toBe(false);
  });
});
