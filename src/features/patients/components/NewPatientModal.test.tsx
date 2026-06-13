import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
import { createPatient } from '@features/patients/api';
import type { Patient } from '@features/patients/schemas';
import { NewPatientModal } from './NewPatientModal';

const mockCreatePatient = jest.mocked(createPatient);

const CREATED_PATIENT: Patient = {
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

function renderModal(props: Partial<React.ComponentProps<typeof NewPatientModal>> = {}) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const onClose = jest.fn();
  const onCreated = jest.fn();
  const utils = render(
    <QueryClientProvider client={qc}>
      <NewPatientModal isOpen onClose={onClose} onCreated={onCreated} {...props} />
    </QueryClientProvider>,
  );
  return { ...utils, onClose, onCreated };
}

/**
 * The modal auto-focuses the first field via a 50ms setTimeout; typing
 * before that fires gets its focus stolen mid-keystroke. Wait it out.
 */
async function waitForAutoFocus() {
  await waitFor(() => expect(screen.getByLabelText(/Nombre completo/)).toHaveFocus());
}

async function fillValidForm() {
  const user = userEvent.setup();
  await waitForAutoFocus();
  await user.type(screen.getByLabelText(/Nombre completo/), 'María López');
  await user.type(screen.getByLabelText(/Expediente externo/), 'HG-2024-001');
  fireEvent.change(screen.getByLabelText(/Fecha de nacimiento/), {
    target: { value: '1990-05-10' },
  });
  await user.selectOptions(screen.getByLabelText(/Género/), 'Femenino');
  return user;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('NewPatientModal', () => {
  it('renders nothing when closed', () => {
    renderModal({ isOpen: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the dialog with title and fields when open', () => {
    renderModal();

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Nuevo paciente' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre completo/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Expediente externo/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Fecha de nacimiento/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Género/)).toBeInTheDocument();
  });

  it('shows validation errors for every field on empty submit', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: 'Crear paciente' }));

    const alerts = screen.getAllByRole('alert');
    const messages = alerts.map((a) => a.textContent);
    expect(messages).toEqual(
      expect.arrayContaining([
        'Requerido',
        'Usa formato AAAA-MM-DD',
        'Debes seleccionar un género',
      ]),
    );
    expect(mockCreatePatient).not.toHaveBeenCalled();
  });

  it('requires a gender even when the rest of the form is valid', async () => {
    const user = userEvent.setup();
    renderModal();
    await waitForAutoFocus();
    await user.type(screen.getByLabelText(/Nombre completo/), 'María López');
    await user.type(screen.getByLabelText(/Expediente externo/), 'HG-2024-001');
    fireEvent.change(screen.getByLabelText(/Fecha de nacimiento/), {
      target: { value: '1990-05-10' },
    });

    await user.click(screen.getByRole('button', { name: 'Crear paciente' }));

    expect(screen.getByText('Debes seleccionar un género')).toBeInTheDocument();
    expect(mockCreatePatient).not.toHaveBeenCalled();
  });

  it('clears a field error when the user edits that field', async () => {
    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByRole('button', { name: 'Crear paciente' }));
    expect(screen.getAllByText('Requerido').length).toBeGreaterThan(0);

    await user.type(screen.getByLabelText(/Nombre completo/), 'M');

    // Only the expediente "Requerido" should remain.
    expect(screen.getAllByText('Requerido')).toHaveLength(1);
  });

  it('submits a valid form and calls onCreated with the created patient', async () => {
    mockCreatePatient.mockResolvedValue(CREATED_PATIENT);
    const { onCreated } = renderModal();
    const user = await fillValidForm();

    await user.click(screen.getByRole('button', { name: 'Crear paciente' }));

    // TanStack Query passes a context object as second argument to mutationFn.
    await waitFor(() =>
      expect(mockCreatePatient).toHaveBeenCalledWith(
        {
          expedienteExternoId: 'HG-2024-001',
          nombre: 'María López',
          fechaNacimiento: '1990-05-10',
          genero: 'Femenino',
        },
        expect.anything(),
      ),
    );
    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(CREATED_PATIENT));
  });

  it('shows the pending label while the mutation is in flight', async () => {
    mockCreatePatient.mockReturnValue(new Promise(() => {}));
    renderModal();
    const user = await fillValidForm();

    await user.click(screen.getByRole('button', { name: 'Crear paciente' }));

    expect(await screen.findByRole('button', { name: 'Creando…' })).toBeDisabled();
  });

  it('maps a 409 conflict to an expediente field error', async () => {
    mockCreatePatient.mockRejectedValue(new ApiError(409, 'Conflicto'));
    renderModal();
    const user = await fillValidForm();

    await user.click(screen.getByRole('button', { name: 'Crear paciente' }));

    expect(
      await screen.findByText('Ya existe un paciente con este expediente'),
    ).toBeInTheDocument();
  });

  it('maps backend 400 field errors onto the matching fields', async () => {
    mockCreatePatient.mockRejectedValue(
      new ApiError(400, 'Validación', [
        { field: 'nombre', message: 'Nombre inválido' },
        { field: 'campoDesconocido', message: 'ignorado' },
      ]),
    );
    renderModal();
    const user = await fillValidForm();

    await user.click(screen.getByRole('button', { name: 'Crear paciente' }));

    expect(await screen.findByText('Nombre inválido')).toBeInTheDocument();
    expect(screen.queryByText('ignorado')).not.toBeInTheDocument();
  });

  it('shows a global error for other ApiErrors', async () => {
    mockCreatePatient.mockRejectedValue(new ApiError(500, 'Error del servidor'));
    renderModal();
    const user = await fillValidForm();

    await user.click(screen.getByRole('button', { name: 'Crear paciente' }));

    expect(await screen.findByText('Error del servidor')).toBeInTheDocument();
  });

  it('shows a global error for non-Api errors', async () => {
    mockCreatePatient.mockRejectedValue(new Error('Sin conexión'));
    renderModal();
    const user = await fillValidForm();

    await user.click(screen.getByRole('button', { name: 'Crear paciente' }));

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

  it('closes via the header close button', async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();

    const closeButtons = screen.getAllByRole('button', { name: 'Cerrar' });
    await user.click(closeButtons[closeButtons.length - 1] as HTMLElement);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
