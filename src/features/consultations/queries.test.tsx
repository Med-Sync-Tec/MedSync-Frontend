import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('./api', () => ({
  createConsulta: jest.fn(),
  analyzeConsulta: jest.fn(),
  sendDictation: jest.fn(),
}));

import { createConsulta, analyzeConsulta } from './api';
import { useCreateConsulta, useAnalyzeConsulta } from './queries';
import { patientKeys } from '@features/patients/queries';
import type { CreateConsultaInput } from './schemas';

const mockCreateConsulta = jest.mocked(createConsulta);
const mockAnalyzeConsulta = jest.mocked(analyzeConsulta);

const INPUT: CreateConsultaInput = {
  fecha: '2024-05-10T10:00:00',
  motivoConsulta: undefined,
  subjetivo: undefined,
  objetivo: undefined,
  evaluacion: undefined,
  plan: undefined,
  prescripcion: undefined,
  diagnostico: undefined,
};

const CONSULTA = {
  id: 'c1',
  fecha: '2024-05-10T10:00:00',
  motivoConsulta: 'Dolor',
  subjetivo: '',
  objetivo: '',
  evaluacion: '',
  plan: '',
  prescripcion: '',
  diagnostico: '',
  createdAt: '2024-05-10T10:05:00',
};

const ANALYSIS = {
  consultaId: 'c1',
  especialidadId: 'e1',
  especialidadSlug: 'cardiologia',
  vocabularyStatus: 'POPULATED' as const,
  suggestions: [{ tipo: 'enfermedad', valor: 'Asma' }],
  modelUsed: 'llama-3.3-70b',
  promptTokens: 10,
  completionTokens: 5,
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useCreateConsulta', () => {
  it('calls createConsulta with the patient id and input', async () => {
    mockCreateConsulta.mockResolvedValue(CONSULTA);
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useCreateConsulta('p1'), { wrapper });
    result.current.mutate(INPUT);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockCreateConsulta).toHaveBeenCalledWith('p1', INPUT);
    expect(result.current.data).toEqual(CONSULTA);
  });

  it('invalidates the patient consultas query on success', async () => {
    mockCreateConsulta.mockResolvedValue(CONSULTA);
    const { queryClient, wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateConsulta('p1'), { wrapper });
    result.current.mutate(INPUT);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: patientKeys.consultas('p1') });
  });

  it('exposes the error and does not invalidate queries on failure', async () => {
    mockCreateConsulta.mockRejectedValue(new Error('backend caído'));
    const { queryClient, wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateConsulta('p1'), { wrapper });
    result.current.mutate(INPUT);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('backend caído');
    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});

describe('useAnalyzeConsulta', () => {
  it('calls analyzeConsulta with the consulta id and returns the analysis', async () => {
    mockAnalyzeConsulta.mockResolvedValue(ANALYSIS);
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useAnalyzeConsulta(), { wrapper });
    result.current.mutate('c1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockAnalyzeConsulta.mock.calls[0][0]).toBe('c1');
    expect(result.current.data).toEqual(ANALYSIS);
  });

  it('does not invalidate any queries on success (read-only mutation)', async () => {
    mockAnalyzeConsulta.mockResolvedValue(ANALYSIS);
    const { queryClient, wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useAnalyzeConsulta(), { wrapper });
    result.current.mutate('c1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).not.toHaveBeenCalled();
  });

  it('exposes the error when the analysis fails', async () => {
    mockAnalyzeConsulta.mockRejectedValue(new Error('timeout de IA'));
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useAnalyzeConsulta(), { wrapper });
    result.current.mutate('c1');

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('timeout de IA');
  });
});
