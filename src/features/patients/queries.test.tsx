import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('./api', () => ({
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

import { matchingKeys } from '@features/matching/queries';
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
import {
  patientKeys,
  useBulkAddPacienteContextos,
  useConsultasByPatient,
  useCreatePacienteContexto,
  useCreatePatient,
  useDeletePacienteContexto,
  useExpediente,
  usePacienteContextos,
  usePatient,
  usePatientDetail,
  usePatients,
} from './queries';
import type { PacienteContexto, Patient } from './schemas';

const PATIENT: Patient = {
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

const CONTEXTO: PacienteContexto = {
  id: 'c1',
  pacienteId: 'p1',
  tipo: 'enfermedad',
  valor: 'Hipertensión',
  createdAt: '2024-01-01T00:00:00Z',
};

const CONTEXTO_2: PacienteContexto = {
  id: 'c2',
  pacienteId: 'p1',
  tipo: 'sintoma',
  valor: 'Mareo',
  createdAt: '2024-01-02T00:00:00Z',
};

function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function createWrapper(qc: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('patientKeys', () => {
  it('builds hierarchical keys under "patients"', () => {
    expect(patientKeys.all).toEqual(['patients']);
    expect(patientKeys.lists()).toEqual(['patients', 'list']);
    expect(patientKeys.detail('p1')).toEqual(['patients', 'detail', 'p1']);
    expect(patientKeys.expediente('p1')).toEqual(['patients', 'expediente', 'p1']);
    expect(patientKeys.consultas('p1')).toEqual(['patients', 'consultas', 'p1']);
    expect(patientKeys.contextos('p1')).toEqual(['patients', 'contextos', 'p1']);
  });
});

describe('usePatients', () => {
  it('returns the patient list on success', async () => {
    jest.mocked(listPatients).mockResolvedValue([PATIENT]);
    const qc = createTestQueryClient();

    const { result } = renderHook(() => usePatients(), { wrapper: createWrapper(qc) });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([PATIENT]);
  });

  it('exposes the error on failure', async () => {
    jest.mocked(listPatients).mockRejectedValue(new Error('boom'));
    const qc = createTestQueryClient();

    const { result } = renderHook(() => usePatients(), { wrapper: createWrapper(qc) });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('boom');
  });
});

describe('usePatient', () => {
  it('fetches the patient when an id is provided', async () => {
    jest.mocked(getPatient).mockResolvedValue(PATIENT);
    const qc = createTestQueryClient();

    const { result } = renderHook(() => usePatient('p1'), { wrapper: createWrapper(qc) });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getPatient).toHaveBeenCalledWith('p1');
    expect(result.current.data).toEqual(PATIENT);
  });

  it('stays disabled without an id', () => {
    const qc = createTestQueryClient();

    const { result } = renderHook(() => usePatient(undefined), {
      wrapper: createWrapper(qc),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(getPatient).not.toHaveBeenCalled();
  });
});

describe('useExpediente', () => {
  it('fetches the expediente when enabled', async () => {
    jest.mocked(getExpediente).mockResolvedValue(EXPEDIENTE);
    const qc = createTestQueryClient();

    const { result } = renderHook(() => useExpediente('p1'), {
      wrapper: createWrapper(qc),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(EXPEDIENTE);
  });

  it('stays disabled without a patientId', () => {
    const qc = createTestQueryClient();

    const { result } = renderHook(() => useExpediente(undefined), {
      wrapper: createWrapper(qc),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(getExpediente).not.toHaveBeenCalled();
  });
});

describe('useConsultasByPatient', () => {
  it('fetches consultas when enabled', async () => {
    const consulta = {
      id: 'co1',
      fecha: '2024-02-01',
      motivoConsulta: '',
      subjetivo: '',
      objetivo: '',
      evaluacion: '',
      plan: '',
      prescripcion: '',
      diagnostico: '',
      createdAt: '2024-02-01T00:00:00Z',
    };
    jest.mocked(getConsultasByPatient).mockResolvedValue([consulta]);
    const qc = createTestQueryClient();

    const { result } = renderHook(() => useConsultasByPatient('p1'), {
      wrapper: createWrapper(qc),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([consulta]);
  });
});

describe('usePacienteContextos', () => {
  it('fetches contextos when enabled', async () => {
    jest.mocked(listPacienteContextos).mockResolvedValue([CONTEXTO]);
    const qc = createTestQueryClient();

    const { result } = renderHook(() => usePacienteContextos('p1'), {
      wrapper: createWrapper(qc),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([CONTEXTO]);
  });

  it('stays disabled without a patientId', () => {
    const qc = createTestQueryClient();

    const { result } = renderHook(() => usePacienteContextos(undefined), {
      wrapper: createWrapper(qc),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(listPacienteContextos).not.toHaveBeenCalled();
  });
});

describe('useCreatePatient', () => {
  it('seeds the detail cache and invalidates the list on success', async () => {
    jest.mocked(createPatient).mockResolvedValue(PATIENT);
    const qc = createTestQueryClient();
    const invalidateSpy = jest.spyOn(qc, 'invalidateQueries');

    const { result } = renderHook(() => useCreatePatient(), {
      wrapper: createWrapper(qc),
    });

    result.current.mutate({
      expedienteExternoId: 'HG-2024-001',
      nombre: 'María López',
      fechaNacimiento: '1990-05-10',
      genero: 'Femenino',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(qc.getQueryData(patientKeys.detail('p1'))).toEqual(PATIENT);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: patientKeys.lists() });
  });

  it('surfaces the mutation error', async () => {
    jest.mocked(createPatient).mockRejectedValue(new Error('duplicado'));
    const qc = createTestQueryClient();

    const { result } = renderHook(() => useCreatePatient(), {
      wrapper: createWrapper(qc),
    });

    result.current.mutate({
      expedienteExternoId: 'HG-2024-001',
      nombre: 'María López',
      fechaNacimiento: '1990-05-10',
      genero: 'Femenino',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('duplicado');
  });
});

describe('useCreatePacienteContexto', () => {
  it('prepends the created contexto and invalidates matching articles', async () => {
    jest.mocked(createPacienteContexto).mockResolvedValue(CONTEXTO);
    const qc = createTestQueryClient();
    qc.setQueryData(patientKeys.contextos('p1'), [CONTEXTO_2]);
    const invalidateSpy = jest.spyOn(qc, 'invalidateQueries');

    const { result } = renderHook(() => useCreatePacienteContexto('p1'), {
      wrapper: createWrapper(qc),
    });

    result.current.mutate({ tipo: 'enfermedad', valor: 'Hipertensión' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(createPacienteContexto).toHaveBeenCalledWith('p1', {
      tipo: 'enfermedad',
      valor: 'Hipertensión',
    });
    expect(qc.getQueryData(patientKeys.contextos('p1'))).toEqual([CONTEXTO, CONTEXTO_2]);
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: matchingKeys.articles('p1'),
    });
  });

  it('creates the cache entry when there is no previous data', async () => {
    jest.mocked(createPacienteContexto).mockResolvedValue(CONTEXTO);
    const qc = createTestQueryClient();

    const { result } = renderHook(() => useCreatePacienteContexto('p1'), {
      wrapper: createWrapper(qc),
    });

    result.current.mutate({ tipo: 'enfermedad', valor: 'Hipertensión' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(qc.getQueryData(patientKeys.contextos('p1'))).toEqual([CONTEXTO]);
  });
});

describe('useBulkAddPacienteContextos', () => {
  it('prepends the persisted batch and invalidates matching articles', async () => {
    jest.mocked(bulkAddPacienteContextos).mockResolvedValue([CONTEXTO]);
    const qc = createTestQueryClient();
    qc.setQueryData(patientKeys.contextos('p1'), [CONTEXTO_2]);
    const invalidateSpy = jest.spyOn(qc, 'invalidateQueries');

    const { result } = renderHook(() => useBulkAddPacienteContextos('p1'), {
      wrapper: createWrapper(qc),
    });

    result.current.mutate({ entries: [{ tipo: 'enfermedad', valor: 'Hipertensión' }] });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(bulkAddPacienteContextos).toHaveBeenCalledWith('p1', {
      entries: [{ tipo: 'enfermedad', valor: 'Hipertensión' }],
    });
    expect(qc.getQueryData(patientKeys.contextos('p1'))).toEqual([CONTEXTO, CONTEXTO_2]);
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: matchingKeys.articles('p1'),
    });
  });

  it('seeds the cache with the batch when there is no previous data', async () => {
    jest.mocked(bulkAddPacienteContextos).mockResolvedValue([CONTEXTO, CONTEXTO_2]);
    const qc = createTestQueryClient();

    const { result } = renderHook(() => useBulkAddPacienteContextos('p1'), {
      wrapper: createWrapper(qc),
    });

    result.current.mutate({ entries: [{ tipo: 'enfermedad', valor: 'x' }] });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(qc.getQueryData(patientKeys.contextos('p1'))).toEqual([CONTEXTO, CONTEXTO_2]);
  });
});

describe('useDeletePacienteContexto', () => {
  it('optimistically removes the contexto and calls the api', async () => {
    jest.mocked(deletePacienteContexto).mockResolvedValue(undefined);
    const qc = createTestQueryClient();
    qc.setQueryData(patientKeys.contextos('p1'), [CONTEXTO, CONTEXTO_2]);

    const { result } = renderHook(() => useDeletePacienteContexto('p1'), {
      wrapper: createWrapper(qc),
    });

    result.current.mutate('c1');

    await waitFor(() =>
      expect(qc.getQueryData(patientKeys.contextos('p1'))).toEqual([CONTEXTO_2]),
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(deletePacienteContexto).toHaveBeenCalledWith('p1', 'c1');
  });

  it('rolls back the cache when the delete fails', async () => {
    jest.mocked(deletePacienteContexto).mockRejectedValue(new Error('falló'));
    const qc = createTestQueryClient();
    qc.setQueryData(patientKeys.contextos('p1'), [CONTEXTO, CONTEXTO_2]);

    const { result } = renderHook(() => useDeletePacienteContexto('p1'), {
      wrapper: createWrapper(qc),
    });

    result.current.mutate('c1');

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(qc.getQueryData(patientKeys.contextos('p1'))).toEqual([CONTEXTO, CONTEXTO_2]);
  });

  it('invalidates contextos and matching articles on settle', async () => {
    jest.mocked(deletePacienteContexto).mockResolvedValue(undefined);
    const qc = createTestQueryClient();
    const invalidateSpy = jest.spyOn(qc, 'invalidateQueries');

    const { result } = renderHook(() => useDeletePacienteContexto('p1'), {
      wrapper: createWrapper(qc),
    });

    result.current.mutate('c1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: patientKeys.contextos('p1'),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: matchingKeys.articles('p1'),
    });
  });
});

describe('usePatientDetail', () => {
  it('returns empty inert state when no id is provided', () => {
    const qc = createTestQueryClient();

    const { result } = renderHook(() => usePatientDetail(undefined), {
      wrapper: createWrapper(qc),
    });

    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(getPatient).not.toHaveBeenCalled();
  });

  it('combines patient, expediente and consultas on success', async () => {
    jest.mocked(getPatient).mockResolvedValue(PATIENT);
    jest.mocked(getExpediente).mockResolvedValue(EXPEDIENTE);
    jest.mocked(getConsultasByPatient).mockResolvedValue([]);
    const qc = createTestQueryClient();

    const { result } = renderHook(() => usePatientDetail('p1'), {
      wrapper: createWrapper(qc),
    });

    await waitFor(() => expect(result.current.data).not.toBeNull());
    expect(result.current.data).toEqual({
      patient: PATIENT,
      expediente: EXPEDIENTE,
      consultas: [],
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('maps a missing expediente to null', async () => {
    jest.mocked(getPatient).mockResolvedValue(PATIENT);
    jest.mocked(getExpediente).mockResolvedValue(null);
    jest.mocked(getConsultasByPatient).mockResolvedValue([]);
    const qc = createTestQueryClient();

    const { result } = renderHook(() => usePatientDetail('p1'), {
      wrapper: createWrapper(qc),
    });

    await waitFor(() => expect(result.current.data).not.toBeNull());
    expect(result.current.data?.expediente).toBeNull();
  });

  it('reports loading while queries are in flight', () => {
    jest.mocked(getPatient).mockReturnValue(new Promise(() => {}));
    jest.mocked(getExpediente).mockReturnValue(new Promise(() => {}));
    jest.mocked(getConsultasByPatient).mockReturnValue(new Promise(() => {}));
    const qc = createTestQueryClient();

    const { result } = renderHook(() => usePatientDetail('p1'), {
      wrapper: createWrapper(qc),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();
  });

  it('surfaces the patient query error as the critical error', async () => {
    jest.mocked(getPatient).mockRejectedValue(new Error('paciente no existe'));
    jest.mocked(getExpediente).mockResolvedValue(null);
    jest.mocked(getConsultasByPatient).mockResolvedValue([]);
    const qc = createTestQueryClient();

    const { result } = renderHook(() => usePatientDetail('p1'), {
      wrapper: createWrapper(qc),
    });

    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.error?.message).toBe('paciente no existe');
    expect(result.current.data).toBeNull();
  });

  it('surfaces the consultas query error when the patient loads', async () => {
    jest.mocked(getPatient).mockResolvedValue(PATIENT);
    jest.mocked(getExpediente).mockResolvedValue(null);
    jest.mocked(getConsultasByPatient).mockRejectedValue(new Error('sin consultas'));
    const qc = createTestQueryClient();

    const { result } = renderHook(() => usePatientDetail('p1'), {
      wrapper: createWrapper(qc),
    });

    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.error?.message).toBe('sin consultas');
  });

  it('refetch re-runs the three queries', async () => {
    jest.mocked(getPatient).mockResolvedValue(PATIENT);
    jest.mocked(getExpediente).mockResolvedValue(EXPEDIENTE);
    jest.mocked(getConsultasByPatient).mockResolvedValue([]);
    const qc = createTestQueryClient();

    const { result } = renderHook(() => usePatientDetail('p1'), {
      wrapper: createWrapper(qc),
    });

    await waitFor(() => expect(result.current.data).not.toBeNull());

    result.current.refetch();

    await waitFor(() => {
      expect(getPatient).toHaveBeenCalledTimes(2);
      expect(getExpediente).toHaveBeenCalledTimes(2);
      expect(getConsultasByPatient).toHaveBeenCalledTimes(2);
    });
  });
});
