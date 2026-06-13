import {
  MatchingArticleTagSchema,
  MatchingArticleSchema,
  EspecialidadSchema,
} from './schemas';

function omit(obj: Record<string, unknown>, key: string): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([k]) => k !== key));
}

const VALID_TAG = {
  id: 'tag-1',
  tipo: 'enfermedad',
  valor: 'diabetes',
};

const VALID_ARTICLE = {
  id: 'art-1',
  titulo: 'Manejo de diabetes tipo 2',
  autores: 'Pérez J, López A',
  revista: 'NEJM',
  anioPub: 2024,
  mesPub: 'Mar',
  doi: '10.1000/xyz',
  abstractText: 'Resumen…',
  keywords: 'diabetes, metformina',
  tipoPublicacion: 'Journal Article',
  url: 'https://example.com',
  especialidadId: 'esp-1',
  tags: [VALID_TAG],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-02T00:00:00Z',
};

describe('MatchingArticleTagSchema', () => {
  it('parses a valid tag without createdAt', () => {
    const result = MatchingArticleTagSchema.safeParse(VALID_TAG);

    expect(result.success).toBe(true);
  });

  it('parses a valid tag with optional createdAt', () => {
    const result = MatchingArticleTagSchema.safeParse({
      ...VALID_TAG,
      createdAt: '2026-01-01T00:00:00Z',
    });

    expect(result.success).toBe(true);
  });

  it.each(['sintoma', 'tratamiento', 'medicamento'])(
    'accepts lowercase tipo %s',
    (tipo) => {
      const result = MatchingArticleTagSchema.safeParse({ ...VALID_TAG, tipo });

      expect(result.success).toBe(true);
    },
  );

  it('rejects uppercase tipo (backend lowercases before serializing)', () => {
    const result = MatchingArticleTagSchema.safeParse({
      ...VALID_TAG,
      tipo: 'ENFERMEDAD',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a tag missing valor', () => {
    const result = MatchingArticleTagSchema.safeParse(omit(VALID_TAG, 'valor'));

    expect(result.success).toBe(false);
  });
});

describe('MatchingArticleSchema', () => {
  it('parses a fully-populated article', () => {
    const result = MatchingArticleSchema.safeParse(VALID_ARTICLE);

    expect(result.success).toBe(true);
  });

  it('parses an article with all nullable fields null and empty tags', () => {
    const result = MatchingArticleSchema.safeParse({
      ...VALID_ARTICLE,
      autores: null,
      revista: null,
      anioPub: null,
      mesPub: null,
      doi: null,
      abstractText: null,
      keywords: null,
      tipoPublicacion: null,
      url: null,
      especialidadId: null,
      tags: [],
    });

    expect(result.success).toBe(true);
  });

  it('rejects a non-integer anioPub', () => {
    const result = MatchingArticleSchema.safeParse({
      ...VALID_ARTICLE,
      anioPub: 2024.5,
    });

    expect(result.success).toBe(false);
  });

  it('rejects an article missing tags', () => {
    const result = MatchingArticleSchema.safeParse(omit(VALID_ARTICLE, 'tags'));

    expect(result.success).toBe(false);
  });

  it('rejects an article with an invalid tag inside tags', () => {
    const result = MatchingArticleSchema.safeParse({
      ...VALID_ARTICLE,
      tags: [{ id: 'x', tipo: 'otro', valor: 'y' }],
    });

    expect(result.success).toBe(false);
  });

  it('rejects an article missing createdAt', () => {
    const result = MatchingArticleSchema.safeParse(omit(VALID_ARTICLE, 'createdAt'));

    expect(result.success).toBe(false);
  });
});

describe('EspecialidadSchema', () => {
  it('parses a minimal especialidad without slug or descripcion', () => {
    const result = EspecialidadSchema.safeParse({ id: 'e1', nombre: 'Cardiología' });

    expect(result.success).toBe(true);
  });

  it('parses an especialidad with slug and null descripcion', () => {
    const result = EspecialidadSchema.safeParse({
      id: 'e1',
      nombre: 'Cardiología',
      slug: 'cardiologia',
      descripcion: null,
    });

    expect(result.success).toBe(true);
  });

  it('parses an especialidad with a descripcion string', () => {
    const result = EspecialidadSchema.safeParse({
      id: 'e1',
      nombre: 'Cardiología',
      descripcion: 'Corazón y sistema circulatorio',
    });

    expect(result.success).toBe(true);
  });

  it('rejects an especialidad missing nombre', () => {
    const result = EspecialidadSchema.safeParse({ id: 'e1' });

    expect(result.success).toBe(false);
  });

  it('rejects a non-string id', () => {
    const result = EspecialidadSchema.safeParse({ id: 7, nombre: 'X' });

    expect(result.success).toBe(false);
  });
});
