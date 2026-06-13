import { renderHook } from '@testing-library/react';
import type { PacienteContexto } from '@features/patients/schemas';
import type { MatchingArticle, MatchingArticleTag } from './schemas';
import { useMatchIntersection, tagMatchKey, matchKey } from './useMatchIntersection';

function makeContexto(overrides: Partial<PacienteContexto> = {}): PacienteContexto {
  return {
    id: 'ctx-1',
    pacienteId: 'pat-1',
    tipo: 'enfermedad',
    valor: 'diabetes',
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeArticle(
  id: string,
  tags: MatchingArticleTag[],
): MatchingArticle {
  return {
    id,
    titulo: `Artículo ${id}`,
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
    tags,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
  };
}

describe('useMatchIntersection', () => {
  it('returns the empty snapshot when contextos are undefined', () => {
    const { result } = renderHook(() =>
      useMatchIntersection(undefined, [makeArticle('a1', [])]),
    );

    expect(result.current.contextoKeys.size).toBe(0);
    expect(result.current.matchedTagPairs.size).toBe(0);
    expect(result.current.articleMatchCounts.size).toBe(0);
  });

  it('returns the empty snapshot when articles are undefined', () => {
    const { result } = renderHook(() =>
      useMatchIntersection([makeContexto()], undefined),
    );

    expect(result.current.contextoKeys.size).toBe(0);
    expect(result.current.contextoIdByKey.size).toBe(0);
  });

  it('returns the same empty reference for both undefined inputs', () => {
    const first = renderHook(() => useMatchIntersection(undefined, undefined));
    const second = renderHook(() => useMatchIntersection(undefined, []));

    expect(first.result.current).toBe(second.result.current);
  });

  it('matches a tag whose tipo and valor equal a contexto', () => {
    const contexto = makeContexto({ id: 'ctx-1', tipo: 'enfermedad', valor: 'diabetes' });
    const article = makeArticle('a1', [
      { id: 't1', tipo: 'enfermedad', valor: 'diabetes' },
    ]);

    const { result } = renderHook(() => useMatchIntersection([contexto], [article]));

    expect(result.current.matchedTagPairs.has('a1::t1')).toBe(true);
    expect(result.current.articleMatchCounts.get('a1')).toBe(1);
    expect(result.current.contextoMatchCounts.get('ctx-1')).toBe(1);
  });

  it('normalizes valor case and surrounding whitespace', () => {
    const contexto = makeContexto({ valor: '  Diabetes ' });
    const article = makeArticle('a1', [
      { id: 't1', tipo: 'enfermedad', valor: 'DIABETES' },
    ]);

    const { result } = renderHook(() => useMatchIntersection([contexto], [article]));

    expect(result.current.matchedTagPairs.has('a1::t1')).toBe(true);
  });

  it('does not match the same valor under a different tipo', () => {
    const contexto = makeContexto({ tipo: 'sintoma', valor: 'diabetes' });
    const article = makeArticle('a1', [
      { id: 't1', tipo: 'enfermedad', valor: 'diabetes' },
    ]);

    const { result } = renderHook(() => useMatchIntersection([contexto], [article]));

    expect(result.current.matchedTagPairs.size).toBe(0);
    expect(result.current.articleMatchCounts.get('a1')).toBe(0);
  });

  it('records a zero count for articles without any matching tag', () => {
    const article = makeArticle('a1', [{ id: 't1', tipo: 'sintoma', valor: 'tos' }]);

    const { result } = renderHook(() =>
      useMatchIntersection([makeContexto()], [article]),
    );

    expect(result.current.articleMatchCounts.get('a1')).toBe(0);
    expect(result.current.contextoMatchCounts.size).toBe(0);
  });

  it('tallies contexto matches across multiple articles', () => {
    const contexto = makeContexto({ id: 'ctx-1' });
    const articles = [
      makeArticle('a1', [{ id: 't1', tipo: 'enfermedad', valor: 'diabetes' }]),
      makeArticle('a2', [{ id: 't2', tipo: 'enfermedad', valor: 'diabetes' }]),
      makeArticle('a3', [{ id: 't3', tipo: 'sintoma', valor: 'tos' }]),
    ];

    const { result } = renderHook(() => useMatchIntersection([contexto], articles));

    expect(result.current.contextoMatchCounts.get('ctx-1')).toBe(2);
    expect(result.current.articleMatchCounts.get('a1')).toBe(1);
    expect(result.current.articleMatchCounts.get('a2')).toBe(1);
    expect(result.current.articleMatchCounts.get('a3')).toBe(0);
  });

  it('counts every matched tag within the same article', () => {
    const contextos = [
      makeContexto({ id: 'ctx-1', tipo: 'enfermedad', valor: 'diabetes' }),
      makeContexto({ id: 'ctx-2', tipo: 'medicamento', valor: 'metformina' }),
    ];
    const article = makeArticle('a1', [
      { id: 't1', tipo: 'enfermedad', valor: 'diabetes' },
      { id: 't2', tipo: 'medicamento', valor: 'metformina' },
      { id: 't3', tipo: 'sintoma', valor: 'fatiga' },
    ]);

    const { result } = renderHook(() => useMatchIntersection(contextos, [article]));

    expect(result.current.articleMatchCounts.get('a1')).toBe(2);
    expect(result.current.matchedTagPairs).toEqual(new Set(['a1::t1', 'a1::t2']));
  });

  it('lets the last duplicate contexto win the id lookup but keeps a single key', () => {
    const contextos = [
      makeContexto({ id: 'ctx-old', valor: 'Diabetes' }),
      makeContexto({ id: 'ctx-new', valor: 'diabetes' }),
    ];
    const article = makeArticle('a1', [
      { id: 't1', tipo: 'enfermedad', valor: 'diabetes' },
    ]);

    const { result } = renderHook(() => useMatchIntersection(contextos, [article]));

    expect(result.current.contextoKeys.size).toBe(1);
    expect(result.current.contextoIdByKey.get('enfermedad::diabetes')).toBe('ctx-new');
    expect(result.current.contextoMatchCounts.get('ctx-new')).toBe(1);
    expect(result.current.contextoMatchCounts.has('ctx-old')).toBe(false);
  });

  it('memoizes the snapshot across rerenders with identical inputs', () => {
    const contextos = [makeContexto()];
    const articles = [
      makeArticle('a1', [{ id: 't1', tipo: 'enfermedad', valor: 'diabetes' }]),
    ];

    const { result, rerender } = renderHook(
      ({ ctx, arts }) => useMatchIntersection(ctx, arts),
      { initialProps: { ctx: contextos, arts: articles } },
    );
    const firstSnapshot = result.current;
    rerender({ ctx: contextos, arts: articles });

    expect(result.current).toBe(firstSnapshot);
  });

  it('recomputes when the articles reference changes', () => {
    const contextos = [makeContexto()];
    const articles = [
      makeArticle('a1', [{ id: 't1', tipo: 'enfermedad', valor: 'diabetes' }]),
    ];

    const { result, rerender } = renderHook(
      ({ ctx, arts }) => useMatchIntersection(ctx, arts),
      { initialProps: { ctx: contextos, arts: articles } },
    );
    const firstSnapshot = result.current;
    rerender({ ctx: contextos, arts: [...articles] });

    expect(result.current).not.toBe(firstSnapshot);
    expect(result.current.matchedTagPairs.has('a1::t1')).toBe(true);
  });
});

describe('tagMatchKey', () => {
  it('joins article and tag ids with the :: separator', () => {
    expect(tagMatchKey('a1', 't9')).toBe('a1::t9');
  });
});

describe('matchKey', () => {
  it('normalizes valor to trimmed lowercase', () => {
    expect(matchKey('sintoma', '  TOS Seca ')).toBe('sintoma::tos seca');
  });
});
