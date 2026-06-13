import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { ArticleDetailDrawer } from './ArticleDetailDrawer';
import { getMatchingPatients, listEspecialidades } from '@features/matching/api';
import { PatientSchema } from '@features/patients/schemas';
import type { Patient } from '@features/patients/schemas';
import type { AuthUser } from '@features/auth/schemas';
import type { Article } from '@features/news/types';

const mockAuthState = {
  current: null as AuthUser | null,
};

jest.mock('@features/auth/store', () => ({
  useAuthStore: (selector: (state: { user: AuthUser | null }) => unknown) =>
    selector({ user: mockAuthState.current }),
}));

jest.mock('@features/matching/api', () => ({
  getMatchingArticles: jest.fn(),
  getCooMatchingArticles: jest.fn(),
  getMatchingPatients: jest.fn(),
  listEspecialidades: jest.fn(),
}));

const doctorUser: AuthUser = {
  id: 'u-1',
  email: 'doc@medsync.mx',
  name: 'Dra. Ramírez',
  role: 'DOCTOR',
};

const baseArticle: Article = {
  id: 'a-1',
  titulo: 'Nuevas guías de hipertensión arterial',
  autores: 'García J, López M',
  revista: 'The Lancet',
  anioPub: '2024',
  mesPub: 'Mar',
  doi: '10.1000/xyz123',
  abstractText: 'Resumen del estudio sobre presión arterial.',
  keywords: 'hipertensión, presión arterial',
  tipoPublicacion: 'Ensayo clínico',
  url: 'https://pubmed.ncbi.nlm.nih.gov/123',
  especialidadId: null,
  tags: [
    { id: 't-1', tipo: 'enfermedad', valor: 'hipertensión', createdAt: '2024-01-01T00:00:00Z' },
  ],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

function makePatient(id: string, nombre: string): Patient {
  return PatientSchema.parse({
    id,
    expedienteExternoId: `EXP-${id}`,
    nombre,
    fechaNacimiento: '1990-01-01',
    genero: 'F',
    medicoId: 'd-1',
    activo: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  });
}

type DrawerProps = React.ComponentProps<typeof ArticleDetailDrawer>;

function renderDrawer(props: Partial<DrawerProps> = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ArticleDetailDrawer article={baseArticle} onClose={jest.fn()} {...props} />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockAuthState.current = null;
  jest.mocked(listEspecialidades).mockResolvedValue([]);
  jest.mocked(getMatchingPatients).mockResolvedValue([]);
});

