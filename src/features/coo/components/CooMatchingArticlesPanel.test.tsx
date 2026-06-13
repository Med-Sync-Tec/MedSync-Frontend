import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '@lib/http/errors';
import type { MatchingArticle } from '@features/matching/schemas';
import type { PacienteContexto } from '@features/patients/schemas';

jest.mock('@features/matching/queries', () => ({
  useCooMatchingArticles: jest.fn(),
  useEspecialidades: jest.fn(),
}));

jest.mock('@features/news/queries', () => ({
  useSaveArticle: jest.fn(),
  useUnsaveArticle: jest.fn(),
  useAnalyzeArticle: jest.fn(),
}));

import { useCooMatchingArticles, useEspecialidades } from '@features/matching/queries';
import { useSaveArticle, useUnsaveArticle, useAnalyzeArticle } from '@features/news/queries';
import { CooMatchingArticlesPanel } from './CooMatchingArticlesPanel';

const mockUseCooMatchingArticles = jest.mocked(useCooMatchingArticles);
const mockUseEspecialidades = jest.mocked(useEspecialidades);
const mockUseSaveArticle = jest.mocked(useSaveArticle);
const mockUseUnsaveArticle = jest.mocked(useUnsaveArticle);
const mockUseAnalyzeArticle = jest.mocked(useAnalyzeArticle);

type ArticlesQueryResult = ReturnType<typeof useCooMatchingArticles>;
type EspecialidadesResult = ReturnType<typeof useEspecialidades>;

function articlesQuery(overrides: {
  data?: MatchingArticle[];
  isLoading?: boolean;
  error?: unknown;
  refetch?: () => void;
}): ArticlesQueryResult {
  return {
    data: undefined,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
    ...overrides,
  } as unknown as ArticlesQueryResult;
}

