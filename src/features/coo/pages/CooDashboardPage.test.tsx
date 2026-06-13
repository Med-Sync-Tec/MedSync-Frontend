import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { Article, PagedArticlesResponse } from '@features/news/types';
import type { DashboardData } from '@features/dashboard/types';

jest.mock('@features/news/api', () => ({
  getRecentArticles: jest.fn(),
  getSavedArticles: jest.fn(),
  syncRecentArticles: jest.fn(),
  markArticleAsRead: jest.fn(),
  saveArticle: jest.fn(),
  unsaveArticle: jest.fn(),
  analyzeArticle: jest.fn(),
}));

jest.mock('@features/dashboard/api', () => ({
  getDashboardData: jest.fn(),
}));

jest.mock('@features/inventory/api', () => ({
  fetchMedicamentos: jest.fn(),
}));

jest.mock('@features/matching/api', () => ({
  getCooMatchingArticles: jest.fn(),
  getMatchingArticles: jest.fn(),
  getMatchingPatients: jest.fn(),
  listEspecialidades: jest.fn(),
}));

import {
  getRecentArticles,
  getSavedArticles,
  syncRecentArticles,
  markArticleAsRead,
  saveArticle,
  unsaveArticle,
} from '@features/news/api';
import { getDashboardData } from '@features/dashboard/api';
import { fetchMedicamentos } from '@features/inventory/api';
import { getMatchingPatients, listEspecialidades } from '@features/matching/api';
import { CooDashboardPage } from './CooDashboardPage';

const mockGetRecentArticles = jest.mocked(getRecentArticles);
const mockGetSavedArticles = jest.mocked(getSavedArticles);
const mockSyncRecentArticles = jest.mocked(syncRecentArticles);
const mockMarkArticleAsRead = jest.mocked(markArticleAsRead);
const mockSaveArticle = jest.mocked(saveArticle);
const mockUnsaveArticle = jest.mocked(unsaveArticle);
const mockGetDashboardData = jest.mocked(getDashboardData);
const mockFetchMedicamentos = jest.mocked(fetchMedicamentos);
const mockGetMatchingPatients = jest.mocked(getMatchingPatients);
const mockListEspecialidades = jest.mocked(listEspecialidades);

const HOUR_MS = 60 * 60 * 1000;

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * HOUR_MS).toISOString();
}

function makeArticle(overrides: Partial<Article> = {}): Article {
  return {
    id: 'n1',
    titulo: 'Noticia uno',
    autores: 'Pérez J',
    revista: 'The Lancet',
    anioPub: '2026',
    mesPub: 'Ene',
    doi: '10.1000/demo',
    abstractText: 'Resumen del estudio.',
    keywords: 'kw',
    tipoPublicacion: 'Review',
    url: 'https://pubmed.example/n1',
    especialidadId: null,
    tags: [],
    createdAt: hoursAgo(2),
    updatedAt: hoursAgo(2),
    ...overrides,
  };
}

function page(items: Article[], total = items.length): PagedArticlesResponse {
  return { items, total, page: 0, size: items.length };
}

const EMPTY_DASHBOARD: DashboardData = {
  novedades_48h: [],
  no_leidos: [],
  por_especialidad: [],
  alta_evidencia: [],
};

function renderPage(initialEntries: Array<Record<string, unknown> | string> = ['/']) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries as never}>
        <CooDashboardPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

/** StatCard layout: label <p> and value <p> share the same flex row container. */
function expectStatValue(label: string, value: string) {
  const labelEl = screen.getByText(label);
  const row = labelEl.parentElement?.parentElement;
  expect(row).not.toBeNull();
  expect(within(row as HTMLElement).getByText(value)).toBeInTheDocument();
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetRecentArticles.mockResolvedValue(
    page([makeArticle(), makeArticle({ id: 'n2', titulo: 'Noticia dos' })]),
  );
  mockGetSavedArticles.mockResolvedValue(page([]));
  mockGetDashboardData.mockResolvedValue({
    ...EMPTY_DASHBOARD,
    no_leidos: [makeArticle()],
    alta_evidencia: [makeArticle(), makeArticle({ id: 'n2' })],
  });
  mockFetchMedicamentos.mockResolvedValue({
    content: [],
    page: 0,
    size: 1,
    totalElements: 7,
    totalPages: 7,
  });
  mockSyncRecentArticles.mockResolvedValue({ articulosProcesados: 3 });
  mockMarkArticleAsRead.mockResolvedValue(undefined);
  mockSaveArticle.mockResolvedValue(undefined);
  mockUnsaveArticle.mockResolvedValue(undefined);
  mockListEspecialidades.mockResolvedValue([]);
  mockGetMatchingPatients.mockResolvedValue([]);
});