describe('ArticleDetailDrawer', () => {
  it('renders nothing when article is null', () => {
    const { container } = renderDrawer({ article: null });
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the dialog with title and metadata', () => {
    renderDrawer();

    expect(
      screen.getByRole('dialog', { name: 'Nuevas guías de hipertensión arterial' })
    ).toBeInTheDocument();
    expect(screen.getByText('The Lancet')).toBeInTheDocument();
    expect(screen.getByText('García J, López M')).toBeInTheDocument();
    expect(screen.getByText('Ensayo clínico')).toBeInTheDocument();
    expect(screen.getByText('Mar 2024')).toBeInTheDocument();
  });

  it('renders only the year when mesPub is missing', () => {
    renderDrawer({ article: { ...baseArticle, mesPub: '' } });
    expect(screen.getByText('2024')).toBeInTheDocument();
  });

  it('renders "Fecha desconocida" when anioPub is missing', () => {
    renderDrawer({ article: { ...baseArticle, anioPub: '' } });
    expect(screen.getByText('Fecha desconocida')).toBeInTheDocument();
  });

  it('hides revista and autores rows when empty', () => {
    renderDrawer({ article: { ...baseArticle, revista: '', autores: '' } });
    expect(screen.queryByText('The Lancet')).not.toBeInTheDocument();
    expect(screen.queryByText('García J, López M')).not.toBeInTheDocument();
  });

  it('shows high confidence for high-evidence articles', () => {
    renderDrawer({ isHighEvidence: true });
    expect(screen.getByText('Alto')).toBeInTheDocument();
  });

  it('shows medium confidence when the article has tags', () => {
    renderDrawer();
    expect(screen.getByText('Medio')).toBeInTheDocument();
  });

  it('shows low confidence without tags nor high evidence', () => {
    renderDrawer({ article: { ...baseArticle, tags: [] } });
    expect(screen.getByText('Bajo')).toBeInTheDocument();
  });

  it('renders the main tag pill and the clinical tags section', () => {
    renderDrawer();

    expect(screen.getByText('HIPERTENSIÓN')).toBeInTheDocument();
    expect(screen.getByText('Etiquetas Clínicas')).toBeInTheDocument();
    expect(screen.getByText('hipertensión')).toBeInTheDocument();
  });

  it('hides the tags section when there are no tags', () => {
    renderDrawer({ article: { ...baseArticle, tags: [] } });
    expect(screen.queryByText('Etiquetas Clínicas')).not.toBeInTheDocument();
  });

  it('renders abstract, keywords and DOI sections', () => {
    renderDrawer();

    expect(screen.getByText('Resumen del Estudio')).toBeInTheDocument();
    expect(screen.getByText('Resumen del estudio sobre presión arterial.')).toBeInTheDocument();
    expect(screen.getByText('Palabras Clave')).toBeInTheDocument();
    expect(screen.getByText('hipertensión, presión arterial')).toBeInTheDocument();
    expect(screen.getByText('DOI')).toBeInTheDocument();
    expect(screen.getByText('10.1000/xyz123')).toBeInTheDocument();
  });

  it('hides abstract, keywords and DOI sections when empty', () => {
    renderDrawer({
      article: { ...baseArticle, abstractText: '', keywords: '', doi: '' },
    });

    expect(screen.queryByText('Resumen del Estudio')).not.toBeInTheDocument();
    expect(screen.queryByText('Palabras Clave')).not.toBeInTheDocument();
    expect(screen.queryByText('DOI')).not.toBeInTheDocument();
  });

  it('calls onClose when Escape is pressed', () => {
    const onClose = jest.fn();
    renderDrawer({ onClose });

    fireEvent.keyDown(globalThis, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose from the close button', async () => {
    const onClose = jest.fn();
    renderDrawer({ onClose });

    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = jest.fn();
    const { container } = renderDrawer({ onClose });

    const backdrop = container.querySelector('.z-40');
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop as Element);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('locks body scroll while open', () => {
    renderDrawer();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('renders the save button and calls onSave', async () => {
    const onSave = jest.fn();
    renderDrawer({ onSave });

    await userEvent.click(screen.getByRole('button', { name: /Guardar/ }));

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('shows "Guardado" when the article is saved', () => {
    renderDrawer({ onSave: jest.fn(), saved: true });
    expect(screen.getByRole('button', { name: 'Guardado' })).toBeInTheDocument();
  });

  it('renders the analyzeButton slot', () => {
    renderDrawer({ analyzeButton: <button type="button">Analizar con IA</button> });
    expect(screen.getByRole('button', { name: 'Analizar con IA' })).toBeInTheDocument();
  });

  it('renders the PubMed link with the article url', () => {
    renderDrawer();

    const link = screen.getByRole('link', { name: /Ver artículo original en PubMed/ });
    expect(link).toHaveAttribute('href', 'https://pubmed.ncbi.nlm.nih.gov/123');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('renders no footer without onSave, analyzeButton nor url', () => {
    renderDrawer({ article: { ...baseArticle, url: '' } });

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Guardar/ })).not.toBeInTheDocument();
  });

  describe('related patients (doctor only)', () => {
    const sevenPatients = [
      makePatient('p1', 'Ana Bravo'),
      makePatient('p2', 'Carlos Díaz'),
      makePatient('p3', 'Elena Flores'),
      makePatient('p4', 'Gloria Hernández'),
      makePatient('p5', 'Iván Juárez'),
      makePatient('p6', 'Karla Luna'),
      makePatient('p7', 'Mario Núñez'),
    ];

    it('shows up to five patient initials with link to their history', async () => {
      mockAuthState.current = doctorUser;
      jest.mocked(getMatchingPatients).mockResolvedValue(sevenPatients);

      renderDrawer();

      expect(await screen.findByText('Pacientes Relacionados')).toBeInTheDocument();
      const firstPatient = screen.getByRole('link', { name: 'AB' });
      expect(firstPatient).toHaveAttribute('href', '/patients/p1/history');
      expect(screen.getByText('IJ')).toBeInTheDocument();
      expect(screen.queryByText('KL')).not.toBeInTheDocument();
    });

    it('expands the full patient list when "+N" is clicked', async () => {
      mockAuthState.current = doctorUser;
      jest.mocked(getMatchingPatients).mockResolvedValue(sevenPatients);

      renderDrawer();

      const expandButton = await screen.findByRole('button', { name: '+2' });
      await userEvent.click(expandButton);

      expect(screen.getByText('KL')).toBeInTheDocument();
      expect(screen.getByText('MN')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '+2' })).not.toBeInTheDocument();
    });

    it('hides the section for non-doctor users', () => {
      mockAuthState.current = { ...doctorUser, role: 'COO' };

      renderDrawer();

      expect(screen.queryByText('Pacientes Relacionados')).not.toBeInTheDocument();
      expect(getMatchingPatients).not.toHaveBeenCalled();
    });
  });
});