function makeArticle(overrides: Partial<MatchingArticle> = {}): MatchingArticle {
  return {
    id: 'art-1',
    titulo: 'Estudio sobre paracetamol',
    autores: null,
    revista: 'NEJM',
    anioPub: 2026,
    mesPub: null,
    doi: null,
    abstractText: null,
    keywords: null,
    tipoPublicacion: null,
    url: null,
    especialidadId: null,
    tags: [{ id: 'tag-1', tipo: 'medicamento', valor: 'Paracetamol' }],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeContexto(overrides: Partial<PacienteContexto> = {}): PacienteContexto {
  return {
    id: 'med-1',
    pacienteId: '',
    tipo: 'medicamento',
    valor: 'Paracetamol',
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  } as PacienteContexto;
}

interface RenderOverrides {
  contextos?: PacienteContexto[];
  matchedTagPairs?: Set<string>;
  selectedTagKeys?: ReadonlySet<string>;
  onClearFilter?: () => void;
}

function renderPanel(overrides: RenderOverrides = {}) {
  const props = {
    contextos: [],
    matchedTagPairs: new Set<string>(),
    selectedTagKeys: new Set<string>(),
    onClearFilter: jest.fn(),
    ...overrides,
  };
  const view = render(<CooMatchingArticlesPanel {...props} />);
  return { ...view, props };
}

const saveMutate = jest.fn();
const unsaveMutate = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  mockUseEspecialidades.mockReturnValue({
    data: [],
    byId: new Map(),
  } as unknown as EspecialidadesResult);
  mockUseSaveArticle.mockReturnValue({
    mutate: saveMutate,
    isPending: false,
  } as unknown as ReturnType<typeof useSaveArticle>);
  mockUseUnsaveArticle.mockReturnValue({
    mutate: unsaveMutate,
    isPending: false,
  } as unknown as ReturnType<typeof useUnsaveArticle>);
  mockUseAnalyzeArticle.mockReturnValue({
    mutate: jest.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useAnalyzeArticle>);
  mockUseCooMatchingArticles.mockReturnValue(articlesQuery({ data: [] }));
});

describe('CooMatchingArticlesPanel', () => {
  it('renders the panel title', () => {
    renderPanel();

    expect(
      screen.getByRole('heading', { name: 'Conectados al catálogo de medicamentos' }),
    ).toBeInTheDocument();
  });

  describe('error state', () => {
    it('shows a session-expired message for 401 errors', () => {
      mockUseCooMatchingArticles.mockReturnValue(
        articlesQuery({ error: new ApiError(401, 'Unauthorized') }),
      );

      renderPanel();

      expect(screen.getByRole('alert')).toHaveTextContent(
        'Tu sesión expiró. Vuelve a iniciar sesión.',
      );
    });

    it('shows a COO-only message for 403 errors', () => {
      mockUseCooMatchingArticles.mockReturnValue(
        articlesQuery({ error: new ApiError(403, 'Forbidden') }),
      );

      renderPanel();

      expect(screen.getByRole('alert')).toHaveTextContent(
        'Solo el COO puede consultar este match.',
      );
    });

    it('shows the ApiError message for other statuses', () => {
      mockUseCooMatchingArticles.mockReturnValue(
        articlesQuery({ error: new ApiError(500, 'Explotó el servidor') }),
      );

      renderPanel();

      expect(screen.getByRole('alert')).toHaveTextContent('Explotó el servidor');
    });

    it('shows the plain Error message for non-API errors', () => {
      mockUseCooMatchingArticles.mockReturnValue(
        articlesQuery({ error: new Error('falló la red') }),
      );

      renderPanel();

      expect(screen.getByRole('alert')).toHaveTextContent('falló la red');
    });

    it('falls back to a generic message for unknown error shapes', () => {
      mockUseCooMatchingArticles.mockReturnValue(articlesQuery({ error: 'raro' }));

      renderPanel();

      expect(screen.getByRole('alert')).toHaveTextContent(
        'No pudimos cargar los artículos relevantes.',
      );
    });

    it('refetches when clicking Reintentar', async () => {
      const user = userEvent.setup();
      const refetch = jest.fn();
      mockUseCooMatchingArticles.mockReturnValue(
        articlesQuery({ error: new Error('falló'), refetch }),
      );

      renderPanel();
      await user.click(screen.getByRole('button', { name: 'Reintentar' }));

      expect(refetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('loading and empty states', () => {
    it('renders skeletons while loading', () => {
      mockUseCooMatchingArticles.mockReturnValue(articlesQuery({ isLoading: true }));

      const { container } = renderPanel();

      expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    });

    it('asks to analyze news when the catalog exists but nothing matches', () => {
      mockUseCooMatchingArticles.mockReturnValue(articlesQuery({ data: [] }));

      renderPanel({ contextos: [makeContexto()] });

      expect(screen.getByText('Aún no hay coincidencias')).toBeInTheDocument();
    });

    it('asks to add medications when the catalog is empty', () => {
      mockUseCooMatchingArticles.mockReturnValue(articlesQuery({ data: [] }));

      renderPanel({ contextos: [] });

      expect(screen.getByText('Sin medicamentos en el catálogo')).toBeInTheDocument();
    });
  });

  describe('article feed', () => {
    it('renders one card per article with the total counter', () => {
      mockUseCooMatchingArticles.mockReturnValue(
        articlesQuery({
          data: [
            makeArticle({ id: 'a1', titulo: 'Artículo uno' }),
            makeArticle({ id: 'a2', titulo: 'Artículo dos' }),
          ],
        }),
      );

      renderPanel();

      expect(screen.getByText('Artículo uno')).toBeInTheDocument();
      expect(screen.getByText('Artículo dos')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('renders save and analyze actions per article', () => {
      mockUseCooMatchingArticles.mockReturnValue(articlesQuery({ data: [makeArticle()] }));

      renderPanel();

      expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Analizar artículo con IA' }),
      ).toBeInTheDocument();
    });

    it('saves on first click and unsaves on the second', async () => {
      const user = userEvent.setup();
      mockUseCooMatchingArticles.mockReturnValue(
        articlesQuery({ data: [makeArticle({ id: 'a1' })] }),
      );

      renderPanel();

      const saveButton = screen.getByRole('button', { name: 'Guardar' });
      expect(saveButton).toHaveAttribute('aria-pressed', 'false');

      await user.click(saveButton);
      expect(saveMutate).toHaveBeenCalledWith('a1');

      const savedButton = screen.getByRole('button', { name: 'Guardado' });
      expect(savedButton).toHaveAttribute('aria-pressed', 'true');

      await user.click(savedButton);
      expect(unsaveMutate).toHaveBeenCalledWith('a1');
      expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
    });

    it('opens and closes the explain panel for an article', async () => {
      const user = userEvent.setup();
      mockUseCooMatchingArticles.mockReturnValue(
        articlesQuery({ data: [makeArticle({ titulo: 'Artículo uno' })] }),
      );

      renderPanel({ contextos: [makeContexto()] });

      await user.click(screen.getByRole('button', { name: 'Ver detalles de: Artículo uno' }));
      const dialog = screen.getByRole('dialog', { name: 'Por qué coincide este artículo' });
      expect(dialog).toBeInTheDocument();
      expect(within(dialog).getByText('Artículo uno')).toBeInTheDocument();

      await user.keyboard('{Escape}');
      expect(
        screen.queryByRole('dialog', { name: 'Por qué coincide este artículo' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('filtering', () => {
    const articles = [
      makeArticle({
        id: 'a1',
        titulo: 'Artículo paracetamol',
        tags: [{ id: 't1', tipo: 'medicamento', valor: 'Paracetamol' }],
      }),
      makeArticle({
        id: 'a2',
        titulo: 'Artículo ibuprofeno',
        tags: [{ id: 't2', tipo: 'medicamento', valor: 'Ibuprofeno' }],
      }),
    ];

    it('shows only articles containing every selected tag', () => {
      mockUseCooMatchingArticles.mockReturnValue(articlesQuery({ data: articles }));

      renderPanel({
        contextos: [makeContexto({ valor: 'Paracetamol' })],
        selectedTagKeys: new Set(['medicamento::paracetamol']),
      });

      expect(screen.getByText('Artículo paracetamol')).toBeInTheDocument();
      expect(screen.queryByText('Artículo ibuprofeno')).not.toBeInTheDocument();
      expect(screen.getByText('1/2')).toBeInTheDocument();
    });

    it('renders the active filter labels and clears them', async () => {
      const user = userEvent.setup();
      const onClearFilter = jest.fn();
      mockUseCooMatchingArticles.mockReturnValue(articlesQuery({ data: articles }));

      renderPanel({
        contextos: [makeContexto({ valor: 'Paracetamol' })],
        selectedTagKeys: new Set(['medicamento::paracetamol']),
        onClearFilter,
      });

      const filterBar = screen.getByText('Filtrando por').parentElement;
      expect(filterBar).not.toBeNull();
      expect(within(filterBar as HTMLElement).getByText('Paracetamol')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Limpiar' }));
      expect(onClearFilter).toHaveBeenCalledTimes(1);
    });

    it('shows the filtered-empty state when no article has all selected tags', async () => {
      const user = userEvent.setup();
      const onClearFilter = jest.fn();
      mockUseCooMatchingArticles.mockReturnValue(articlesQuery({ data: articles }));

      renderPanel({
        contextos: [makeContexto({ valor: 'Metformina', id: 'med-3' })],
        selectedTagKeys: new Set(['medicamento::metformina']),
        onClearFilter,
      });

      expect(
        screen.getByText(
          'Ningún artículo del feed contiene todos los medicamentos seleccionados.',
        ),
      ).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
      expect(onClearFilter).toHaveBeenCalledTimes(1);
    });
  });
});
