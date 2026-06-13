import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiError } from '@lib/http/errors';
import type { SOAPDictationResult } from '@features/consultations/schemas';

jest.mock('@features/consultations/api', () => ({
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

jest.mock('@features/consultations/components/DictationButton', () => ({
  DictationButton: ({ onResult }: { onResult: (fields: SOAPDictationResult) => void }) => (
    <button
      type="button"
      onClick={() =>
        onResult({
          motivoConsulta: 'Dictado motivo',
          subjetivo: 'Dictado subjetivo',
          objetivo: null,
          evaluacion: undefined,
          diagnostico: '',
          plan: 'Dictado plan',
          prescripcion: null,
        })
      }
    >
      Dictar (mock)
    </button>
  ),
}));

import { createConsulta } from '@features/consultations/api';
import { getPatient } from '@features/patients/api';
import { NewSOAPEntryPage } from './NewSOAPEntryPage';

const mockCreateConsulta = jest.mocked(createConsulta);
const mockGetPatient = jest.mocked(getPatient);

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

const CREATED_CONSULTA = {
  id: 'c-new',
  fecha: '2024-05-10T10:00:00',
  motivoConsulta: '',
  subjetivo: '',
  objetivo: '',
  evaluacion: '',
  plan: '',
  prescripcion: '',
  diagnostico: '',
  createdAt: '2024-05-10T10:05:00',
};

function renderPage(initialEntry = '/patients/p1/consultas/new') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/patients/:patientId/consultas/new" element={<NewSOAPEntryPage />} />
          <Route path="/consultas-sin-id" element={<NewSOAPEntryPage />} />
          <Route path="/patients/:patientId/history" element={<div>Página de historial</div>} />
          <Route path="/doctor/patients" element={<div>Página de pacientes</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetPatient.mockResolvedValue(PATIENT);
});

describe('NewSOAPEntryPage', () => {
  it('shows a guidance error and navigates to patients when patientId is missing', async () => {
    const user = userEvent.setup();
    renderPage('/consultas-sin-id');

    expect(screen.getByText('Paciente no especificado')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Ir a pacientes' }));

    expect(screen.getByText('Página de pacientes')).toBeInTheDocument();
  });

  it('renders the form header with the patient name and expediente id', async () => {
    renderPage();

    expect(screen.getByText('Nueva Entrada Clínica (SOAP)')).toBeInTheDocument();
    expect(await screen.findByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText(/EXP-001/)).toBeInTheDocument();
  });

  it('falls back to a generic patient label when the patient query fails', async () => {
    mockGetPatient.mockRejectedValue(new ApiError(404, 'No existe'));
    renderPage();

    expect(await screen.findByText('Paciente')).toBeInTheDocument();
  });

  it('submits only the fecha (with seconds appended) when the SOAP fields are empty', async () => {
    const user = userEvent.setup();
    mockCreateConsulta.mockResolvedValue(CREATED_CONSULTA);
    renderPage();

    await user.click(screen.getByRole('button', { name: /Guardar Entrada/ }));

    await waitFor(() => expect(mockCreateConsulta).toHaveBeenCalledTimes(1));
    const [patientId, payload] = mockCreateConsulta.mock.calls[0];
    expect(patientId).toBe('p1');
    expect(payload.fecha).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00$/);
    expect(payload.motivoConsulta).toBeUndefined();
    expect(payload.subjetivo).toBeUndefined();
    expect(payload.diagnostico).toBeUndefined();
  });

  it('submits the filled SOAP fields trimmed and navigates to the history on success', async () => {
    const user = userEvent.setup();
    mockCreateConsulta.mockResolvedValue(CREATED_CONSULTA);
    renderPage();

    fireEvent.change(screen.getByLabelText('Motivo de consulta'), {
      target: { value: '  Dolor abdominal  ' },
    });
    fireEvent.change(
      screen.getByLabelText('Síntomas, antecedentes y preocupaciones del paciente'),
      { target: { value: 'Dolor de 3 días' } },
    );
    fireEvent.change(
      screen.getByPlaceholderText('Detalle los hallazgos observados durante la exploración...'),
      { target: { value: 'Abdomen blando' } },
    );
    fireEvent.change(screen.getByLabelText('Evaluación clínica'), {
      target: { value: 'Cuadro compatible con gastritis' },
    });
    fireEvent.change(screen.getByLabelText('Diagnóstico'), {
      target: { value: 'Gastritis aguda' },
    });
    fireEvent.change(screen.getByLabelText('Plan terapéutico'), {
      target: { value: 'Dieta blanda' },
    });
    fireEvent.change(screen.getByLabelText('Prescripción'), {
      target: { value: 'Omeprazol 20mg' },
    });
    fireEvent.change(screen.getByLabelText('Fecha y hora de la consulta'), {
      target: { value: '2024-05-10T10:00' },
    });
    await user.click(screen.getByRole('button', { name: /Guardar Entrada/ }));

    await waitFor(() => expect(mockCreateConsulta).toHaveBeenCalledTimes(1));
    const [, payload] = mockCreateConsulta.mock.calls[0];
    expect(payload.fecha).toBe('2024-05-10T10:00:00');
    expect(payload.motivoConsulta).toBe('Dolor abdominal');
    expect(payload.subjetivo).toBe('Dolor de 3 días');
    expect(payload.objetivo).toBe('Abdomen blando');
    expect(payload.evaluacion).toBe('Cuadro compatible con gastritis');
    expect(payload.diagnostico).toBe('Gastritis aguda');
    expect(payload.plan).toBe('Dieta blanda');
    expect(payload.prescripcion).toBe('Omeprazol 20mg');

    expect(await screen.findByText('Página de historial')).toBeInTheDocument();
  });

  it('shows a field error and skips the request when client validation fails', async () => {
    const user = userEvent.setup();
    renderPage();

    fireEvent.change(screen.getByLabelText('Motivo de consulta'), {
      target: { value: 'x'.repeat(2001) },
    });
    await user.click(screen.getByRole('button', { name: /Guardar Entrada/ }));

    expect(await screen.findByText('Máximo 2000 caracteres')).toBeInTheDocument();
    expect(mockCreateConsulta).not.toHaveBeenCalled();
  });

  it('clears the field error as soon as the field is edited again', async () => {
    const user = userEvent.setup();
    renderPage();

    const motivo = screen.getByLabelText('Motivo de consulta');
    fireEvent.change(motivo, { target: { value: 'x'.repeat(2001) } });
    await user.click(screen.getByRole('button', { name: /Guardar Entrada/ }));
    expect(await screen.findByText('Máximo 2000 caracteres')).toBeInTheDocument();

    fireEvent.change(motivo, { target: { value: 'Dolor' } });

    expect(screen.queryByText('Máximo 2000 caracteres')).not.toBeInTheDocument();
  });

  it('maps backend validation errors onto the fields', async () => {
    const user = userEvent.setup();
    mockCreateConsulta.mockRejectedValue(
      new ApiError(400, 'Validación fallida', [
        { field: 'motivoConsulta', message: 'Motivo inválido' },
        { field: 'fecha', message: 'Fecha fuera de rango' },
      ]),
    );
    renderPage();

    await user.click(screen.getByRole('button', { name: /Guardar Entrada/ }));

    expect(await screen.findByText('Revisa los campos marcados.')).toBeInTheDocument();
    expect(screen.getByText('Motivo inválido')).toBeInTheDocument();
    expect(screen.getByText('Fecha fuera de rango')).toBeInTheDocument();
  });

  it('shows the backend message for non-validation ApiErrors', async () => {
    const user = userEvent.setup();
    mockCreateConsulta.mockRejectedValue(new ApiError(500, 'Error interno del servidor'));
    renderPage();

    await user.click(screen.getByRole('button', { name: /Guardar Entrada/ }));

    expect(await screen.findByText('Error interno del servidor')).toBeInTheDocument();
  });

  it('shows a generic message for unexpected errors', async () => {
    const user = userEvent.setup();
    mockCreateConsulta.mockRejectedValue(new Error('boom'));
    renderPage();

    await user.click(screen.getByRole('button', { name: /Guardar Entrada/ }));

    expect(
      await screen.findByText('No pudimos guardar la consulta. Intenta de nuevo.'),
    ).toBeInTheDocument();
  });

  it('shows the saving state while the mutation is pending', async () => {
    const user = userEvent.setup();
    mockCreateConsulta.mockImplementation(() => new Promise(() => {}));
    renderPage();

    await user.click(screen.getByRole('button', { name: /Guardar Entrada/ }));

    expect(await screen.findByText('Guardando…')).toBeInTheDocument();
  });

  it('fills only the non-empty dictated fields into the form', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Dictar (mock)' }));

    expect(screen.getByLabelText('Motivo de consulta')).toHaveValue('Dictado motivo');
    expect(
      screen.getByLabelText('Síntomas, antecedentes y preocupaciones del paciente'),
    ).toHaveValue('Dictado subjetivo');
    expect(screen.getByLabelText('Plan terapéutico')).toHaveValue('Dictado plan');
    // null / undefined / empty dictation fields must not overwrite the form.
    expect(
      screen.getByPlaceholderText('Detalle los hallazgos observados durante la exploración...'),
    ).toHaveValue('');
    expect(screen.getByLabelText('Diagnóstico')).toHaveValue('');
  });

  it('navigates back to the history when discarding the entry', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /Cancelar y descartar/ }));

    expect(screen.getByText('Página de historial')).toBeInTheDocument();
    expect(mockCreateConsulta).not.toHaveBeenCalled();
  });
});
