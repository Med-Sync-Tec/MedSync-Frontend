import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ApiError } from '@lib/http/errors';
import type { Consulta } from '@features/consultations/schemas';

jest.mock('@features/patients/queries', () => ({
  usePatientDetail: jest.fn(),
  usePacienteContextos: jest.fn(),
}));

jest.mock('@features/matching/queries', () => ({
  useMatchingArticles: jest.fn(),
}));

jest.mock('@features/patients/components/PatientContextosPanel', () => ({
  PatientContextosPanel: ({
    selectedTagKeys,
    onToggleFilter,
  }: {
    selectedTagKeys: ReadonlySet<string>;
    onToggleFilter: (key: string) => void;
  }) => (
    <div data-testid="contextos-panel">
      <span data-testid="selected-count">{selectedTagKeys.size}</span>
      <button type="button" onClick={() => onToggleFilter('enfermedad::asma')}>
        Alternar filtro
      </button>
    </div>
  ),
}));

jest.mock('@features/matching/components/MatchingArticlesPanel', () => ({
  MatchingArticlesPanel: ({ onClearFilter }: { onClearFilter: () => void }) => (
    <div data-testid="matching-panel">
      <button type="button" onClick={onClearFilter}>
        Limpiar filtro
      </button>
    </div>
  ),
}));

jest.mock('@ui/cards/PatientDetailCard', () => ({
  PatientDetailCard: ({ patient }: { patient: { nombre: string } }) => (
    <div data-testid="patient-detail-card">{patient.nombre}</div>
  ),
}));

jest.mock('@features/consultations/components/AnalyzeConsultaButton', () => ({
  AnalyzeConsultaButton: ({ consultaId }: { consultaId: string }) => (
    <button type="button" data-testid={`analyze-${consultaId}`}>
      Sugerir con IA
    </button>
  ),
}));

import {
  usePatientDetail,
  usePacienteContextos,
  type PatientDetailResult,
} from '@features/patients/queries';
import { useMatchingArticles } from '@features/matching/queries';
import { ConsultationHistoryPage } from './ConsultationHistoryPage';

const mockUsePatientDetail = jest.mocked(usePatientDetail);
const mockUsePacienteContextos = jest.mocked(usePacienteContextos);
const mockUseMatchingArticles = jest.mocked(useMatchingArticles);

const PATIENT = {
  id: 'p1',
  expedienteExternoId: 'EXP-001',
  nombre: 'Juan Pérez',
  fechaNacimiento: '1990-01-01',
  genero: 'Masculino',
  medicoId: 'doc-1',
  activo: true,
  createdAt: '2024-01-01T00:00:00',
  updatedAt: '2024-06-01T00:00:00',
};

function makeConsulta(id: string, fecha: string): Consulta {
  return {
    id,
    fecha,
    motivoConsulta: `Motivo ${id}`,
    subjetivo: `Subjetivo ${id}`,
    objetivo: `Objetivo ${id}`,
    evaluacion: `Evaluación ${id}`,
    plan: `Plan ${id}`,
    prescripcion: '',
    diagnostico: `Diagnóstico ${id}`,
    createdAt: fecha,
  };
}

function detailResult(overrides: Partial<PatientDetailResult> = {}): PatientDetailResult {
  return {
    data: null,
    isLoading: false,
    isFetching: false,
    error: null,
    refetch: jest.fn(),
    ...overrides,
  };
}

function dataResult(consultas: Consulta[]): PatientDetailResult {
  return detailResult({
    data: { patient: PATIENT, expediente: null, consultas },
  });
}

function renderPage(initialEntry = '/patients/p1/history') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/patients/:patientId/history" element={<ConsultationHistoryPage />} />
        <Route path="/history-sin-id" element={<ConsultationHistoryPage />} />
        <Route path="/doctor/patients" element={<div>Página de pacientes</div>} />
        <Route
          path="/patients/:patientId/consultas/new"
          element={<div>Página de nueva consulta</div>}
        />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUsePatientDetail.mockReturnValue(detailResult());
  mockUsePacienteContextos.mockReturnValue({
    data: undefined,
    error: null,
  } as unknown as ReturnType<typeof usePacienteContextos>);
  mockUseMatchingArticles.mockReturnValue({
    data: undefined,
    error: null,
  } as unknown as ReturnType<typeof useMatchingArticles>);
});

