import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ApiError } from '@lib/http/errors';
import { CreateDoctorPage } from './CreateDoctorPage';
import type { CreatedUser, Specialty } from '@features/admin/schemas';

jest.mock('@features/admin/api', () => ({
  listActiveSpecialties: jest.fn(),
  createUser: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual<typeof import('react-router-dom')>('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

import { listActiveSpecialties, createUser } from '@features/admin/api';

const mockListSpecialties = jest.mocked(listActiveSpecialties);
const mockCreateUser = jest.mocked(createUser);

const SPECIALTY_UUID = '3f1b6a52-8c4d-4e2a-9f7b-1d2c3e4f5a6b';
const USER_UUID = '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d';

const specialties: Specialty[] = [
  { id: SPECIALTY_UUID, nombre: 'Cardiología', slug: 'cardiologia', descripcion: null, activo: true },
];

const createdDoctor: CreatedUser = {
  id: USER_UUID,
  nombre: 'Dr. Juan Pérez',
  correo: 'juan@medsync.local',
  role: 'DOCTOR',
  especialidadId: SPECIALTY_UUID,
  especialidadNombre: 'Cardiología',
  activo: true,
  createdAt: null,
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <CreateDoctorPage />
    </MemoryRouter>
  );

const fillBaseFields = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText('Nombre completo'), 'Dr. Juan Pérez');
  await user.type(screen.getByLabelText('Correo electrónico'), 'juan@medsync.local');
  await user.type(screen.getByLabelText('Contraseña inicial'), 'secret123');
};

beforeEach(() => {
  jest.clearAllMocks();
  mockListSpecialties.mockResolvedValue(specialties);
});

describe('CreateDoctorPage', () => {
  it('renders the form with DOCTOR selected by default', async () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'Crear usuario' })).toBeInTheDocument();
    expect(screen.getByLabelText('Especialidad')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear doctor' })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Cardiología' })).toBeInTheDocument();
    });
  });

  it('disables the specialty select while specialties are loading', () => {
    mockListSpecialties.mockReturnValue(new Promise(() => {}));

    renderPage();

    expect(screen.getByLabelText('Especialidad')).toBeDisabled();
    expect(screen.getByRole('option', { name: 'Cargando especialidades...' })).toBeInTheDocument();
  });

  it('shows an alert when specialties fail to load', async () => {
    mockListSpecialties.mockRejectedValue(new ApiError(500, 'Falla interna'));

    renderPage();

    expect(
      await screen.findByText('No se pudieron cargar las especialidades: Falla interna')
    ).toBeInTheDocument();
  });

  it('shows field errors and does not call the API when submitting an empty DOCTOR form', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => expect(mockListSpecialties).toHaveBeenCalled());

    await user.click(screen.getByRole('button', { name: 'Crear doctor' }));

    expect(screen.getByText('El nombre es obligatorio')).toBeInTheDocument();
    expect(screen.getByText('El correo es obligatorio')).toBeInTheDocument();
    expect(screen.getByText('Mínimo 6 caracteres')).toBeInTheDocument();
    // Appears twice: as select placeholder and as the validation error below it
    expect(screen.getAllByText('Selecciona una especialidad')).toHaveLength(2);
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  it('shows a format error for an invalid email', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText('Nombre completo'), 'Dr. Juan Pérez');
    await user.type(screen.getByLabelText('Correo electrónico'), 'no-es-correo');
    await user.type(screen.getByLabelText('Contraseña inicial'), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Crear doctor' }));

    expect(screen.getByText('Formato de correo inválido')).toBeInTheDocument();
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  it('clears the field error once the user edits the field', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Crear doctor' }));
    expect(screen.getByText('El nombre es obligatorio')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Nombre completo'), 'D');

    expect(screen.queryByText('El nombre es obligatorio')).not.toBeInTheDocument();
  });

  it('hides the specialty field when the COO role is selected', async () => {
    const user = userEvent.setup();
    renderPage();

    // The role button's accessible name includes the material icon ligature text
    await user.click(screen.getByRole('button', { name: /COO/ }));

    expect(screen.queryByLabelText('Especialidad')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear COO' })).toBeInTheDocument();
  });

  it('creates a DOCTOR and shows the success screen', async () => {
    const user = userEvent.setup();
    mockCreateUser.mockResolvedValue(createdDoctor);
    renderPage();
    await screen.findByRole('option', { name: 'Cardiología' });

    await fillBaseFields(user);
    await user.selectOptions(screen.getByLabelText('Especialidad'), SPECIALTY_UUID);
    await user.click(screen.getByRole('button', { name: 'Crear doctor' }));

    expect(await screen.findByRole('heading', { name: 'Usuario creado' })).toBeInTheDocument();
    expect(mockCreateUser).toHaveBeenCalledWith({
      rol: 'DOCTOR',
      nombre: 'Dr. Juan Pérez',
      correo: 'juan@medsync.local',
      password: 'secret123',
      especialidadId: SPECIALTY_UUID,
    });
    expect(screen.getByText('Especialidad asignada: Cardiología')).toBeInTheDocument();
    expect(screen.getByText('juan@medsync.local')).toBeInTheDocument();
  });

  it('creates a COO without especialidadId', async () => {
    const user = userEvent.setup();
    mockCreateUser.mockResolvedValue({
      ...createdDoctor,
      nombre: 'Lic. María García',
      correo: 'maria@medsync.local',
      role: 'COO',
      especialidadId: null,
      especialidadNombre: null,
    });
    renderPage();

    await user.click(screen.getByRole('button', { name: /COO/ }));
    await user.type(screen.getByLabelText('Nombre completo'), 'Lic. María García');
    await user.type(screen.getByLabelText('Correo electrónico'), 'maria@medsync.local');
    await user.type(screen.getByLabelText('Contraseña inicial'), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Crear COO' }));

    expect(await screen.findByRole('heading', { name: 'Usuario creado' })).toBeInTheDocument();
    expect(mockCreateUser).toHaveBeenCalledWith({
      rol: 'COO',
      nombre: 'Lic. María García',
      correo: 'maria@medsync.local',
      password: 'secret123',
    });
    expect(
      screen.getByText('Director de Operaciones (COO)')
    ).toBeInTheDocument();
  });

  it('returns to a clean form when clicking "Crear otro usuario"', async () => {
    const user = userEvent.setup();
    mockCreateUser.mockResolvedValue(createdDoctor);
    renderPage();
    await screen.findByRole('option', { name: 'Cardiología' });

    await fillBaseFields(user);
    await user.selectOptions(screen.getByLabelText('Especialidad'), SPECIALTY_UUID);
    await user.click(screen.getByRole('button', { name: 'Crear doctor' }));
    await screen.findByRole('heading', { name: 'Usuario creado' });

    await user.click(screen.getByRole('button', { name: 'Crear otro usuario' }));

    expect(screen.getByRole('heading', { name: 'Crear usuario' })).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre completo')).toHaveValue('');
  });

  it('navigates to the COO dashboard from the success screen', async () => {
    const user = userEvent.setup();
    mockCreateUser.mockResolvedValue(createdDoctor);
    renderPage();
    await screen.findByRole('option', { name: 'Cardiología' });

    await fillBaseFields(user);
    await user.selectOptions(screen.getByLabelText('Especialidad'), SPECIALTY_UUID);
    await user.click(screen.getByRole('button', { name: 'Crear doctor' }));
    await screen.findByRole('heading', { name: 'Usuario creado' });

    await user.click(screen.getByRole('button', { name: 'Volver al panel' }));

    expect(mockNavigate).toHaveBeenCalledWith('/coo/dashboard');
  });

  it('navigates back when clicking Cancelar', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(mockNavigate).toHaveBeenCalledWith('/coo/dashboard');
  });

  it.each([
    [new ApiError(409, 'conflict'), 'El correo ya está registrado.'],
    [new ApiError(403, 'forbidden'), 'Solo el COO puede crear usuarios.'],
    [new ApiError(401, 'unauthorized'), 'Tu sesión expiró. Vuelve a iniciar sesión.'],
    [
      new ApiError(400, 'bad request', [{ field: 'correo', message: 'ya existe' }]),
      'correo: ya existe',
    ],
    [new ApiError(500, 'Error interno del servidor'), 'Error interno del servidor'],
    [new Error('falló la red'), 'falló la red'],
  ])('maps a server error to a friendly message (%#)', async (error, expectedMessage) => {
    const user = userEvent.setup();
    mockCreateUser.mockRejectedValue(error);
    renderPage();
    await screen.findByRole('option', { name: 'Cardiología' });

    await fillBaseFields(user);
    await user.selectOptions(screen.getByLabelText('Especialidad'), SPECIALTY_UUID);
    await user.click(screen.getByRole('button', { name: 'Crear doctor' }));

    expect(await screen.findByText(expectedMessage)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Usuario creado' })).not.toBeInTheDocument();
  });

  it('shows the 400 ApiError message when there are no field errors', async () => {
    const user = userEvent.setup();
    mockCreateUser.mockRejectedValue(new ApiError(400, 'Datos inválidos'));
    renderPage();
    await screen.findByRole('option', { name: 'Cardiología' });

    await fillBaseFields(user);
    await user.selectOptions(screen.getByLabelText('Especialidad'), SPECIALTY_UUID);
    await user.click(screen.getByRole('button', { name: 'Crear doctor' }));

    expect(await screen.findByText('Datos inválidos')).toBeInTheDocument();
  });

  it('shows a generic message for non-Error rejections', async () => {
    const user = userEvent.setup();
    mockCreateUser.mockRejectedValue('string failure');
    renderPage();
    await screen.findByRole('option', { name: 'Cardiología' });

    await fillBaseFields(user);
    await user.selectOptions(screen.getByLabelText('Especialidad'), SPECIALTY_UUID);
    await user.click(screen.getByRole('button', { name: 'Crear doctor' }));

    expect(await screen.findByText('Ocurrió un error inesperado.')).toBeInTheDocument();
  });
});
