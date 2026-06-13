import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '@lib/http/errors';
import type { PacienteContexto } from '@features/patients/schemas';
import type { Especialidad, MatchingArticle } from '../schemas';

jest.mock('../queries', () => ({
  useMatchingArticles: jest.fn(),
  useEspecialidades: jest.fn(),
}));

jest.mock('@ui/cards/ArticleDetailDrawer', () => ({
  ArticleDetailDrawer: ({
    article,
    onClose,
  }: {
    article: { titulo: string } | null;
    onClose: () => void;
  }) =>
    article ? (
      <div data-testid="detail-drawer">
        <span>{article.titulo}</span>
        <button type="button" onClick={onClose}>
          cerrar drawer
        </button>
      </div>
    ) : null,
}));

import { useMatchingArticles, useEspecialidades } from '../queries';
import { MatchingArticlesPanel } from './MatchingArticlesPanel';

const mockUseMatchingArticles = jest.mocked(useMatchingArticles);
const mockUseEspecialidades = jest.mocked(useEspecialidades);

type ArticlesResult = ReturnType<typeof useMatchingArticles>;
type EspecialidadesResult = ReturnType<typeof useEspecialidades>;

function articlesResult(overrides: Record<string, unknown> = {}): ArticlesResult {
  return {
    data: undefined,
    error: null,
    isLoading: false,
    refetch: jest.fn(),
    ...overrides,
  } as unknown as ArticlesResult;
}

function especialidadesResult(
  catalog: Especialidad[] = [],
): EspecialidadesResult {
  const byId = new Map(catalog.map((e) => [e.id, e]));
  return { data: catalog, byId } as unknown as EspecialidadesResult;
}

function makeArticle(overrides: Partial<MatchingArticle> = {}): MatchingArticle {
  return {
    id: 'art-1',
    titulo: 'Manejo de diabetes tipo 2',
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
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
    ...overrides,
  };
}

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

const onClearFilter = jest.fn();

function renderPanel(
  props: Partial<Parameters<typeof MatchingArticlesPanel>[0]> = {},
) {
  return render(
    <MatchingArticlesPanel
      patientId="pat-1"
      contextos={[]}
      hasContextoQueryError={false}
      selectedTagKeys={new Set()}
      onClearFilter={onClearFilter}
      {...props}
    />,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUseMatchingArticles.mockReturnValue(articlesResult());
  mockUseEspecialidades.mockReturnValue(especialidadesResult());
});

