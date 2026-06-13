import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { DoctorDashboardPage } from './DoctorDashboardPage';
import { useAuthStore } from '@features/auth/store';
import { useSearchStore } from '@features/search/store';
import type { Article } from '@features/news/types';
import type { DashboardData } from '@features/dashboard/types';

jest.mock('@features/dashboard/queries', () => ({
  useDashboardData: jest.fn(),
}));

jest.mock('@features/news/queries', () => ({
  useSyncArticles: jest.fn(),
  useMarkArticleAsRead: jest.fn(),
  useSavedArticles: jest.fn(),
  useSaveArticle: jest.fn(),
  useUnsaveArticle: jest.fn(),
}));

jest.mock('@features/matching/queries', () => ({
  useEspecialidades: jest.fn(),
}));

// Heavy children: the drawer is a 370-line presenter and the analyze button
// owns its own mutation + modal lifecycle. Stub both to keep this page test
// focused on the page's own state machine.
jest.mock('@ui/cards/ArticleDetailDrawer', () => ({
  ArticleDetailDrawer: ({
    article,
    onClose,
    onSave,
    saved,
  }: {
    article: Article | null;
    onClose: () => void;
    onSave?: () => void;
    saved: boolean;
  }) =>
    article ? (
      <div data-testid="article-drawer">
        <span data-testid="drawer-title">{article.titulo}</span>
        <span data-testid="drawer-saved">{saved ? 'guardado' : 'no-guardado'}</span>
        <button onClick={onClose}>Cerrar detalle</button>
        {onSave && <button onClick={() => onSave()}>Guardar desde detalle</button>}
      </div>
    ) : null,
}));

jest.mock('@features/news/components/AnalyzeArticleButton', () => ({
  AnalyzeArticleButton: ({ articleId }: { articleId: string }) => (
    <button data-testid={`analyze-${articleId}`}>Analizar con IA</button>
  ),
}));

import { useDashboardData } from '@features/dashboard/queries';
import {
  useSyncArticles,
  useMarkArticleAsRead,
  useSavedArticles,
  useSaveArticle,
  useUnsaveArticle,
} from '@features/news/queries';
import { useEspecialidades } from '@features/matching/queries';

const mockUseDashboardData = jest.mocked(useDashboardData);
const mockUseSavedArticles = jest.mocked(useSavedArticles);
const mockUseSyncArticles = jest.mocked(useSyncArticles);
const mockUseMarkArticleAsRead = jest.mocked(useMarkArticleAsRead);
const mockUseSaveArticle = jest.mocked(useSaveArticle);
const mockUseUnsaveArticle = jest.mocked(useUnsaveArticle);
const mockUseEspecialidades = jest.mocked(useEspecialidades);

const makeArticle = (id: string, overrides: Partial<Article> = {}): Article => ({
  id,
  titulo: `Artículo ${id}`,
  autores: 'Autora Uno; Autor Dos',
  revista: 'Revista Médica',
  anioPub: '2026',
  mesPub: '06',
  doi: `10.1000/${id}`,
  abstractText: `Resumen del artículo ${id}`,
  keywords: 'medicina',
  tipoPublicacion: 'Journal Article',
  url: `https://pubmed.example/${id}`,
  especialidadId: null,
  tags: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const emptyDashboard: DashboardData = {
  novedades_48h: [],
  no_leidos: [],
  por_especialidad: [],
  alta_evidencia: [],
};

const queryResult = (overrides: Record<string, unknown> = {}) =>
  ({ data: undefined, isLoading: false, isError: false, ...overrides }) as never;

const mutationResult = (overrides: Record<string, unknown> = {}) =>
  ({ mutate: jest.fn(), isPending: false, ...overrides }) as never;

let syncMutate: ReturnType<typeof jest.fn>;
let markAsReadMutate: ReturnType<typeof jest.fn>;
let saveMutate: ReturnType<typeof jest.fn>;
let unsaveMutate: ReturnType<typeof jest.fn>;

const renderPage = (initialEntries: Parameters<typeof MemoryRouter>[0]['initialEntries'] = ['/dashboard']) =>
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <DoctorDashboardPage />
    </MemoryRouter>
  );

const switchToSavedView = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('radio', { name: 'Guardadas' }));
};

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({
    user: { id: 'u-1', email: 'ana@medsync.local', name: 'Ana Torres', role: 'DOCTOR' },
    isAuthenticated: true,
  });
  useSearchStore.setState({ query: '' });

  syncMutate = jest.fn();
  markAsReadMutate = jest.fn();
  saveMutate = jest.fn();
  unsaveMutate = jest.fn();

  mockUseDashboardData.mockReturnValue(queryResult({ data: emptyDashboard }));
  mockUseSavedArticles.mockReturnValue(queryResult({ data: { items: [], total: 0, page: 0, size: 200 } }));
  mockUseEspecialidades.mockReturnValue({ byId: new Map() } as never);
  mockUseSyncArticles.mockReturnValue(mutationResult({ mutate: syncMutate }));
  mockUseMarkArticleAsRead.mockReturnValue(mutationResult({ mutate: markAsReadMutate }));
  mockUseSaveArticle.mockReturnValue(mutationResult({ mutate: saveMutate }));
  mockUseUnsaveArticle.mockReturnValue(mutationResult({ mutate: unsaveMutate }));
});

