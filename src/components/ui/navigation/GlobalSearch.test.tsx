import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GlobalSearch } from './GlobalSearch';
import { usePatients } from '@features/patients/queries';
import { useRecentArticles, useSavedArticles } from '@features/news/queries';
import { useEspecialidades } from '@features/matching/queries';
import { useAuthStore } from '@features/auth/store';
import type { Article } from '@features/news/types';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual<typeof import('react-router-dom')>('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@features/patients/queries', () => ({
  usePatients: jest.fn(),
}));

jest.mock('@features/news/queries', () => ({
  useRecentArticles: jest.fn(),
  useSavedArticles: jest.fn(),
}));

jest.mock('@features/matching/queries', () => ({
  useEspecialidades: jest.fn(),
}));

jest.mock('@features/matching/specialtyVisuals', () => ({
  specialtyVisualById: jest.fn(() => ({
    key: 'cardiologia',
    name: 'Cardiología',
    Icon: () => null,
    sidebar: 'bg-rose-600',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200',
    dot: 'bg-rose-500',
  })),
}));

jest.mock('@features/auth/api', () => ({
  signOutCurrentUser: jest.fn(() => Promise.resolve()),
}));

function makeArticle(overrides: Partial<Article>): Article {
  return {
    id: 'a1',
    titulo: 'Artículo de prueba',
    autores: 'Pérez J',
    revista: 'Revista Médica',
    anioPub: '2024',
    mesPub: '03',
    doi: '10.1000/test',
    abstractText: 'Resumen',
    keywords: 'kw',
    tipoPublicacion: 'Journal Article',
    url: 'https://example.com',
    especialidadId: 'esp-1',
    tags: [],
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z',
    ...overrides,
  };
}

const patients = [
  { id: 'p1', expedienteExternoId: 'EXP-001', nombre: 'Ana López' },
  { id: 'p2', expedienteExternoId: 'EXP-002', nombre: 'José Martínez' },
];

const articles = [
  makeArticle({ id: 'a1', titulo: 'Avances en hipertensión arterial' }),
  makeArticle({ id: 'a2', titulo: 'Nuevos antibióticos en sepsis' }),
];

type PatientsResult = ReturnType<typeof usePatients>;
type RecentResult = ReturnType<typeof useRecentArticles>;
type SavedResult = ReturnType<typeof useSavedArticles>;
type EspecialidadesResult = ReturnType<typeof useEspecialidades>;

function seedQueryMocks({
  isLoadingPatients = false,
  isLoadingNews = false,
  savedIds = [] as string[],
} = {}) {
  jest.mocked(usePatients).mockReturnValue({
    data: patients,
    isLoading: isLoadingPatients,
  } as unknown as PatientsResult);
  jest.mocked(useRecentArticles).mockReturnValue({
    data: { items: articles, total: articles.length, page: 0, size: 50 },
    isLoading: isLoadingNews,
  } as unknown as RecentResult);
  jest.mocked(useSavedArticles).mockReturnValue({
    data: {
      items: articles.filter((a) => savedIds.includes(a.id)),
      total: savedIds.length,
      page: 0,
      size: 100,
    },
    isLoading: false,
  } as unknown as SavedResult);
  jest.mocked(useEspecialidades).mockReturnValue({
    byId: new Map(),
  } as unknown as EspecialidadesResult);
}

