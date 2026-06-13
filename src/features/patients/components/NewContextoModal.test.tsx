import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
import { createPacienteContexto } from '@features/patients/api';
import type { PacienteContexto } from '@features/patients/schemas';
import { NewContextoModal } from './NewContextoModal';

const mockCreateContexto = jest.mocked(createPacienteContexto);

const CREATED_CONTEXTO: PacienteContexto = {
  id: 'c1',
  pacienteId: 'p1',
  tipo: 'sintoma',
  valor: 'Dolor de cabeza',
  createdAt: '2024-01-01T00:00:00Z',
};

function renderModal(props: Partial<React.ComponentProps<typeof NewContextoModal>> = {}) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const onClose = jest.fn();
  const onCreated = jest.fn();
  const utils = render(
    <QueryClientProvider client={qc}>
      <NewContextoModal
        isOpen
        onClose={onClose}
        patientId="p1"
        onCreated={onCreated}
        {...props}
      />
    </QueryClientProvider>,
  );
  return { ...utils, onClose, onCreated };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('NewContextoModal', () => {
  it('renders nothing when closed', () => {
    renderModal({ isOpen: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the dialog in a portal with tipo and descripción fields', () => {
    renderModal();

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Nuevo contexto clínico' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descripción/)).toBeInTheDocument();
  });

  it('offers the four contexto tipos as options', () => {
    renderModal();

    const select = screen.getByLabelText(/Tipo/);
    const options = Array.from(select.querySelectorAll('option')).map((o) => o.textContent);
    expect(options).toEqual(['Enfermedad', 'Síntoma', 'Tratamiento', 'Medicamento']);
  });

  it('updates the placeholder when the tipo changes', async () => {
    const user = userEvent.setup();
    renderModal();

    expect(screen.getByPlaceholderText('Ej. Hipertensión arterial')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/Tipo/), 'medicamento');

    expect(screen.getByPlaceholderText('Ej. Losartán 50 mg')).toBeInTheDocument();
  });

  it('shows "Requerido" when submitting an empty descripción', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: 'Agregar contexto' }));

    expect(await screen.findByText('Requerido')).toBeInTheDocument();
    expect(mockCreateContexto).not.toHaveBeenCalled();
  });

  it('submits a valid contexto and calls onCreated and onClose', async () => {
    mockCreateContexto.mockResolvedValue(CREATED_CONTEXTO);
    const user = userEvent.setup();
    const { onCreated, onClose } = renderModal();

    await user.selectOptions(screen.getByLabelText(/Tipo/), 'sintoma');
    await user.type(screen.getByLabelText(/Descripción/), 'Dolor de cabeza');
    await user.click(screen.getByRole('button', { name: 'Agregar contexto' }));

    await waitFor(() =>
      expect(mockCreateContexto).toHaveBeenCalledWith('p1', {
        tipo: 'sintoma',
        valor: 'Dolor de cabeza',
      }),
    );
    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(CREATED_CONTEXTO));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows the pending label while the mutation is in flight', async () => {
    mockCreateContexto.mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    renderModal();

    await user.type(screen.getByLabelText(/Descripción/), 'Algo');
    await user.click(screen.getByRole('button', { name: 'Agregar contexto' }));

    expect(await screen.findByRole('button', { name: 'Guardando…' })).toBeDisabled();
  });

  it('maps backend 400 field errors onto the valor field', async () => {
    mockCreateContexto.mockRejectedValue(
      new ApiError(400, 'Validación', [{ field: 'valor', message: 'Valor inválido' }]),
    );
    const user = userEvent.setup();
    renderModal();

    await user.type(screen.getByLabelText(/Descripción/), 'Algo');
    await user.click(screen.getByRole('button', { name: 'Agregar contexto' }));

    expect(await screen.findByText('Valor inválido')).toBeInTheDocument();
  });

  it('shows a specific message when the patient no longer exists (404)', async () => {
    mockCreateContexto.mockRejectedValue(new ApiError(404, 'No encontrado'));
    const user = userEvent.setup();
    renderModal();

    await user.type(screen.getByLabelText(/Descripción/), 'Algo');
    await user.click(screen.getByRole('button', { name: 'Agregar contexto' }));

    expect(await screen.findByText('El paciente ya no existe.')).toBeInTheDocument();
  });

  it('shows a session message on 401', async () => {
    mockCreateContexto.mockRejectedValue(new ApiError(401, 'Unauthorized'));
    const user = userEvent.setup();
    renderModal();

    await user.type(screen.getByLabelText(/Descripción/), 'Algo');
    await user.click(screen.getByRole('button', { name: 'Agregar contexto' }));

    expect(
      await screen.findByText('Tu sesión expiró. Vuelve a iniciar sesión.'),
    ).toBeInTheDocument();
  });

  it('shows the ApiError message for other statuses', async () => {
    mockCreateContexto.mockRejectedValue(new ApiError(500, 'Error interno'));
    const user = userEvent.setup();
    renderModal();

    await user.type(screen.getByLabelText(/Descripción/), 'Algo');
    await user.click(screen.getByRole('button', { name: 'Agregar contexto' }));

    expect(await screen.findByText('Error interno')).toBeInTheDocument();
  });

  it('shows a global error for non-Api errors', async () => {
    mockCreateContexto.mockRejectedValue(new Error('Sin conexión'));
    const user = userEvent.setup();
    renderModal();

    await user.type(screen.getByLabelText(/Descripción/), 'Algo');
    await user.click(screen.getByRole('button', { name: 'Agregar contexto' }));

    expect(await screen.findByText('Sin conexión')).toBeInTheDocument();
  });

  it('closes on Escape when not pending', async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes via the Cancelar button', async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