describe('DoctorDashboardPage — explore view', () => {
  it('greets the doctor by name from the auth store', () => {
    renderPage();

    expect(
      screen.getByRole('heading', { name: /Buen(os días|as tardes|as noches), Ana Torres/ })
    ).toBeInTheDocument();
  });

  it('falls back to "Doctor" when there is no user in the store', () => {
    useAuthStore.setState({ user: null, isAuthenticated: false });

    renderPage();

    expect(screen.getByRole('heading', { name: /, Doctor$/ })).toBeInTheDocument();
  });

  it('renders loading skeletons while the dashboard loads', () => {
    mockUseDashboardData.mockReturnValue(queryResult({ isLoading: true }));

    const { container } = renderPage();

    expect(container.querySelectorAll('.animate-pulse').length).toBe(3);
    expect(screen.queryByText(/Error al cargar/)).not.toBeInTheDocument();
  });

  it('shows an error message when the dashboard query fails', () => {
    mockUseDashboardData.mockReturnValue(queryResult({ isError: true }));

    renderPage();

    expect(
      screen.getByText('Error al cargar las noticias médicas. Por favor, intenta de nuevo más tarde.')
    ).toBeInTheDocument();
  });

  it('shows an empty state when the selected category has no articles', () => {
    renderPage();

    expect(screen.getByText('No hay noticias disponibles en esta categoría.')).toBeInTheDocument();
  });

  it('renders the articles of the default category with KPI counts', () => {
    mockUseDashboardData.mockReturnValue(
      queryResult({
        data: {
          ...emptyDashboard,
          novedades_48h: [makeArticle('a1'), makeArticle('a2')],
          alta_evidencia: [makeArticle('a3')],
        },
      })
    );

    renderPage();

    expect(screen.getByText('Artículo a1')).toBeInTheDocument();
    expect(screen.getByText('Artículo a2')).toBeInTheDocument();
    expect(screen.queryByText('Artículo a3')).not.toBeInTheDocument();

    const novedadesCard = screen.getByText('Novedades 48h').closest('div.cursor-pointer');
    expect(within(novedadesCard as HTMLElement).getByText('2')).toBeInTheDocument();
  });

  it('switches category when clicking a KPI card', async () => {
    const user = userEvent.setup();
    mockUseDashboardData.mockReturnValue(
      queryResult({
        data: {
          ...emptyDashboard,
          novedades_48h: [makeArticle('a1')],
          alta_evidencia: [makeArticle('a3', { titulo: 'Evidencia fuerte' })],
        },
      })
    );
    renderPage();

    await user.click(screen.getByText('Alta Evidencia'));

    expect(screen.getByText('Evidencia fuerte')).toBeInTheDocument();
    expect(screen.queryByText('Artículo a1')).not.toBeInTheDocument();
  });

  it('shows all deduplicated articles when clicking "Ver todas"', async () => {
    const user = userEvent.setup();
    const shared = makeArticle('shared');
    mockUseDashboardData.mockReturnValue(
      queryResult({
        data: {
          ...emptyDashboard,
          novedades_48h: [shared, makeArticle('a1')],
          alta_evidencia: [shared, makeArticle('a3')],
        },
      })
    );
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Ver todas' }));

    expect(screen.getByText('✓ Viendo todas')).toBeInTheDocument();
    expect(screen.getAllByText('Artículo shared')).toHaveLength(1);
    expect(screen.getByText('Artículo a1')).toBeInTheDocument();
    expect(screen.getByText('Artículo a3')).toBeInTheDocument();
  });

  it('triggers the PubMed sync mutation', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /Sincronizar PubMed/ }));

    expect(syncMutate).toHaveBeenCalledTimes(1);
  });

  it('disables the sync button while syncing', () => {
    mockUseSyncArticles.mockReturnValue(mutationResult({ mutate: syncMutate, isPending: true }));

    renderPage();

    const button = screen.getByRole('button', { name: /Sincronizando.../ });
    expect(button).toBeDisabled();
  });

  it('opens the article drawer and marks the article as read on click', async () => {
    const user = userEvent.setup();
    mockUseDashboardData.mockReturnValue(
      queryResult({ data: { ...emptyDashboard, novedades_48h: [makeArticle('a1')] } })
    );
    renderPage();

    await user.click(screen.getByText('Artículo a1'));

    expect(markAsReadMutate).toHaveBeenCalledWith('a1');
    expect(screen.getByTestId('drawer-title')).toHaveTextContent('Artículo a1');

    await user.click(screen.getByRole('button', { name: 'Cerrar detalle' }));
    expect(screen.queryByTestId('article-drawer')).not.toBeInTheDocument();
  });

  it('saves and unsaves an article from the bookmark button', async () => {
    const user = userEvent.setup();
    mockUseDashboardData.mockReturnValue(
      queryResult({ data: { ...emptyDashboard, novedades_48h: [makeArticle('a1')] } })
    );
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Guardar artículo' }));
    expect(saveMutate).toHaveBeenCalledWith('a1');
    expect(markAsReadMutate).not.toHaveBeenCalled(); // stopPropagation keeps the drawer closed

    await user.click(screen.getByRole('button', { name: 'Quitar de guardados' }));
    expect(unsaveMutate).toHaveBeenCalledWith('a1');
  });

  it('saves an article from the drawer and reflects the saved state', async () => {
    const user = userEvent.setup();
    mockUseDashboardData.mockReturnValue(
      queryResult({ data: { ...emptyDashboard, novedades_48h: [makeArticle('a1')] } })
    );
    renderPage();

    await user.click(screen.getByText('Artículo a1'));
    expect(screen.getByTestId('drawer-saved')).toHaveTextContent('no-guardado');

    await user.click(screen.getByRole('button', { name: 'Guardar desde detalle' }));

    expect(saveMutate).toHaveBeenCalledWith('a1');
    expect(screen.getByTestId('drawer-saved')).toHaveTextContent(/^guardado$/);
    expect(screen.getByTestId('article-drawer')).toBeInTheDocument(); // stays open in explore view
  });

  it('filters articles by the global search query ignoring accents', () => {
    mockUseDashboardData.mockReturnValue(
      queryResult({
        data: {
          ...emptyDashboard,
          novedades_48h: [
            makeArticle('a1', { titulo: 'Avances en el corazón' }),
            makeArticle('a2', { titulo: 'Neurología pediátrica' }),
          ],
        },
      })
    );
    useSearchStore.setState({ query: 'corazon' });

    renderPage();

    expect(screen.getByText('Avances en el corazón')).toBeInTheDocument();
    expect(screen.queryByText('Neurología pediátrica')).not.toBeInTheDocument();
  });

  it('matches the search query against article tags', () => {
    mockUseDashboardData.mockReturnValue(
      queryResult({
        data: {
          ...emptyDashboard,
          novedades_48h: [
            makeArticle('a1', {
              tags: [{ id: 't1', tipo: 'medicamento', valor: 'Metformina', createdAt: new Date().toISOString() }],
            }),
            makeArticle('a2'),
          ],
        },
      })
    );
    useSearchStore.setState({ query: 'metformina' });

    renderPage();

    expect(screen.getByText('Artículo a1')).toBeInTheDocument();
    expect(screen.queryByText('Artículo a2')).not.toBeInTheDocument();
  });

  it('paginates when there are more than 10 articles', async () => {
    const user = userEvent.setup();
    const articles = Array.from({ length: 12 }, (_, i) => makeArticle(`a${i + 1}`));
    mockUseDashboardData.mockReturnValue(
      queryResult({ data: { ...emptyDashboard, novedades_48h: articles } })
    );
    renderPage();

    expect(screen.getByText('Artículo a1')).toBeInTheDocument();
    expect(screen.queryByText('Artículo a11')).not.toBeInTheDocument();

    await user.click(within(screen.getByLabelText('Paginación')).getByRole('button', { name: '2' }));

    expect(screen.getByText('Artículo a11')).toBeInTheDocument();
    expect(screen.getByText('Artículo a12')).toBeInTheDocument();
    expect(screen.queryByText('Artículo a1')).not.toBeInTheDocument();
  });

  it('opens the drawer from router state and clears it', () => {
    const article = makeArticle('from-news', { titulo: 'Desde notificación' });
    renderPage([{ pathname: '/dashboard', state: { openArticle: article } }]);

    expect(screen.getByTestId('drawer-title')).toHaveTextContent('Desde notificación');
  });

  it('switches to the saved view when router state requests it', () => {
    const article = makeArticle('from-news');
    renderPage([
      { pathname: '/dashboard', state: { openArticle: article, targetViewMode: 'guardadas' } },
    ]);

    expect(screen.getByText('Total Guardados')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Guardadas' })).toBeChecked();
  });
});