describe('GlobalSearch', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    useAuthStore.setState({ user: null, isAuthenticated: false });
    seedQueryMocks();
  });

  it('renders the search input with its placeholder', () => {
    render(<GlobalSearch />);
    expect(
      screen.getByPlaceholderText('Buscar pacientes, artículos, noticias...')
    ).toBeInTheDocument();
  });

  it('does not show the dropdown until the user types', async () => {
    render(<GlobalSearch />);

    await userEvent.click(screen.getByRole('searchbox'));

    expect(screen.queryByText('Pacientes')).not.toBeInTheDocument();
  });

  it('shows matching patients with their expediente when typing a name', async () => {
    render(<GlobalSearch />);

    await userEvent.type(screen.getByRole('searchbox'), 'ana');

    expect(screen.getByText('Pacientes')).toBeInTheDocument();
    expect(screen.getByText('Ana López')).toBeInTheDocument();
    expect(screen.getByText('Expediente: EXP-001')).toBeInTheDocument();
    expect(screen.queryByText('José Martínez')).not.toBeInTheDocument();
  });

  it('matches patients ignoring accents', async () => {
    render(<GlobalSearch />);

    await userEvent.type(screen.getByRole('searchbox'), 'jose');

    expect(screen.getByText('José Martínez')).toBeInTheDocument();
  });

  it('navigates to the patient history when a patient is selected', async () => {
    render(<GlobalSearch />);

    await userEvent.type(screen.getByRole('searchbox'), 'ana');
    await userEvent.click(screen.getByText('Ana López'));

    expect(mockNavigate).toHaveBeenCalledWith('/patients/p1/history');
  });

  it('shows matching articles with their journal name', async () => {
    render(<GlobalSearch />);

    await userEvent.type(screen.getByRole('searchbox'), 'hipertensión');

    expect(screen.getByText('Noticias y Artículos')).toBeInTheDocument();
    expect(screen.getByText('Avances en hipertensión arterial')).toBeInTheDocument();
    expect(screen.getByText('Revista Médica')).toBeInTheDocument();
  });

  it('marks saved articles with a "Guardado" badge', async () => {
    seedQueryMocks({ savedIds: ['a1'] });
    render(<GlobalSearch />);

    await userEvent.type(screen.getByRole('searchbox'), 'hipertensión');

    expect(screen.getByText('Guardado')).toBeInTheDocument();
  });

  it('navigates to the doctor dashboard with the article state on selection', async () => {
    render(<GlobalSearch />);

    await userEvent.type(screen.getByRole('searchbox'), 'hipertensión');
    await userEvent.click(screen.getByText('Avances en hipertensión arterial'));

    expect(mockNavigate).toHaveBeenCalledWith('/doctor/dashboard', {
      state: {
        openArticle: expect.objectContaining({ id: 'a1' }),
        targetViewMode: 'noticias',
      },
    });
  });

  it('targets the saved view when the selected article is saved', async () => {
    seedQueryMocks({ savedIds: ['a1'] });
    render(<GlobalSearch />);

    await userEvent.type(screen.getByRole('searchbox'), 'hipertensión');
    await userEvent.click(screen.getByText('Avances en hipertensión arterial'));

    expect(mockNavigate).toHaveBeenCalledWith('/doctor/dashboard', {
      state: expect.objectContaining({ targetViewMode: 'guardadas' }),
    });
  });

  it('navigates to the COO dashboard when the user role is COO', async () => {
    useAuthStore.setState({
      user: { id: 'u1', email: 'coo@medsync.mx', name: 'Carla Ortiz', role: 'COO' },
      isAuthenticated: true,
    });
    render(<GlobalSearch />);

    await userEvent.type(screen.getByRole('searchbox'), 'hipertensión');
    await userEvent.click(screen.getByText('Avances en hipertensión arterial'));

    expect(mockNavigate).toHaveBeenCalledWith('/coo/dashboard', expect.anything());
  });

  it('shows a no-results message for queries without matches', async () => {
    render(<GlobalSearch />);

    await userEvent.type(screen.getByRole('searchbox'), 'zzzz');

    expect(screen.getByText(/No se encontraron resultados para "zzzz"/)).toBeInTheDocument();
  });

  it('shows a loading state while patients are loading', async () => {
    seedQueryMocks({ isLoadingPatients: true });
    render(<GlobalSearch />);

    await userEvent.type(screen.getByRole('searchbox'), 'ana');

    expect(screen.getByText('Buscando...')).toBeInTheDocument();
  });

  it('closes the dropdown when Escape is pressed', async () => {
    render(<GlobalSearch />);

    await userEvent.type(screen.getByRole('searchbox'), 'ana');
    expect(screen.getByText('Ana López')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');

    expect(screen.queryByText('Ana López')).not.toBeInTheDocument();
  });

  it('focuses the search input on Ctrl+K', async () => {
    render(<GlobalSearch />);

    await userEvent.keyboard('{Control>}k{/Control}');

    expect(screen.getByRole('searchbox')).toHaveFocus();
  });
});
