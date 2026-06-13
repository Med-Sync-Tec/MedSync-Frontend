import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Article, PagedArticlesResponse } from '@features/news/types';

const mockAuthState = {
  user: { name: 'Dra. García' } as { name: string } | null,
};

const mockMatchingState = {
  byId: new Map<string, { id: string; nombre: string; slug?: string }>(),
};

jest.mock('@features/news/queries', () => ({
  useSavedArticles: jest.fn(),
  useUnsaveArticle: jest.fn(),
  useMarkArticleAsRead: jest.fn(),
}));

jest.mock('@features/matching/queries', () => ({
  useEspecialidades: () => ({ byId: mockMatchingState.byId }),
}));

jest.mock('@features/auth/store', () => ({
  useAuthStore: (selector: (s: { user: { name: string } | null }) => unknown) =>
    selector(mockAuthState),
}));

jest.mock('@ui/cards/ArticleDetailDrawer', () => {
  // El factory no puede capturar el React importado afuera; se carga local.
  const ReactActual = jest.requireActual<typeof import('react')>('react');
  return {
  ArticleDetailDrawer: ({
    article,
    onClose,
  }: {
    article: { titulo: string } | null;
    onClose: () => void;
  }) =>
    article
      ? ReactActual.createElement(
          'div',
          { 'data-testid': 'article-drawer' },
          article.titulo,
          ReactActual.createElement('button', { type: 'button', onClick: onClose }, 'Cerrar drawer'),
        )
      : null,
  };
});

import {
  useSavedArticles,
  useUnsaveArticle,
  useMarkArticleAsRead,
} from '@features/news/queries';
import { useSearchStore } from '@features/search/store';
import { SavedNewsPage } from './SavedNewsPage';

const mockUseSavedArticles = jest.mocked(useSavedArticles);
const mockUseUnsaveArticle = jest.mocked(useUnsaveArticle);
const mockUseMarkArticleAsRead = jest.mocked(useMarkArticleAsRead);

const unsaveMutate = jest.fn();
const markReadMutate = jest.fn();

const MS_PER_HOUR = 60 * 60 * 1000;
const hoursAgo = (hours: number) => new Date(Date.now() - hours * MS_PER_HOUR).toISOString();

let articleSeq = 0;
const makeArticle = (overrides: Partial<Article> = {}): Article => {
  articleSeq += 1;
  return {
    id: `a${articleSeq}`,
    titulo: `Artículo de prueba ${articleSeq}`,
    autores: 'Pérez J',
    revista: 'NEJM',
    anioPub: '2026',
    mesPub: '01',
    doi: '10.1/x',
    abstractText: 'Resumen del estudio',
    keywords: 'kw',
    tipoPublicacion: 'Journal Article',
    url: 'https://example.com',
    especialidadId: null,
    tags: [],
    createdAt: hoursAgo(100),
    updatedAt: hoursAgo(5),
    ...overrides,
  };
};

type SavedArticlesResult = ReturnType<typeof useSavedArticles>;

const setSavedState = (state: {
  data?: PagedArticlesResponse;
  isLoading?: boolean;
  isError?: boolean;
}) => {
  mockUseSavedArticles.mockReturnValue({
    data: state.data,
    isLoading: state.isLoading ?? false,
    isError: state.isError ?? false,
  } as unknown as SavedArticlesResult);
};

const setItems = (items: Article[], total = items.length) => {
  setSavedState({ data: { items, total, page: 0, size: 200 } });
};

beforeEach(() => {
  jest.clearAllMocks();
  articleSeq = 0;
  mockAuthState.user = { name: 'Dra. García' };
  mockMatchingState.byId = new Map();
  useSearchStore.setState({ query: '' });
  mockUseUnsaveArticle.mockReturnValue({
    mutate: unsaveMutate,
  } as unknown as ReturnType<typeof useUnsaveArticle>);
  mockUseMarkArticleAsRead.mockReturnValue({
    mutate: markReadMutate,
  } as unknown as ReturnType<typeof useMarkArticleAsRead>);
});