describe('DoctorDashboardPage — saved view', () => {
  const recentJournal = makeArticle('s1', {
    titulo: 'Guardado journal reciente',
    tipoPublicacion: 'Journal Article',
    createdAt: new Date().toISOString(),
  });
  const oldLetter = makeArticle('s2', {
    titulo: 'Guardado carta vieja',
    tipoPublicacion: 'Letter',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  });

  const seedSaved = (items: Article[]) => {
    mockUseSavedArticles.mockReturnValue(
      queryResult({ data: { items, total: items.length, page: 0, size: 200 } })
    );
  };

  it('shows saved KPIs and articles', async () => {
    const user = userEvent.setup();
    seedSaved([recentJournal, oldLetter]);
    renderPage();

    await switchToSavedView(user);

    expect(screen.getByText('Guardado journal reciente')).toBeInTheDocument();
    expect(screen.getByText('Guardado carta vieja')).toBeInTheDocument();

    const totalCard = screen.getByText('Total Guardados').closest('div.cursor-pointer');
    expect(within(totalCard as HTMLElement).getByText('2')).toBeInTheDocument();

    // Explore-only controls disappear
    expect(screen.queryByRole('button', { name: /Sincronizar PubMed/ })).not.toBeInTheDocument();
  });

  it('shows an empty state when nothing has been saved', async () => {
    const user = userEvent.setup();
    renderPage();

    await switchToSavedView(user);

    expect(screen.getByText('Aún no has guardado ninguna noticia médica.')).toBeInTheDocument();
  });

  it('shows an error message when the saved query fails', async () => {
    const user = userEvent.setup();
    mockUseSavedArticles.mockReturnValue(queryResult({ isError: true }));
    renderPage();

    await switchToSavedView(user);

    expect(
      screen.getByText('Error al cargar tus noticias guardadas. Por favor, intenta de nuevo más tarde.')
    ).toBeInTheDocument();
  });

  it('filters saved articles by high evidence and resets with "Ver todos"', async () => {
    const user = userEvent.setup();
    seedSaved([recentJournal, oldLetter]);
    renderPage();
    await switchToSavedView(user);

    await user.click(screen.getByText('Alta Evidencia'));

    expect(screen.getByText('Guardado journal reciente')).toBeInTheDocument();
    expect(screen.queryByText('Guardado carta vieja')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Ver todos' }));

    expect(screen.getByText('Guardado carta vieja')).toBeInTheDocument();
  });

  it('filters saved articles created within the last 48 hours', async () => {
    const user = userEvent.setup();
    seedSaved([recentJournal, oldLetter]);
    renderPage();
    await switchToSavedView(user);

    await user.click(screen.getByText('Recientes (48h)'));

    expect(screen.getByText('Guardado journal reciente')).toBeInTheDocument();
    expect(screen.queryByText('Guardado carta vieja')).not.toBeInTheDocument();
  });

  it('shows a category-specific empty state when a filter has no matches', async () => {
    const user = userEvent.setup();
    seedSaved([oldLetter]);
    renderPage();
    await switchToSavedView(user);

    await user.click(screen.getByText('Alta Evidencia'));

    expect(screen.getByText('No hay artículos en esta categoría.')).toBeInTheDocument();
  });

  it('unsaves a saved article from its bookmark button', async () => {
    const user = userEvent.setup();
    seedSaved([recentJournal]);
    renderPage();
    await switchToSavedView(user);

    await user.click(screen.getByRole('button', { name: 'Quitar de guardados' }));

    expect(unsaveMutate).toHaveBeenCalledWith('s1');
    expect(saveMutate).not.toHaveBeenCalled();
  });

  it('unsaves from the drawer in saved view and closes it', async () => {
    const user = userEvent.setup();
    seedSaved([recentJournal]);
    renderPage();
    await switchToSavedView(user);

    await user.click(screen.getByText('Guardado journal reciente'));
    expect(screen.getByTestId('drawer-saved')).toHaveTextContent(/^guardado$/);

    await user.click(screen.getByRole('button', { name: 'Guardar desde detalle' }));

    expect(unsaveMutate).toHaveBeenCalledWith('s1');
    expect(screen.queryByTestId('article-drawer')).not.toBeInTheDocument();
  });

  it('renders an analyze button per saved article', async () => {
    const user = userEvent.setup();
    seedSaved([recentJournal]);
    renderPage();
    await switchToSavedView(user);

    expect(screen.getByTestId('analyze-s1')).toBeInTheDocument();
  });
});
