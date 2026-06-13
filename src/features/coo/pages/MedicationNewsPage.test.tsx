import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Medicamento, MedicamentosPage } from '@features/inventory/schemas';
import type { MatchingArticle } from '@features/matching/schemas';

jest.mock('@features/inventory/api', () => ({
  fetchMedicamentos: jest.fn(),
}));

jest.mock('@features/matching/api', () => ({
  getCooMatchingArticles: jest.fn(),
  getMatchingArticles: jest.fn(),
  getMatchingPatients: jest.fn(),
  listEspecialidades: jest.fn(),
}));

import { fetchMedicamentos } from '@features/inventory/api';
import { getCooMatchingArticles, listEspecialidades } from '@features/matching/api';
import { MedicationNewsPage } from './MedicationNewsPage';

const mockFetchMedicamentos = jest.mocked(fetchMedicamentos);
const mockGetCooMatchingArticles = jest.mocked(getCooMatchingArticles);
const mockListEspecialidades = jest.mocked(listEspecialidades);

function makeMedicamento(overrides: Partial<Medicamento> = {}): Medicamento {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    nombre: 'Paracetamol',
    estado: 'vigente',
    descripcion: null,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: null,
    ...overrides,
  };
}

function makePage(content: Medicamento[]): MedicamentosPage {
  return { content, page: 0, size: 500, totalElements: content.length, totalPages: 1 };
}

function makeArticle(overrides: Partial<MatchingArticle> = {}): MatchingArticle {
  return {
    id: 'art-1',
    titulo: 'Estudio clínico',
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
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

const PARACETAMOL = makeMedicamento({
  id: '11111111-1111-4111-8111-111111111111',
  nombre: 'Paracetamol',
});
const IBUPROFENO = makeMedicamento({
  id: '22222222-2222-4222-8222-222222222222',
  nombre: 'Ibuprofeno',
});

const ARTICLE_PARACETAMOL = makeArticle({
  id: 'a1',
  titulo: 'Avances con paracetamol',
  tags: [{ id: 't1', tipo: 'medicamento', valor: 'Paracetamol' }],
});
const ARTICLE_IBUPROFENO = makeArticle({
  id: 'a2',
  titulo: 'Riesgos del ibuprofeno',
  tags: [{ id: 't2', tipo: 'medicamento', valor: 'Ibuprofeno' }],
});

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MedicationNewsPage />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockListEspecialidades.mockResolvedValue([]);
  mockFetchMedicamentos.mockResolvedValue(makePage([PARACETAMOL, IBUPROFENO]));
  mockGetCooMatchingArticles.mockResolvedValue([ARTICLE_PARACETAMOL, ARTICLE_IBUPROFENO]);
});

describe('MedicationNewsPage', () => {
  it('renders the page heading and intro copy', () => {
    renderPage();

    expect(
      screen.getByRole('heading', { name: 'Noticias por medicamento' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Artículos científicos que mencionan medicamentos de tu catálogo/),
    ).toBeInTheDocument();
  });

  it('renders the catalog chips with their per-medication match counts', async () => {
    renderPage();

    expect(
      await screen.findByRole('button', { name: 'Filtrar artículos por: Paracetamol' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Filtrar artículos por: Ibuprofeno' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('×1')).toHaveLength(2);
  });

  it('renders the matching articles feed', async () => {
    renderPage();

    expect(await screen.findByText('Avances con paracetamol')).toBeInTheDocument();
    expect(screen.getByText('Riesgos del ibuprofeno')).toBeInTheDocument();
  });

  it('filters the feed when toggling a medication chip and clears it', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(
      await screen.findByRole('button', { name: 'Filtrar artículos por: Paracetamol' }),
    );

    expect(screen.getByText('Avances con paracetamol')).toBeInTheDocument();
    expect(screen.queryByText('Riesgos del ibuprofeno')).not.toBeInTheDocument();
    expect(screen.getByText('Filtrando por')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Limpiar' }));

    expect(screen.getByText('Riesgos del ibuprofeno')).toBeInTheDocument();
    expect(screen.queryByText('Filtrando por')).not.toBeInTheDocument();
  });

  it('toggles a chip off when clicked twice', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(
      await screen.findByRole('button', { name: 'Filtrar artículos por: Paracetamol' }),
    );
    await user.click(screen.getByRole('button', { name: 'Quitar filtro: Paracetamol' }));

    expect(screen.getByText('Riesgos del ibuprofeno')).toBeInTheDocument();
    expect(screen.queryByText('Filtrando por')).not.toBeInTheDocument();
  });

  it('shows the catalog error state and retries the request', async () => {
    const user = userEvent.setup();
    mockFetchMedicamentos.mockRejectedValue(new Error('catálogo caído'));
    renderPage();

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('No pudimos cargar el catálogo de medicamentos.');
    expect(mockFetchMedicamentos).toHaveBeenCalledTimes(1);

    await user.click(within(alert).getByRole('button', { name: 'Reintentar' }));

    await waitFor(() => expect(mockFetchMedicamentos).toHaveBeenCalledTimes(2));
  });

  it('shows the empty-catalog message when there are no medications', async () => {
    mockFetchMedicamentos.mockResolvedValue(makePage([]));
    mockGetCooMatchingArticles.mockResolvedValue([]);
    renderPage();

    expect(
      await screen.findByText('No hay medicamentos en el catálogo.'),
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Sin medicamentos en el catálogo'),
    ).toBeInTheDocument();
  });
});
