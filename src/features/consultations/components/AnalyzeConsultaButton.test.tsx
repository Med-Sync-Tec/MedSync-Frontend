import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiError } from '@lib/http/errors';

jest.mock('../api', () => ({
  createConsulta: jest.fn(),
  analyzeConsulta: jest.fn(),
  sendDictation: jest.fn(),
}));

jest.mock('@features/patients/api', () => ({
  bulkAddPacienteContextos: jest.fn(),
  createPacienteContexto: jest.fn(),
  createPatient: jest.fn(),
  deletePacienteContexto: jest.fn(),
  getConsultasByPatient: jest.fn(),
  getExpediente: jest.fn(),
  getPatient: jest.fn(),
  listPacienteContextos: jest.fn(),
  listPatients: jest.fn(),
}));

jest.mock('@features/auth/api', () => ({
  signOutCurrentUser: jest.fn(),
}));

import { analyzeConsulta } from '../api';
import { bulkAddPacienteContextos } from '@features/patients/api';
import { useAuthStore } from '@features/auth/store';
import { AnalyzeConsultaButton } from './AnalyzeConsultaButton';
import type { ConsultaAnalysisResponse } from '../schemas';

const mockAnalyze = jest.mocked(analyzeConsulta);
const mockBulkAdd = jest.mocked(bulkAddPacienteContextos);

const DOCTOR_WITH_SPECIALTY = {
  id: 'u1',
  email: 'doctor@medsync.mx',
  name: 'Dra. Rivera',
  role: 'DOCTOR' as const,
  especialidadId: 'esp-1',
};

const ANALYSIS: ConsultaAnalysisResponse = {
  consultaId: 'c1',
  especialidadId: 'esp-1',
  especialidadSlug: 'cardiologia',
  vocabularyStatus: 'POPULATED',
  suggestions: [
    { tipo: 'enfermedad', valor: 'Hipertensión' },
    { tipo: 'sintoma', valor: 'Disnea' },
  ],
  modelUsed: 'llama-3.3-70b',
  promptTokens: 80,
  completionTokens: 30,
};

function renderButton(props: { compact?: boolean } = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AnalyzeConsultaButton consultaId="c1" patientId="p1" {...props} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({ user: DOCTOR_WITH_SPECIALTY, isAuthenticated: true });
});