describe('SavedNewsPage — fetch states', () => {
  it('shows skeleton placeholders while loading', () => {
    // Arrange
    setSavedState({ isLoading: true });

    // Act
    const { container } = render(<SavedNewsPage />);

    // Assert
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(3);
    expect(screen.queryByText(/Error al cargar/)).not.toBeInTheDocument();
  });

  it('shows an error message when the fetch fails', () => {
    setSavedState({ isError: true });

    render(<SavedNewsPage />);

    expect(
      screen.getByText(
        'Error al cargar tus noticias guardadas. Por favor, intenta de nuevo más tarde.',
      ),
    ).toBeInTheDocument();
  });

  it('shows an empty state when no articles are saved', () => {
    setItems([]);

    render(<SavedNewsPage />);

    expect(
      screen.getByText('Aún no has guardado ninguna noticia médica.'),
    ).toBeInTheDocument();
  });
});

describe('SavedNewsPage — header and KPIs', () => {
  it('greets the logged-in doctor and shows the backend total', () => {
    // Arrange
    setItems([makeArticle(), makeArticle()], 57);

    // Act
    render(<SavedNewsPage />);

    // Assert
    expect(screen.getByText(/consulta posterior, Dra\. García\./)).toBeInTheDocument();
    expect(screen.getByText('Total Guardados')).toBeInTheDocument();
    expect(screen.getByText('57')).toBeInTheDocument();
  });

  it('falls back to "Doctor" when no user is logged in', () => {
    mockAuthState.user = null;
    setItems([]);

    render(<SavedNewsPage />);

    expect(screen.getByText(/consulta posterior, Doctor\./)).toBeInTheDocument();
  });
});

