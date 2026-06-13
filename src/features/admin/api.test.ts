
jest.mock('@lib/http/client', () => ({
  apiFetch: jest.fn(),
}));

import { apiFetch } from '@lib/http/client';
import { listActiveSpecialties, createUser, createDoctor } from './api';

const mockApiFetch = jest.mocked(apiFetch);

const SPECIALTY_UUID = '3f1b6a52-8c4d-4e2a-9f7b-1d2c3e4f5a6b';
const USER_UUID = '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d';

const backendSpecialty = {
  id: SPECIALTY_UUID,
  nombre: 'Cardiología',
  slug: 'cardiologia',
  descripcion: null,
  activo: true,
};

const backendCreatedUser = {
  id: USER_UUID,
  nombre: 'Dr. Juan Pérez',
  correo: 'juan@medsync.local',
  role: 'DOCTOR',
  especialidadId: SPECIALTY_UUID,
  especialidadNombre: 'Cardiología',
  activo: true,
  createdAt: null,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('listActiveSpecialties', () => {
  it('calls GET /api/especialidades', async () => {
    mockApiFetch.mockResolvedValue([backendSpecialty]);

    await listActiveSpecialties();

    expect(mockApiFetch).toHaveBeenCalledWith('/api/especialidades');
  });

  it('returns the parsed specialty list on success', async () => {
    mockApiFetch.mockResolvedValue([backendSpecialty]);

    const result = await listActiveSpecialties();

    expect(result).toEqual([backendSpecialty]);
  });

  it('rejects when the response does not match the schema', async () => {
    mockApiFetch.mockResolvedValue([{ id: 'bad', nombre: 1 }]);

    await expect(listActiveSpecialties()).rejects.toThrow();
  });
});

describe('createUser', () => {
  it('calls POST /api/admin/users with especialidadId for a DOCTOR', async () => {
    mockApiFetch.mockResolvedValue(backendCreatedUser);

    await createUser({
      rol: 'DOCTOR',
      nombre: 'Dr. Juan Pérez',
      correo: 'juan@medsync.local',
      password: 'secret123',
      especialidadId: SPECIALTY_UUID,
    });

    expect(mockApiFetch).toHaveBeenCalledWith('/api/admin/users', {
      method: 'POST',
      body: {
        correo: 'juan@medsync.local',
        nombre: 'Dr. Juan Pérez',
        password: 'secret123',
        rol: 'DOCTOR',
        especialidadId: SPECIALTY_UUID,
      },
    });
  });

  it('omits especialidadId for a COO even when provided', async () => {
    mockApiFetch.mockResolvedValue({ ...backendCreatedUser, role: 'COO', especialidadId: null });

    await createUser({
      rol: 'COO',
      nombre: 'Lic. María García',
      correo: 'maria@medsync.local',
      password: 'secret123',
      especialidadId: SPECIALTY_UUID,
    });

    expect(mockApiFetch).toHaveBeenCalledWith('/api/admin/users', {
      method: 'POST',
      body: {
        correo: 'maria@medsync.local',
        nombre: 'Lic. María García',
        password: 'secret123',
        rol: 'COO',
        especialidadId: undefined,
      },
    });
  });

  it('returns the parsed created user on success', async () => {
    mockApiFetch.mockResolvedValue(backendCreatedUser);

    const result = await createUser({
      rol: 'DOCTOR',
      nombre: 'Dr. Juan Pérez',
      correo: 'juan@medsync.local',
      password: 'secret123',
      especialidadId: SPECIALTY_UUID,
    });

    expect(result).toEqual(backendCreatedUser);
  });

  it('rejects when the response does not match the schema', async () => {
    mockApiFetch.mockResolvedValue({ ok: true });

    await expect(
      createUser({
        rol: 'COO',
        nombre: 'Lic. María García',
        correo: 'maria@medsync.local',
        password: 'secret123',
      })
    ).rejects.toThrow();
  });

  it('exposes createDoctor as a backward-compat alias', () => {
    expect(createDoctor).toBe(createUser);
  });
});