describe('ConsultationHistoryPage', () => {
  it('shows a guidance error and navigates to patients when patientId is missing', async () => {
    const user = userEvent.setup();
    renderPage('/history-sin-id');

    expect(screen.getByText('Paciente no especificado')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Ir a pacientes' }));

    expect(screen.getByText('Página de pacientes')).toBeInTheDocument();
  });

  it('shows the loading breadcrumb and skeletons while fetching', () => {
    mockUsePatientDetail.mockReturnValue(detailResult({ isLoading: true }));
    renderPage();

    expect(screen.getByText('Cargando…')).toBeInTheDocument();
    expect(screen.queryByText('Sin historial')).not.toBeInTheDocument();
  });

  it('shows the ApiError message and retries on demand', async () => {
    const user = userEvent.setup();
    const refetch = jest.fn();
    mockUsePatientDetail.mockReturnValue(
      detailResult({ error: new ApiError(404, 'Paciente no existe.'), refetch }),
    );
    renderPage();

    expect(screen.getByText('Error al cargar paciente')).toBeInTheDocument();
    expect(screen.getByText('Paciente no existe.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('shows plain Error messages too', () => {
    mockUsePatientDetail.mockReturnValue(
      detailResult({ error: new Error('Fallo de red') }),
    );
    renderPage();

    expect(screen.getByText('Fallo de red')).toBeInTheDocument();
  });

  it('falls back to a generic message for non-Error failures', () => {
    mockUsePatientDetail.mockReturnValue(
      detailResult({ error: 'algo raro' as unknown as Error }),
    );
    renderPage();

    expect(
      screen.getByText('No pudimos cargar el historial del paciente.'),
    ).toBeInTheDocument();
  });

  it('shows the empty state when the patient has no consultas', () => {
    mockUsePatientDetail.mockReturnValue(dataResult([]));
    renderPage();

    expect(screen.getByText('Sin historial')).toBeInTheDocument();
    expect(
      screen.getByText('Este paciente aún no tiene consultas registradas.'),
    ).toBeInTheDocument();
  });

  it('renders the patient name, side panels and the consultations grouped by year', () => {
    mockUsePatientDetail.mockReturnValue(
      dataResult([
        makeConsulta('c1', '2024-03-10T10:00:00'),
        makeConsulta('c2', '2023-07-01T09:00:00'),
        makeConsulta('c3', '2023-01-15T12:30:00'),
      ]),
    );
    renderPage();

    expect(screen.getByTestId('patient-detail-card')).toHaveTextContent('Juan Pérez');
    expect(screen.getByTestId('contextos-panel')).toBeInTheDocument();
    expect(screen.getByTestId('matching-panel')).toBeInTheDocument();

    // Year group headers with per-year counts.
    expect(screen.getByText('1 consulta')).toBeInTheDocument();
    expect(screen.getByText('2 consultas')).toBeInTheDocument();

    // Cards for each consulta plus the analyze trigger per row.
    expect(screen.getByText('Motivo c1')).toBeInTheDocument();
    expect(screen.getByText('Motivo c2')).toBeInTheDocument();
    expect(screen.getByText('Motivo c3')).toBeInTheDocument();
    expect(screen.getByTestId('analyze-c1')).toBeInTheDocument();
    expect(screen.getByTestId('analyze-c3')).toBeInTheDocument();

    // Tab badge with the total count.
    const tab = screen.getByRole('tab', { name: /Historial/ });
    expect(tab).toHaveTextContent('3');
  });

  it('orders consultations from newest to oldest', () => {
    mockUsePatientDetail.mockReturnValue(
      dataResult([
        makeConsulta('c-old', '2022-02-01T10:00:00'),
        makeConsulta('c-new', '2024-08-01T10:00:00'),
      ]),
    );
    renderPage();

    const headings = screen.getAllByRole('heading', { level: 3 });
    const reasons = headings.map((h) => h.textContent);
    expect(reasons.indexOf('Motivo c-new')).toBeLessThan(reasons.indexOf('Motivo c-old'));
  });

  it('opens the SOAP modal for the chosen consulta and closes it again', async () => {
    const user = userEvent.setup();
    mockUsePatientDetail.mockReturnValue(
      dataResult([
        makeConsulta('c1', '2024-03-10T10:00:00'),
        makeConsulta('c2', '2023-07-01T09:00:00'),
      ]),
    );
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Ver SOAP de Motivo c2' }));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Resumen SOAP')).toBeInTheDocument();
    expect(within(dialog).getByText('Subjetivo c2')).toBeInTheDocument();
    expect(within(dialog).getByText('Plan c2')).toBeInTheDocument();
    expect(within(dialog).getByText(/Dr\. doc-1/)).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Cerrar resumen' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('navigates to the new consulta form', async () => {
    const user = userEvent.setup();
    mockUsePatientDetail.mockReturnValue(dataResult([]));
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Nueva consulta' }));

    expect(screen.getByText('Página de nueva consulta')).toBeInTheDocument();
  });

  it('toggles and clears the tag filter shared between the side panels', async () => {
    const user = userEvent.setup();
    mockUsePatientDetail.mockReturnValue(dataResult([]));
    renderPage();

    const selectedCount = screen.getByTestId('selected-count');
    expect(selectedCount).toHaveTextContent('0');

    // Clearing while empty keeps the same (empty) selection.
    await user.click(screen.getByRole('button', { name: 'Limpiar filtro' }));
    expect(selectedCount).toHaveTextContent('0');

    await user.click(screen.getByRole('button', { name: 'Alternar filtro' }));
    expect(screen.getByTestId('selected-count')).toHaveTextContent('1');

    // Toggling the same key removes it again.
    await user.click(screen.getByRole('button', { name: 'Alternar filtro' }));
    expect(screen.getByTestId('selected-count')).toHaveTextContent('0');

    await user.click(screen.getByRole('button', { name: 'Alternar filtro' }));
    await user.click(screen.getByRole('button', { name: 'Limpiar filtro' }));
    expect(screen.getByTestId('selected-count')).toHaveTextContent('0');
  });

  it('keeps the historial tab active when re-clicking it', async () => {
    const user = userEvent.setup();
    mockUsePatientDetail.mockReturnValue(dataResult([makeConsulta('c1', '2024-03-10T10:00:00')]));
    renderPage();

    const tab = screen.getByRole('tab', { name: /Historial/ });
    await user.click(tab);

    expect(tab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Motivo c1')).toBeInTheDocument();
  });

  it('navigates back to the patients list from the breadcrumb', async () => {
    const user = userEvent.setup();
    mockUsePatientDetail.mockReturnValue(dataResult([]));
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Pacientes' }));

    expect(screen.getByText('Página de pacientes')).toBeInTheDocument();
  });
});
