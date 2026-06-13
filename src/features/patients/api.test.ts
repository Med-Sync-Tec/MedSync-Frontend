
jest.mock('@lib/http/client', () => ({
  apiFetch: jest.fn(),
}));

import { apiFetch } from '@lib/http/client';
import { ApiError } from '@lib/http/errors';
import {
  bulkAddPacienteContextos,
  createPacienteContexto,
  createPatient,
  deletePacienteContexto,
  getConsultasByPatient,
  getExpediente,
  getPatient,
  listPacienteContextos,
  listPatients,
} from './api';

const mockApiFetch = jest.mocked(apiFetch);

const PATIENT = {
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

const EXPEDIENTE = {
  id: 'e1',
  pacienteExternoId: 'HG-2024-001',
  doctorResponsableId: 'd1',
  createdAt: '2024-01-01T00:00:00Z',
};

const CONTEXTO = {
  id: 'c1',
  pacienteId: 'p1',
  tipo: 'enfermedad',
  valor: 'Hipertensión',
  createdAt: '2024-01-01T00:00:00Z',
};

const CONSULTA = {
  id: 'co1',
  fecha: '2024-02-01',
  motivoConsulta: 'Dolor',
  subjetivo: null,
  objetivo: null,
  evaluacion: null,
  plan: null,
  prescripcion: null,
  diagnostico: 'Gripe',
  createdAt: '2024-02-01T00:00:00Z',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('listPatients', () => {
  it('calls GET /api/patients and returns the parsed list', async () => {
    mockApiFetch.mockResolvedValue([PATIENT]);

    const result = await listPatients();

    expect(mockApiFetch).toHaveBeenCalledWith('/api/patients');
    expect(result).toEqual([PATIENT]);
  });

  it('throws if the response is not a patient array', async () => {
    mockApiFetch.mockResolvedValue([{ bogus: true }]);

    await expect(listPatients()).rejects.toThrow();
  });
});

describe('getPatient', () => {
  it('calls GET /api/patients/:id with an encoded id', async () => {
    mockApiFetch.mockResolvedValue(PATIENT);

    const result = await getPatient('p 1/x');

    expect(mockApiFetch).toHaveBeenCalledWith('/api/patients/p%201%2Fx');
    expect(result).toEqual(PATIENT);
  });

  it('throws if the response does not match the schema', async () => {
    mockApiFetch.mockResolvedValue({ id: 'p1' });

    await expect(getPatient('p1')).rejects.toThrow();
  });
});

describe('getExpediente', () => {
  it('returns the parsed expediente', async () => {
    mockApiFetch.mockResolvedValue(EXPEDIENTE);

    const result = await getExpediente('p1');

    expect(mockApiFetch).toHaveBeenCalledWith('/api/patients/p1/expediente');
    expect(result).toEqual(EXPEDIENTE);
  });

  it('returns null when the backend responds 404', async () => {
    mockApiFetch.mockRejectedValue(new ApiError(404, 'No encontrado'));

    await expect(getExpediente('p1')).resolves.toBeNull();
  });

  it('rethrows non-404 ApiErrors', async () => {
    mockApiFetch.mockRejectedValue(new ApiError(500, 'Server error'));

    await expect(getExpediente('p1')).rejects.toThrow('Server error');
  });

  it('rethrows non-ApiError failures', async () => {
    mockApiFetch.mockRejectedValue(new Error('network down'));

    await expect(getExpediente('p1')).rejects.toThrow('network down');
  });

  it('throws if the response does not match the schema', async () => {
    mockApiFetch.mockResolvedValue({ id: 'e1' });

    await expect(getExpediente('p1')).rejects.toThrow();
  });
});

describe('createPatient', () => {
  const INPUT = {
    expedienteExternoId: 'HG-2024-001',
    nombre: 'María López',
    fechaNacimiento: '1990-05-10',
    genero: 'Femenino',
  };

  it('calls POST /api/patients with the full body when genero is set', async () => {
    mockApiFetch.mockResolvedValue(PATIENT);

    const result = await createPatient(INPUT);

    expect(mockApiFetch).toHaveBeenCalledWith('/api/patients', {
      method: 'POST',
      body: {
        expedienteExternoId: 'HG-2024-001',
        nombre: 'María López',
        fechaNacimiento: '1990-05-10',
        genero: 'Femenino',
      },
    });
    expect(result).toEqual(PATIENT);
  });

  it('omits genero from the body when it is empty', async () => {
    mockApiFetch.mockResolvedValue(PATIENT);

    await createPatient({ ...INPUT, genero: '' });

    expect(mockApiFetch).toHaveBeenCalledWith('/api/patients', {
      method: 'POST',
      body: {
        expedienteExternoId: 'HG-2024-001',
        nombre: 'María López',
        fechaNacimiento: '1990-05-10',
      },
    });
  });

  it('throws if the response does not match the schema', async () => {
    mockApiFetch.mockResolvedValue({ ok: true });

    await expect(createPatient(INPUT)).rejects.toThrow();
  });
});

describe('getConsultasByPatient', () => {
  it('calls GET /api/patients/:id/consultas and parses null SOAP fields', async () => {
    mockApiFetch.mockResolvedValue([CONSULTA]);

    const result = await getConsultasByPatient('p1');

    expect(mockApiFetch).toHaveBeenCalledWith('/api/patients/p1/consultas');
    expect(result[0]?.subjetivo).toBe('');
    expect(result[0]?.diagnostico).toBe('Gripe');
  });

  it('throws if the response is not a consulta array', async () => {
    mockApiFetch.mockResolvedValue([{ id: 'co1' }]);

    await expect(getConsultasByPatient('p1')).rejects.toThrow();
  });
});

describe('listPacienteContextos', () => {
  it('calls GET /api/patients/:id/contextos and returns the parsed list', async () => {
    mockApiFetch.mockResolvedValue([CONTEXTO]);

    const result = await listPacienteContextos('p1');

    expect(mockApiFetch).toHaveBeenCalledWith('/api/patients/p1/contextos');
    expect(result).toEqual([CONTEXTO]);
  });

  it('throws if the response does not match the schema', async () => {
    mockApiFetch.mockResolvedValue([{ ...CONTEXTO, tipo: 'invalid' }]);

    await expect(listPacienteContextos('p1')).rejects.toThrow();
  });
});

describe('createPacienteContexto', () => {
  it('calls POST /api/patients/:id/contextos with tipo and valor', async () => {
    mockApiFetch.mockResolvedValue(CONTEXTO);

    const result = await createPacienteContexto('p1', {
      tipo: 'enfermedad',
      valor: 'Hipertensión',
    });

    expect(mockApiFetch).toHaveBeenCalledWith('/api/patients/p1/contextos', {
      method: 'POST',
      body: { tipo: 'enfermedad', valor: 'Hipertensión' },
    });
    expect(result).toEqual(CONTEXTO);
  });

  it('throws if the response does not match the schema', async () => {
    mockApiFetch.mockResolvedValue({ id: 'c1' });

    await expect(
      createPacienteContexto('p1', { tipo: 'enfermedad', valor: 'x' }),
    ).rejects.toThrow();
  });
});

describe('deletePacienteContexto', () => {
  it('calls DELETE /api/patients/:id/contextos/:contextoId with encoded ids', async () => {
    mockApiFetch.mockResolvedValue(undefined);

    await deletePacienteContexto('p/1', 'c 2');

    expect(mockApiFetch).toHaveBeenCalledWith('/api/patients/p%2F1/contextos/c%202', {
      method: 'DELETE',
    });
  });
});

describe('bulkAddPacienteContextos', () => {
  it('calls POST /api/patients/:id/contextos/bulk with the entries', async () => {
    mockApiFetch.mockResolvedValue([CONTEXTO]);

    const entries = [{ tipo: 'enfermedad' as const, valor: 'Hipertensión' }];
    const result = await bulkAddPacienteContextos('p1', { entries });

    expect(mockApiFetch).toHaveBeenCalledWith('/api/patients/p1/contextos/bulk', {
      method: 'POST',
      body: { entries },
    });
    expect(result).toEqual([CONTEXTO]);
  });

  it('throws if the response does not match the schema', async () => {
    mockApiFetch.mockResolvedValue([{ nope: 1 }]);

    await expect(
      bulkAddPacienteContextos('p1', {
        entries: [{ tipo: 'enfermedad', valor: 'x' }],
      }),
    ).rejects.toThrow();
  });
});