describe('AnalyzeConsultaButton', () => {
  it('renders the labelled trigger with the analyze tooltip', () => {
    renderButton();

    const button = screen.getByRole('button', { name: 'Sugerir con IA' });
    expect(button).toBeEnabled();
    expect(button).toHaveAttribute(
      'title',
      'Analizar la consulta con IA y sugerir contexto clínico',
    );
  });

  it('renders icon-only in compact mode', () => {
    renderButton({ compact: true });

    const button = screen.getByRole('button');
    expect(button).not.toHaveTextContent('Sugerir con IA');
  });

  it('is disabled with a guidance tooltip when the user has no specialty', () => {
    useAuthStore.setState({
      user: { ...DOCTOR_WITH_SPECIALTY, especialidadId: null },
      isAuthenticated: true,
    });
    renderButton();

    const button = screen.getByRole('button', { name: 'Sugerir con IA' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute(
      'title',
      'Tu usuario no tiene una especialidad asignada — pide al COO que la configure.',
    );
  });

  it('is disabled when there is no authenticated user', () => {
    useAuthStore.setState({ user: null, isAuthenticated: false });
    renderButton();

    expect(screen.getByRole('button', { name: 'Sugerir con IA' })).toBeDisabled();
  });

  it('opens the modal in loading phase while the analysis is in flight', async () => {
    const user = userEvent.setup();
    mockAnalyze.mockImplementation(() => new Promise(() => {}));
    renderButton();

    await user.click(screen.getByRole('button', { name: 'Sugerir con IA' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Generando sugerencias…')).toBeInTheDocument();
    expect(mockAnalyze.mock.calls[0][0]).toBe('c1');
  });

  it('shows the suggestions when the analysis succeeds', async () => {
    const user = userEvent.setup();
    mockAnalyze.mockResolvedValue(ANALYSIS);
    renderButton();

    await user.click(screen.getByRole('button', { name: 'Sugerir con IA' }));

    expect(await screen.findByDisplayValue('Hipertensión')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Disnea')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar 2 sugerencias' })).toBeInTheDocument();
  });

  it('shows the empty-vocabulary guidance when the vocabulary is EMPTY', async () => {
    const user = userEvent.setup();
    mockAnalyze.mockResolvedValue({ ...ANALYSIS, vocabularyStatus: 'EMPTY', suggestions: [] });
    renderButton();

    await user.click(screen.getByRole('button', { name: 'Sugerir con IA' }));

    expect(
      await screen.findByText(/Tu especialidad no tiene un vocabulario clínico cargado/),
    ).toBeInTheDocument();
  });

  it.each([
    [new ApiError(400, 'La consulta está vacía.'), 'La consulta está vacía.'],
    [new ApiError(400, ''), 'La consulta no tiene texto suficiente para analizar.'],
    [new ApiError(401, 'no auth'), 'Tu sesión expiró. Inicia sesión de nuevo.'],
    [new ApiError(404, 'missing'), 'Consulta no encontrada en el sistema del hospital.'],
    [
      new ApiError(502, 'bad gateway'),
      'El servicio de IA devolvió una respuesta inválida. Intenta de nuevo en unos segundos.',
    ],
    [new ApiError(504, 'timeout'), 'El servicio de IA tardó demasiado. Intenta de nuevo.'],
    [new ApiError(500, 'Error interno del hospital.'), 'Error interno del hospital.'],
    [new ApiError(500, ''), 'Error inesperado.'],
    [new Error('network'), 'Error inesperado al conectar con el servidor.'],
  ])('maps analyze error case %# to its user-facing message', async (error, expectedMessage) => {
    const user = userEvent.setup();
    mockAnalyze.mockRejectedValue(error);
    renderButton();

    await user.click(screen.getByRole('button', { name: 'Sugerir con IA' }));

    expect(await screen.findByText(expectedMessage)).toBeInTheDocument();
  });

  it('saves the selected suggestions via bulk-add and closes the modal on success', async () => {
    const user = userEvent.setup();
    mockAnalyze.mockResolvedValue(ANALYSIS);
    mockBulkAdd.mockResolvedValue([]);
    renderButton();

    await user.click(screen.getByRole('button', { name: 'Sugerir con IA' }));
    await screen.findByDisplayValue('Hipertensión');
    await user.click(screen.getByRole('button', { name: 'Guardar 2 sugerencias' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(mockBulkAdd).toHaveBeenCalledWith('p1', {
      entries: [
        { tipo: 'enfermedad', valor: 'Hipertensión' },
        { tipo: 'sintoma', valor: 'Disnea' },
      ],
    });
  });

  it('shows a saving spinner while the bulk-add is pending', async () => {
    const user = userEvent.setup();
    mockAnalyze.mockResolvedValue(ANALYSIS);
    mockBulkAdd.mockImplementation(() => new Promise(() => {}));
    renderButton();

    await user.click(screen.getByRole('button', { name: 'Sugerir con IA' }));
    await screen.findByDisplayValue('Hipertensión');
    await user.click(screen.getByRole('button', { name: 'Guardar 2 sugerencias' }));

    expect(await screen.findByText('Guardando…')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  });

  it.each([
    [new ApiError(400, 'bad'), 'Una o más entradas tienen datos inválidos. Ninguna se guardó.'],
    [new ApiError(404, 'missing'), 'Paciente no encontrado.'],
    [new ApiError(401, 'no auth'), 'Tu sesión expiró. Inicia sesión de nuevo.'],
    [new ApiError(500, 'Falla del servidor.'), 'Falla del servidor.'],
    [new ApiError(500, ''), 'No se pudieron guardar las sugerencias.'],
    [new Error('network'), 'Error inesperado al guardar las sugerencias.'],
  ])('maps bulk-save error case %# to its user-facing message', async (error, expectedMessage) => {
    const user = userEvent.setup();
    mockAnalyze.mockResolvedValue(ANALYSIS);
    mockBulkAdd.mockRejectedValue(error);
    renderButton();

    await user.click(screen.getByRole('button', { name: 'Sugerir con IA' }));
    await screen.findByDisplayValue('Hipertensión');
    await user.click(screen.getByRole('button', { name: 'Guardar 2 sugerencias' }));

    expect(await screen.findByText(expectedMessage)).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes the modal with the header close button when idle', async () => {
    const user = userEvent.setup();
    mockAnalyze.mockResolvedValue(ANALYSIS);
    renderButton();

    await user.click(screen.getByRole('button', { name: 'Sugerir con IA' }));
    await screen.findByDisplayValue('Hipertensión');
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
