
jest.mock('@lib/http/client', () => ({
  apiFetch: jest.fn(),
}));

import { apiFetch } from '@lib/http/client';
import {
  fetchMedicamentos,
  createMedicamento,
  updateMedicamento,
  deleteMedicamento,
} from './api';

const mockApiFetch = jest.mocked(apiFetch);

const VALID_UUID = '7f4df3a2-5b1c-4f7e-9a3d-2c8b1e6f4a90';

const backendMedicamento = {
  id: VALID_UUID,
  nombre: 'Amoxicilina 500mg',
  estado: 'vigente',
  descripcion: null,
  createdAt: null,
  updatedAt: null,
};

const backendPage = {
  content: [backendMedicamento],
  page: 0,
  size: 10,
  totalElements: 1,
  totalPages: 1,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('fetchMedicamentos', () => {
  it('calls GET /api/medicamentos without query string when no params are given', async () => {
    mockApiFetch.mockResolvedValue(backendPage);

    await fetchMedicamentos();

    expect(mockApiFetch).toHaveBeenCalledWith('/api/medicamentos');
  });

  it('builds the query string from page, size, nombre and estado', async () => {
    mockApiFetch.mockResolvedValue(backendPage);

    await fetchMedicamentos({ page: 2, size: 10, nombre: 'amoxi', estado: 'vigente' });

    expect(mockApiFetch).toHaveBeenCalledWith(
      '/api/medicamentos?page=2&size=10&nombre=amoxi&estado=vigente'
    );
  });

  it('omits estado when it is "todos"', async () => {
    mockApiFetch.mockResolvedValue(backendPage);

    await fetchMedicamentos({ page: 0, estado: 'todos' });

    expect(mockApiFetch).toHaveBeenCalledWith('/api/medicamentos?page=0');
  });

  it('omits nombre when it is empty', async () => {
    mockApiFetch.mockResolvedValue(backendPage);

    await fetchMedicamentos({ nombre: '', estado: 'obsoleto' });

    expect(mockApiFetch).toHaveBeenCalledWith('/api/medicamentos?estado=obsoleto');
  });

  it('returns the parsed page on success', async () => {
    mockApiFetch.mockResolvedValue(backendPage);

    const result = await fetchMedicamentos();

    expect(result).toEqual(backendPage);
  });

  it('rejects when the response does not match the schema', async () => {
    mockApiFetch.mockResolvedValue({ items: [], total: 0 });

    await expect(fetchMedicamentos()).rejects.toThrow();
  });
});

describe('createMedicamento', () => {
  it('calls POST /api/medicamentos with nombre and descripcion', async () => {
    mockApiFetch.mockResolvedValue(backendMedicamento);

    await createMedicamento({ nombre: 'Amoxicilina 500mg', descripcion: 'Antibiótico' });

    expect(mockApiFetch).toHaveBeenCalledWith('/api/medicamentos', {
      method: 'POST',
      body: { nombre: 'Amoxicilina 500mg', descripcion: 'Antibiótico' },
    });
  });

  it('returns the parsed medicamento on success', async () => {
    mockApiFetch.mockResolvedValue(backendMedicamento);

    const result = await createMedicamento({ nombre: 'Amoxicilina 500mg', descripcion: '' });

    expect(result).toEqual(backendMedicamento);
  });

  it('rejects when the response does not match the schema', async () => {
    mockApiFetch.mockResolvedValue({ id: 'not-a-uuid', nombre: 'x' });

    await expect(
      createMedicamento({ nombre: 'Amoxicilina 500mg', descripcion: '' })
    ).rejects.toThrow();
  });
});

describe('updateMedicamento', () => {
  it('calls PUT /api/medicamentos/:id with nombre, estado and descripcion', async () => {
    mockApiFetch.mockResolvedValue(backendMedicamento);

    await updateMedicamento(VALID_UUID, {
      nombre: 'Amoxicilina 500mg',
      estado: 'obsoleto',
      descripcion: 'Retirado',
    });

    expect(mockApiFetch).toHaveBeenCalledWith(`/api/medicamentos/${VALID_UUID}`, {
      method: 'PUT',
      body: { nombre: 'Amoxicilina 500mg', estado: 'obsoleto', descripcion: 'Retirado' },
    });
  });

  it('returns the parsed medicamento on success', async () => {
    mockApiFetch.mockResolvedValue(backendMedicamento);

    const result = await updateMedicamento(VALID_UUID, {
      nombre: 'Amoxicilina 500mg',
      estado: 'vigente',
      descripcion: '',
    });

    expect(result).toEqual(backendMedicamento);
  });

  it('rejects when the response does not match the schema', async () => {
    mockApiFetch.mockResolvedValue({ unexpected: true });

    await expect(
      updateMedicamento(VALID_UUID, { nombre: 'x', estado: 'vigente', descripcion: '' })
    ).rejects.toThrow();
  });
});

describe('deleteMedicamento', () => {
  it('calls DELETE /api/medicamentos/:id', async () => {
    mockApiFetch.mockResolvedValue(undefined);

    await deleteMedicamento(VALID_UUID);

    expect(mockApiFetch).toHaveBeenCalledWith(`/api/medicamentos/${VALID_UUID}`, {
      method: 'DELETE',
    });
  });

  it('propagates errors from apiFetch', async () => {
    mockApiFetch.mockRejectedValue(new Error('network down'));

    await expect(deleteMedicamento(VALID_UUID)).rejects.toThrow('network down');
  });
});