describe('CooDashboardPage', () => {
  describe('news view', () => {
    it('renders the welcome panel and view toggle', async () => {
      renderPage();

      expect(
        screen.getByRole('heading', { name: 'Panel de Operaciones' }),
      ).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /Explorar/ })).toHaveAttribute(
        'aria-checked',
        'true',
      );
      expect(screen.getByRole('radio', { name: /Guardadas/ })).toHaveAttribute(
        'aria-checked',
        'false',
      );
      await screen.findByText('Noticia uno');
    });

    it('shows loading skeletons while articles load', () => {
      mockGetRecentArticles.mockReturnValue(new Promise(() => {}));

      const { container } = renderPage();

      expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThanOrEqual(3);
      expect(screen.queryByText('Noticia uno')).not.toBeInTheDocument();
    });

    it('shows the error message when loading articles fails', async () => {
      mockGetRecentArticles.mockRejectedValue(new Error('boom'));

      renderPage();

      expect(
        await screen.findByText('Error al cargar las noticias. Intenta de nuevo más tarde.'),
      ).toBeInTheDocument();
    });

    it('shows the empty message when there are no articles', async () => {
      mockGetRecentArticles.mockResolvedValue(page([]));

      renderPage();

      expect(
        await screen.findByText(
          'No hay noticias disponibles. Sincroniza con PubMed para traer artículos.',
        ),
      ).toBeInTheDocument();
    });

    it('renders the article list and the KPI cards', async () => {
      renderPage();

      expect(await screen.findByText('Noticia uno')).toBeInTheDocument();
      expect(screen.getByText('Noticia dos')).toBeInTheDocument();

      await waitFor(() => expectStatValue('Artículos PubMed', '2'));
      expectStatValue('Sin leer', '1');
      expectStatValue('Alta evidencia', '2');
      await waitFor(() => expectStatValue('Medicamentos', '7'));
    });

    it('syncs with PubMed when clicking the sync button', async () => {
      const user = userEvent.setup();
      renderPage();
      await screen.findByText('Noticia uno');

      await user.click(screen.getByRole('button', { name: /Sincronizar PubMed/ }));

      await waitFor(() => expect(mockSyncRecentArticles).toHaveBeenCalledTimes(1));
    });

    it('opens the detail drawer and marks the article as read', async () => {
      const user = userEvent.setup();
      renderPage();

      await user.click(await screen.findByText('Noticia uno'));

      expect(
        await screen.findByRole('dialog', { name: 'Noticia uno' }),
      ).toBeInTheDocument();
      expect(mockMarkArticleAsRead).toHaveBeenCalledWith('n1');

      await user.click(screen.getByRole('button', { name: 'Cerrar' }));
      expect(
        screen.queryByRole('dialog', { name: 'Noticia uno' }),
      ).not.toBeInTheDocument();
    });

    it('saves and unsaves an article from its card', async () => {
      const user = userEvent.setup();
      mockGetRecentArticles.mockResolvedValue(page([makeArticle()]));
      renderPage();
      await screen.findByText('Noticia uno');

      await user.click(screen.getByRole('button', { name: 'Guardar artículo' }));
      await waitFor(() => expect(mockSaveArticle).toHaveBeenCalledWith('n1'));

      await user.click(screen.getByRole('button', { name: 'Quitar de guardados' }));
      await waitFor(() => expect(mockUnsaveArticle).toHaveBeenCalledWith('n1'));
    });

    it('saves the open article from the drawer without closing it', async () => {
      const user = userEvent.setup();
      mockGetRecentArticles.mockResolvedValue(page([makeArticle()]));
      renderPage();

      await user.click(await screen.findByText('Noticia uno'));
      const dialog = await screen.findByRole('dialog', { name: 'Noticia uno' });

      await user.click(within(dialog).getByRole('button', { name: 'Guardar' }));

      await waitFor(() => expect(mockSaveArticle).toHaveBeenCalledWith('n1'));
      expect(screen.getByRole('dialog', { name: 'Noticia uno' })).toBeInTheDocument();
    });

    it('opens the analyze modal from a card without opening the drawer', async () => {
      const user = userEvent.setup();
      mockGetRecentArticles.mockResolvedValue(page([makeArticle()]));
      renderPage();
      await screen.findByText('Noticia uno');

      await user.click(screen.getByRole('button', { name: 'Analizar artículo con IA' }));

      expect(mockMarkArticleAsRead).not.toHaveBeenCalled();
      expect(
        screen.queryByRole('dialog', { name: 'Noticia uno' }),
      ).not.toBeInTheDocument();
    });

    it('paginates the news feed', async () => {
      mockGetRecentArticles.mockResolvedValue(page([makeArticle()], 25));
      const user = userEvent.setup();
      renderPage();
      await screen.findByText('Noticia uno');

      const pagination = screen.getByRole('navigation', { name: 'Paginación' });
      await user.click(within(pagination).getByRole('button', { name: '2' }));

      await waitFor(() => expect(mockGetRecentArticles).toHaveBeenCalledWith(1, 10));
    });
  });

  describe('saved view', () => {
    const SAVED_HIGH = makeArticle({
      id: 's1',
      titulo: 'Guardada alta evidencia',
      tipoPublicacion: 'Journal Article',
      createdAt: hoursAgo(100),
    });
    const SAVED_RECENT = makeArticle({
      id: 's2',
      titulo: 'Guardada reciente',
      tipoPublicacion: 'Review',
      createdAt: hoursAgo(1),
    });

    async function switchToSaved(user: ReturnType<typeof userEvent.setup>) {
      await user.click(screen.getByRole('radio', { name: /Guardadas/ }));
    }

    it('shows the saved KPI cards with filter counts', async () => {
      const user = userEvent.setup();
      mockGetSavedArticles.mockResolvedValue(page([SAVED_HIGH, SAVED_RECENT]));
      renderPage();

      await switchToSaved(user);

      expect(await screen.findByText('Guardada alta evidencia')).toBeInTheDocument();
      expectStatValue('Total Guardados', '2');
      expectStatValue('Alta Evidencia', '1');
      expectStatValue('Recientes (48h)', '1');
    });

    it('shows the empty message when nothing has been saved', async () => {
      const user = userEvent.setup();
      mockGetSavedArticles.mockResolvedValue(page([]));
      renderPage();

      await switchToSaved(user);

      expect(
        await screen.findByText('Aún no has guardado ninguna noticia médica.'),
      ).toBeInTheDocument();
    });

    it('shows an error message when loading saved articles fails', async () => {
      const user = userEvent.setup();
      mockGetSavedArticles.mockRejectedValue(new Error('boom'));
      renderPage();

      await switchToSaved(user);

      expect(
        await screen.findByText(
          'Error al cargar tus noticias guardadas. Intenta de nuevo más tarde.',
        ),
      ).toBeInTheDocument();
    });

    it('filters by high evidence and resets with "Ver todos"', async () => {
      const user = userEvent.setup();
      mockGetSavedArticles.mockResolvedValue(page([SAVED_HIGH, SAVED_RECENT]));
      renderPage();
      await switchToSaved(user);
      await screen.findByText('Guardada reciente');

      await user.click(screen.getByText('Alta Evidencia'));

      expect(screen.getByText('Guardada alta evidencia')).toBeInTheDocument();
      expect(screen.queryByText('Guardada reciente')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Ver todos' }));

      expect(screen.getByText('Guardada reciente')).toBeInTheDocument();
    });

    it('filters by recent (48h) saved articles', async () => {
      const user = userEvent.setup();
      mockGetSavedArticles.mockResolvedValue(page([SAVED_HIGH, SAVED_RECENT]));
      renderPage();
      await switchToSaved(user);
      await screen.findByText('Guardada reciente');

      await user.click(screen.getByText('Recientes (48h)'));

      expect(screen.getByText('Guardada reciente')).toBeInTheDocument();
      expect(screen.queryByText('Guardada alta evidencia')).not.toBeInTheDocument();
    });

    it('shows the category-empty message when a filter matches nothing', async () => {
      const user = userEvent.setup();
      mockGetSavedArticles.mockResolvedValue(page([SAVED_HIGH]));
      renderPage();
      await switchToSaved(user);
      await screen.findByText('Guardada alta evidencia');

      await user.click(screen.getByText('Recientes (48h)'));

      expect(screen.getByText('No hay artículos en esta categoría.')).toBeInTheDocument();
    });

    it('unsaves an article directly from the saved list', async () => {
      const user = userEvent.setup();
      mockGetSavedArticles.mockResolvedValue(page([SAVED_HIGH]));
      renderPage();
      await switchToSaved(user);
      await screen.findByText('Guardada alta evidencia');

      await user.click(screen.getByRole('button', { name: 'Quitar de guardados' }));

      await waitFor(() => expect(mockUnsaveArticle).toHaveBeenCalledWith('s1'));
    });

    it('unsaves from the drawer and closes it in saved view', async () => {
      const user = userEvent.setup();
      mockGetSavedArticles.mockResolvedValue(page([SAVED_HIGH]));
      renderPage();
      await switchToSaved(user);

      await user.click(await screen.findByText('Guardada alta evidencia'));
      const dialog = await screen.findByRole('dialog', { name: 'Guardada alta evidencia' });

      await user.click(within(dialog).getByRole('button', { name: 'Guardado' }));

      await waitFor(() => expect(mockUnsaveArticle).toHaveBeenCalledWith('s1'));
      expect(
        screen.queryByRole('dialog', { name: 'Guardada alta evidencia' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('router state handoff', () => {
    it('opens the article from location.state and switches the view mode', async () => {
      const article = makeArticle({ id: 'deep1', titulo: 'Desde notificación' });
      renderPage([
        {
          pathname: '/',
          state: { openArticle: article, targetViewMode: 'guardadas' },
        },
      ]);

      expect(
        await screen.findByRole('dialog', { name: 'Desde notificación' }),
      ).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /Guardadas/ })).toHaveAttribute(
        'aria-checked',
        'true',
      );
    });
  });
});