describe('MatchingArticlesPanel', () => {
  it('renders the header copy', () => {
    renderPanel();

    expect(screen.getByText('Artículos relevantes')).toBeInTheDocument();
    expect(
      screen.getByText('Conectados al contexto del paciente'),
    ).toBeInTheDocument();
  });

  it('shows a 3-item skeleton while loading', () => {
    mockUseMatchingArticles.mockReturnValue(articlesResult({ isLoading: true }));

    const { container } = renderPanel();

    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(3);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  describe('error state', () => {
    it('shows the generic Error message with a retry button', async () => {
      const user = userEvent.setup();
      const refetch = jest.fn();
      mockUseMatchingArticles.mockReturnValue(
        articlesResult({ error: new Error('falló la red'), refetch }),
      );

      renderPanel();
      await user.click(screen.getByRole('button', { name: 'Reintentar' }));

      expect(screen.getByRole('alert')).toHaveTextContent('falló la red');
      expect(refetch).toHaveBeenCalledTimes(1);
    });

    it('maps ApiError 404 to the patient-not-found message', () => {
      mockUseMatchingArticles.mockReturnValue(
        articlesResult({ error: new ApiError(404, 'Not Found') }),
      );

      renderPanel();

      expect(screen.getByRole('alert')).toHaveTextContent(
        'No encontramos al paciente.',
      );
    });

    it('maps ApiError 401 to the expired-session message', () => {
      mockUseMatchingArticles.mockReturnValue(
        articlesResult({ error: new ApiError(401, 'Unauthorized') }),
      );

      renderPanel();

      expect(screen.getByRole('alert')).toHaveTextContent(
        'Tu sesión expiró. Vuelve a iniciar sesión.',
      );
    });

    it('uses the ApiError message for other statuses', () => {
      mockUseMatchingArticles.mockReturnValue(
        articlesResult({ error: new ApiError(500, 'Error interno') }),
      );

      renderPanel();

      expect(screen.getByRole('alert')).toHaveTextContent('Error interno');
    });

    it('falls back to the generic Spanish message for non-Error values', () => {
      mockUseMatchingArticles.mockReturnValue(articlesResult({ error: 'boom' }));

      renderPanel();

      expect(screen.getByRole('alert')).toHaveTextContent(
        'No pudimos cargar los artículos relevantes.',
      );
    });
  });

  describe('empty state', () => {
    it('invites adding contexto when the patient has none', () => {
      mockUseMatchingArticles.mockReturnValue(articlesResult({ data: [] }));

      renderPanel({ contextos: [] });

      expect(screen.getByText('Sin coincidencias todavía')).toBeInTheDocument();
      expect(
        screen.getByText(/Agrega contexto clínico al paciente/),
      ).toBeInTheDocument();
    });

    it('explains the lack of analyzed articles when contextos exist', () => {
      mockUseMatchingArticles.mockReturnValue(articlesResult({ data: [] }));

      renderPanel({ contextos: [makeContexto()] });

      expect(screen.getByText('Aún no hay coincidencias')).toBeInTheDocument();
      expect(
        screen.getByText(/Aún no hay artículos analizados con tags/),
      ).toBeInTheDocument();
    });

    it('mentions the contexto load failure when the contexto query errored', () => {
      mockUseMatchingArticles.mockReturnValue(articlesResult({ data: [] }));

      renderPanel({ contextos: [], hasContextoQueryError: true });

      expect(
        screen.getByText(/No pudimos cargar el contexto del paciente/),
      ).toBeInTheDocument();
    });
  });

  describe('data state', () => {
    it('renders one card per article and the total count badge', () => {
      mockUseMatchingArticles.mockReturnValue(
        articlesResult({
          data: [
            makeArticle(),
            makeArticle({ id: 'art-2', titulo: 'Hipertensión resistente' }),
          ],
        }),
      );

      renderPanel();

      expect(screen.getByText('Manejo de diabetes tipo 2')).toBeInTheDocument();
      expect(screen.getByText('Hipertensión resistente')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('highlights the intersection between contextos and article tags', () => {
      mockUseMatchingArticles.mockReturnValue(
        articlesResult({
          data: [
            makeArticle({
              tags: [{ id: 't1', tipo: 'enfermedad', valor: 'Diabetes' }],
            }),
          ],
        }),
      );

      renderPanel({ contextos: [makeContexto({ valor: 'diabetes' })] });

      expect(
        screen.getByRole('button', { name: 'Coincide en 1 de 1 tags. Ver detalle.' }),
      ).toBeInTheDocument();
    });

    it('resolves the specialty badge through the catalog', () => {
      mockUseEspecialidades.mockReturnValue(
        especialidadesResult([
          { id: 'esp-1', nombre: 'Cardiología', slug: 'cardiologia' },
        ]),
      );
      mockUseMatchingArticles.mockReturnValue(
        articlesResult({ data: [makeArticle({ especialidadId: 'esp-1' })] }),
      );

      renderPanel();

      expect(screen.getByText('Cardiología')).toBeInTheDocument();
    });

    it('opens the detail drawer when a card is activated', async () => {
      const user = userEvent.setup();
      mockUseMatchingArticles.mockReturnValue(
        articlesResult({ data: [makeArticle()] }),
      );

      renderPanel();
      expect(screen.queryByTestId('detail-drawer')).not.toBeInTheDocument();
      await user.click(
        screen.getByRole('button', {
          name: 'Ver detalles de: Manejo de diabetes tipo 2',
        }),
      );

      expect(screen.getByTestId('detail-drawer')).toHaveTextContent(
        'Manejo de diabetes tipo 2',
      );
    });

    it('closes the detail drawer from its close control', async () => {
      const user = userEvent.setup();
      mockUseMatchingArticles.mockReturnValue(
        articlesResult({ data: [makeArticle()] }),
      );

      renderPanel();
      await user.click(
        screen.getByRole('button', {
          name: 'Ver detalles de: Manejo de diabetes tipo 2',
        }),
      );
      await user.click(screen.getByRole('button', { name: 'cerrar drawer' }));

      expect(screen.queryByTestId('detail-drawer')).not.toBeInTheDocument();
    });
  });

  describe('tag filter', () => {
    const ARTICLES = [
      makeArticle({
        id: 'art-1',
        titulo: 'Artículo sobre diabetes',
        tags: [{ id: 't1', tipo: 'enfermedad', valor: 'diabetes' }],
      }),
      makeArticle({
        id: 'art-2',
        titulo: 'Artículo sobre asma',
        tags: [{ id: 't2', tipo: 'enfermedad', valor: 'asma' }],
      }),
    ];

    it('keeps only the articles containing every selected tag', () => {
      mockUseMatchingArticles.mockReturnValue(articlesResult({ data: ARTICLES }));

      renderPanel({
        contextos: [makeContexto({ valor: 'diabetes' })],
        selectedTagKeys: new Set(['enfermedad::diabetes']),
      });

      expect(screen.getByText('Artículo sobre diabetes')).toBeInTheDocument();
      expect(screen.queryByText('Artículo sobre asma')).not.toBeInTheDocument();
      expect(screen.getByText('1/2')).toBeInTheDocument();
    });

    it('shows the active filter chips and clears via the Limpiar button', async () => {
      const user = userEvent.setup();
      mockUseMatchingArticles.mockReturnValue(articlesResult({ data: ARTICLES }));

      renderPanel({
        contextos: [makeContexto({ valor: 'diabetes' })],
        selectedTagKeys: new Set(['enfermedad::diabetes']),
      });
      await user.click(screen.getByRole('button', { name: /Limpiar/ }));

      const filterBar = screen.getByText('Filtrando por').closest('div');
      expect(filterBar).not.toBeNull();
      expect(within(filterBar as HTMLElement).getByText('diabetes')).toBeInTheDocument();
      expect(onClearFilter).toHaveBeenCalledTimes(1);
    });

    it('applies AND semantics across multiple selected tags', () => {
      const both = makeArticle({
        id: 'art-3',
        titulo: 'Artículo combinado',
        tags: [
          { id: 't1', tipo: 'enfermedad', valor: 'diabetes' },
          { id: 't2', tipo: 'medicamento', valor: 'metformina' },
        ],
      });
      mockUseMatchingArticles.mockReturnValue(
        articlesResult({ data: [...ARTICLES, both] }),
      );

      renderPanel({
        contextos: [
          makeContexto({ valor: 'diabetes' }),
          makeContexto({ id: 'ctx-2', tipo: 'medicamento', valor: 'metformina' }),
        ],
        selectedTagKeys: new Set([
          'enfermedad::diabetes',
          'medicamento::metformina',
        ]),
      });

      expect(screen.getByText('Artículo combinado')).toBeInTheDocument();
      expect(screen.queryByText('Artículo sobre diabetes')).not.toBeInTheDocument();
      expect(screen.queryByText('Artículo sobre asma')).not.toBeInTheDocument();
    });

    it('shows the filtered-empty state with its own clear button', async () => {
      const user = userEvent.setup();
      mockUseMatchingArticles.mockReturnValue(articlesResult({ data: ARTICLES }));

      renderPanel({
        contextos: [makeContexto({ id: 'ctx-9', tipo: 'sintoma', valor: 'mareo' })],
        selectedTagKeys: new Set(['sintoma::mareo']),
      });

      expect(
        screen.getByText(
          'Ningún artículo del feed contiene todos los tags seleccionados.',
        ),
      ).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
      expect(onClearFilter).toHaveBeenCalledTimes(1);
    });
  });
});
