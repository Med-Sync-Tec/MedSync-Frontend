import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom';

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

import { ApiError } from '@lib/http/errors';
import { createPatient, listPatients } from '@features/patients/api';
import type { Patient } from '@features/patients/schemas';
import { PatientsListPage } from './PatientsListPage';

const mockListPatients = jest.mocked(listPatients);
const mockCreatePatient = jest.mocked(createPatient);

const PATIENT_A: Patient = {
  id: 'p1',
  expedienteExternoId: 'HG-2024-001',
  nombre: 'María López',
  fechaNacimiento: '1990-05-10',
  genero: 'Femenino',
  medicoId: 'd1',
  activo: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
};

const PATIENT_B: Patient = {
  ...PATIENT_A,
  id: 'p2',
  expedienteExternoId: 'HG-2024-002',
  nombre: 'Carlos Ruiz',
  activo: false,
};

const HistoryStub: React.FC = () => {
  const { id } = useParams();
  return <div>history-page-{id}</div>;
};

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/patients']}>
        <Routes>
          <Route path="/patients" element={<PatientsListPage />} />
          <Route path="/patients/:id/history" element={<HistoryStub />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('PatientsListPage', () => {
  it('shows the loading state with a skeleton', () => {
    mockListPatients.mockReturnValue(new Promise(() => {}));

    renderPage();

    expect(screen.getByText('Cargando pacientes…')).toBeInTheDocument();
    expect(screen.getByText('Cargando…')).toBeInTheDocument();
    expect(
      screen.getByRole('status', { name: 'Cargando lista de pacientes' }),
    ).toBeInTheDocument();
  });

  it('renders the patient list with a plural count', async () => {
    mockListPatients.mockResolvedValue([PATIENT_A, PATIENT_B]);

    renderPage();

    expect(await screen.findByText('María López')).toBeInTheDocument();
    expect(screen.getByText('Carlos Ruiz')).toBeInTheDocument();
    expect(screen.getByText('2 pacientes registrados en tu cartera')).toBeInTheDocument();
    expect(screen.getByText('2 resultados')).toBeInTheDocument();
  });

  it('uses singular wording for a single patient', async () => {
    mockListPatients.mockResolvedValue([PATIENT_A]);

    renderPage();

    expect(
      await screen.findByText('1 paciente registrado en tu cartera'),
    ).toBeInTheDocument();
    expect(screen.getByText('1 resultado')).toBeInTheDocument();
  });

  it('shows the empty state when there are no patients', async () => {
    mockListPatients.mockResolvedValue([]);

    renderPage();

    expect(await screen.findByText('Aún no tienes pacientes')).toBeInTheDocument();
    expect(
      screen.getByText('Los pacientes que registres aparecerán aquí para consultar su historial.'),
    ).toBeInTheDocument();
  });

  it('shows the error state with the ApiError message and retries', async () => {
    mockListPatients.mockRejectedValueOnce(new ApiError(500, 'Falla del servidor'));
    mockListPatients.mockResolvedValueOnce([PATIENT_A]);
    const user = userEvent.setup();

    renderPage();

    expect(await screen.findByText('Error al cargar pacientes')).toBeInTheDocument();
    expect(screen.getByText('Falla del servidor')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByText('María López')).toBeInTheDocument();
    expect(mockListPatients).toHaveBeenCalledTimes(2);
  });

  it('navigates to the patient history when a patient card is clicked', async () => {
    mockListPatients.mockResolvedValue([PATIENT_A]);
    const user = userEvent.setup();

    renderPage();

    await user.click(await screen.findByText('María López'));

    expect(await screen.findByText('history-page-p1')).toBeInTheDocument();
  });

  it('opens the new patient modal from the header button', async () => {
    mockListPatients.mockResolvedValue([]);
    const user = userEvent.setup();

    renderPage();
    await screen.findByText('Aún no tienes pacientes');

    await user.click(screen.getByRole('button', { name: /Nuevo paciente/ }));

    expect(
      await screen.findByRole('heading', { name: 'Nuevo paciente' }),
    ).toBeInTheDocument();
  });

  it('navigates to the created patient history after the modal submits', async () => {
    mockListPatients.mockResolvedValue([]);
    mockCreatePatient.mockResolvedValue({ ...PATIENT_A, id: 'np9' });
    const user = userEvent.setup();

    renderPage();
    await screen.findByText('Aún no tienes pacientes');

    await user.click(screen.getByRole('button', { name: /Nuevo paciente/ }));
    const nombreInput = await screen.findByLabelText(/Nombre completo/);
    // Wait for the modal's deferred auto-focus to avoid focus steal mid-typing.
    await waitFor(() => expect(nombreInput).toHaveFocus());

    await user.type(nombreInput, 'María López');
    await user.type(screen.getByLabelText(/Expediente externo/), 'HG-2024-001');
    const fecha = screen.getByLabelText(/Fecha de nacimiento/) as HTMLInputElement;
    // jsdom date inputs accept programmatic value via fireEvent-like typing:
    await user.type(fecha, '1990-05-10');
    await user.selectOptions(screen.getByLabelText(/Género/), 'Femenino');

    await user.click(screen.getByRole('button', { name: 'Crear paciente' }));

    expect(await screen.findByText('history-page-np9')).toBeInTheDocument();
  });
});