describe('SavedNewsPage — article list', () => {
  it('renders saved article cards with title, journal, and excerpt', () => {
    setItems([
      makeArticle({ titulo: 'Avances en hipertension clinica', revista: 'The Lancet' }),
    ]);

    render(<SavedNewsPage />);

    expect(screen.getByText('Avances en hipertension clinica')).toBeInTheDocument();
    expect(screen.getByText('The Lancet')).toBeInTheDocument();
    expect(screen.getByText('Resumen del estudio')).toBeInTheDocument();
    expect(screen.getByText('Todos los artículos guardados')).toBeInTheDocument();
  });

  it.each([
    [0.5, 'Hace un momento'],
    [5.5, 'Hace 5 horas'],
    [30, 'Ayer'],
    [80, 'Hace 3 días'],
  ])('formats updatedAt %s hours ago as "%s"', (hours, expected) => {
    setItems([makeArticle({ updatedAt: hoursAgo(hours) })]);

    render(<SavedNewsPage />);

    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it('still renders an article without tags or publication type', () => {
    // Covers the "General" category fallback (the specialty visual takes
    // precedence in the card, so the fallback label itself is not displayed).
    setItems([makeArticle({ titulo: 'Sin metadatos', tags: [], tipoPublicacion: '' })]);

    render(<SavedNewsPage />);

    expect(screen.getByText('Sin metadatos')).toBeInTheDocument();
  });

  it('falls back to "Reciente" when updatedAt is empty', () => {
    setItems([makeArticle({ updatedAt: '' })]);

    render(<SavedNewsPage />);

    expect(screen.getByText('Reciente')).toBeInTheDocument();
  });

  it('opens the detail drawer and marks the article as read on click', async () => {
    // Arrange
    const user = userEvent.setup();
    const article = makeArticle({ titulo: 'Estudio de cardiología' });
    setItems([article]);
    render(<SavedNewsPage />);

    // Act
    await user.click(screen.getByText('Estudio de cardiología'));

    // Assert
    expect(markReadMutate).toHaveBeenCalledWith(article.id);
    expect(screen.getByTestId('article-drawer')).toHaveTextContent('Estudio de cardiología');
  });

  it('closes the detail drawer via its onClose callback', async () => {
    // Arrange
    const user = userEvent.setup();
    setItems([makeArticle({ titulo: 'Estudio abierto' })]);
    render(<SavedNewsPage />);
    await user.click(screen.getByText('Estudio abierto'));
    expect(screen.getByTestId('article-drawer')).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar drawer' }));

    // Assert
    expect(screen.queryByTestId('article-drawer')).not.toBeInTheDocument();
  });

  it('unsaves an article via the bookmark without opening the drawer', async () => {
    // Arrange
    const user = userEvent.setup();
    const article = makeArticle();
    setItems([article]);
    render(<SavedNewsPage />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Quitar de guardados' }));

    // Assert
    expect(unsaveMutate).toHaveBeenCalledWith(article.id);
    expect(markReadMutate).not.toHaveBeenCalled();
    expect(screen.queryByTestId('article-drawer')).not.toBeInTheDocument();
  });
});

describe('SavedNewsPage — KPI filters', () => {
  it('filters to high-evidence articles and back with "Ver todos"', async () => {
    // Arrange
    const user = userEvent.setup();
    setItems([
      makeArticle({ titulo: 'Artículo journal', tipoPublicacion: 'Journal Article' }),
      makeArticle({ titulo: 'Artículo review', tipoPublicacion: 'Review' }),
    ]);
    render(<SavedNewsPage />);

    // Act — filter
    await user.click(screen.getByText('Alta Evidencia'));

    // Assert — only the Journal Article remains
    expect(screen.getByText('Artículos de Alta Evidencia')).toBeInTheDocument();
    expect(screen.getByText('Artículo journal')).toBeInTheDocument();
    expect(screen.queryByText('Artículo review')).not.toBeInTheDocument();

    // Act — reset
    await user.click(screen.getByRole('button', { name: 'Ver todos' }));

    // Assert — both visible again
    expect(screen.getByText('Todos los artículos guardados')).toBeInTheDocument();
    expect(screen.getByText('Artículo review')).toBeInTheDocument();
  });

  it('filters to articles created in the last 48 hours', async () => {
    const user = userEvent.setup();
    setItems([
      makeArticle({ titulo: 'Artículo fresco', createdAt: hoursAgo(1) }),
      makeArticle({ titulo: 'Artículo viejo', createdAt: hoursAgo(100) }),
    ]);
    render(<SavedNewsPage />);

    await user.click(screen.getByText('Recientes (48h)'));

    expect(screen.getByText('Artículos recientes (48h)')).toBeInTheDocument();
    expect(screen.getByText('Artículo fresco')).toBeInTheDocument();
    expect(screen.queryByText('Artículo viejo')).not.toBeInTheDocument();
  });

  it('returns to "all" when clicking the Total Guardados card', async () => {
    const user = userEvent.setup();
    setItems([
      makeArticle({ titulo: 'Artículo journal', tipoPublicacion: 'Journal Article' }),
      makeArticle({ titulo: 'Artículo review', tipoPublicacion: 'Review' }),
    ]);
    render(<SavedNewsPage />);
    await user.click(screen.getByText('Alta Evidencia'));
    expect(screen.queryByText('Artículo review')).not.toBeInTheDocument();

    await user.click(screen.getByText('Total Guardados'));

    expect(screen.getByText('Todos los artículos guardados')).toBeInTheDocument();
    expect(screen.getByText('Artículo review')).toBeInTheDocument();
  });

  it('keeps the "all" filter when clicking the Colecciones card', async () => {
    const user = userEvent.setup();
    setItems([makeArticle({ titulo: 'Único artículo' })]);
    render(<SavedNewsPage />);

    await user.click(screen.getByText('Colecciones'));

    expect(screen.getByText('Todos los artículos guardados')).toBeInTheDocument();
    expect(screen.getByText('Único artículo')).toBeInTheDocument();
  });

  it('shows a category-specific empty state when the filter matches nothing', async () => {
    const user = userEvent.setup();
    setItems([makeArticle({ tipoPublicacion: 'Review' })]);
    render(<SavedNewsPage />);

    await user.click(screen.getByText('Alta Evidencia'));

    expect(screen.getByText('No hay artículos en esta categoría.')).toBeInTheDocument();
  });
});

describe('SavedNewsPage — search', () => {
  it('matches titles accent-insensitively', () => {
    // Arrange
    useSearchStore.setState({ query: 'hipertensión' });
    setItems([
      makeArticle({ titulo: 'Avances en hipertension clinica' }),
      makeArticle({ titulo: 'Otro tema' }),
    ]);

    // Act
    render(<SavedNewsPage />);

    // Assert
    expect(screen.getByText('Avances en hipertension clinica')).toBeInTheDocument();
    expect(screen.queryByText('Otro tema')).not.toBeInTheDocument();
  });

  it('matches by tag value', () => {
    useSearchStore.setState({ query: 'losartan' });
    setItems([
      makeArticle({
        titulo: 'Con etiqueta',
        abstractText: 'Sin coincidencia',
        tags: [{ id: 't1', tipo: 'medicamento', valor: 'Losartán', createdAt: hoursAgo(1) }],
      }),
      makeArticle({ titulo: 'Sin etiqueta', abstractText: 'Sin coincidencia' }),
    ]);

    render(<SavedNewsPage />);

    expect(screen.getByText('Con etiqueta')).toBeInTheDocument();
    expect(screen.queryByText('Sin etiqueta')).not.toBeInTheDocument();
  });

  it('matches by abstract text', () => {
    useSearchStore.setState({ query: 'metformina' });
    setItems([
      makeArticle({ titulo: 'Coincide abstract', abstractText: 'Eficacia de la Metformina' }),
      makeArticle({ titulo: 'No coincide' }),
    ]);

    render(<SavedNewsPage />);

    expect(screen.getByText('Coincide abstract')).toBeInTheDocument();
    expect(screen.queryByText('No coincide')).not.toBeInTheDocument();
  });

  it('matches by specialty name from the catalog', () => {
    mockMatchingState.byId = new Map([
      ['esp-1', { id: 'esp-1', nombre: 'Cardiología', slug: 'cardiologia' }],
      ['esp-2', { id: 'esp-2', nombre: 'Neurología', slug: 'neurologia' }],
    ]);
    useSearchStore.setState({ query: 'cardiologia' });
    setItems([
      makeArticle({ titulo: 'De cardio', especialidadId: 'esp-1' }),
      makeArticle({ titulo: 'De neuro', especialidadId: 'esp-2' }),
      makeArticle({ titulo: 'Sin especialidad', especialidadId: null }),
    ]);

    render(<SavedNewsPage />);

    expect(screen.getByText('De cardio')).toBeInTheDocument();
    expect(screen.queryByText('De neuro')).not.toBeInTheDocument();
    expect(screen.queryByText('Sin especialidad')).not.toBeInTheDocument();
  });

  it('shows the category empty state when the query matches nothing', () => {
    useSearchStore.setState({ query: 'zzz-sin-resultados' });
    setItems([makeArticle()]);

    render(<SavedNewsPage />);

    expect(screen.getByText('No hay artículos en esta categoría.')).toBeInTheDocument();
  });

  it('ignores whitespace-only queries', () => {
    useSearchStore.setState({ query: '   ' });
    setItems([makeArticle({ titulo: 'Visible siempre' })]);

    render(<SavedNewsPage />);

    expect(screen.getByText('Visible siempre')).toBeInTheDocument();
  });
});

describe('SavedNewsPage — pagination', () => {
  it('hides the pagination for 10 or fewer articles', () => {
    setItems(Array.from({ length: 3 }, () => makeArticle()));

    render(<SavedNewsPage />);

    expect(screen.queryByRole('navigation', { name: 'Paginación' })).not.toBeInTheDocument();
  });

  it('paginates client-side at 10 items per page', async () => {
    // Arrange
    const user = userEvent.setup();
    setItems(Array.from({ length: 12 }, (_, i) => makeArticle({ titulo: `Artículo número ${i + 1}` })));
    render(<SavedNewsPage />);

    // Assert — first page
    expect(screen.getByRole('navigation', { name: 'Paginación' })).toBeInTheDocument();
    expect(screen.getByText('Artículo número 1')).toBeInTheDocument();
    expect(screen.getByText('Artículo número 10')).toBeInTheDocument();
    expect(screen.queryByText('Artículo número 11')).not.toBeInTheDocument();

    // Act — go to page 2
    await user.click(screen.getByRole('button', { name: '2' }));

    // Assert — second page
    expect(screen.getByText('Artículo número 11')).toBeInTheDocument();
    expect(screen.getByText('Artículo número 12')).toBeInTheDocument();
    expect(screen.queryByText('Artículo número 1')).not.toBeInTheDocument();
  });

  it('resets to page 1 when changing the KPI filter', async () => {
    // Arrange — 11 journal articles so both "all" and "alta_evidencia" paginate
    const user = userEvent.setup();
    setItems(
      Array.from({ length: 11 }, (_, i) => makeArticle({ titulo: `Artículo número ${i + 1}` })),
    );
    render(<SavedNewsPage />);
    await user.click(screen.getByRole('button', { name: '2' }));
    expect(screen.getByText('Artículo número 11')).toBeInTheDocument();

    // Act
    await user.click(screen.getByText('Alta Evidencia'));

    // Assert — back to page 1 of the filtered list
    expect(screen.getByText('Artículo número 1')).toBeInTheDocument();
    expect(screen.queryByText('Artículo número 11')).not.toBeInTheDocument();
  });
});
