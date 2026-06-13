import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('@features/inventory/api', () => ({
  fetchMedicamentos: jest.fn(),
}));

import { fetchMedicamentos } from '@features/inventory/api';
import type { Medicamento, MedicamentosPage } from '@features/inventory/schemas';
import { cooKeys, toMedicamentoContextos, useCatalogMedicamentos } from './medicationContext';

const mockFetchMedicamentos = jest.mocked(fetchMedicamentos);

function makeMedicamento(overrides: Partial<Medicamento> = {}): Medicamento {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    nombre: 'Paracetamol',
    estado: 'vigente',
    descripcion: null,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: null,
    ...overrides,
  };
}

function makePage(content: Medicamento[]): MedicamentosPage {
  return { content, page: 0, size: 500, totalElements: content.length, totalPages: 1 };
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('cooKeys', () => {
  it('builds the catalog key under the coo namespace', () => {
    expect(cooKeys.all).toEqual(['coo']);
    expect(cooKeys.catalog()).toEqual(['coo', 'medicamentos-catalog']);
  });
});

describe('toMedicamentoContextos', () => {
  it('returns an empty array when medicamentos is undefined', () => {
    expect(toMedicamentoContextos(undefined)).toEqual([]);
  });

  it('returns an empty array for an empty catalog', () => {
    expect(toMedicamentoContextos([])).toEqual([]);
  });

  it('maps each medication to a medicamento-typed contexto', () => {
    const med = makeMedicamento();

    const contextos = toMedicamentoContextos([med]);

    expect(contextos).toEqual([
      {
        id: med.id,
        pacienteId: '',
        tipo: 'medicamento',
        valor: 'Paracetamol',
        createdAt: '2026-01-15T10:00:00Z',
      },
    ]);
  });

  it('falls back to an empty createdAt when the medication has none', () => {
    const med = makeMedicamento({ createdAt: null });

    const [contexto] = toMedicamentoContextos([med]);

    expect(contexto.createdAt).toBe('');
  });

  it('preserves catalog order and does not mutate the input', () => {
    const meds = [
      makeMedicamento({ id: '11111111-1111-4111-8111-111111111111', nombre: 'A' }),
      makeMedicamento({ id: '22222222-2222-4222-8222-222222222222', nombre: 'B' }),
    ];
    const snapshot = structuredClone(meds);

    const contextos = toMedicamentoContextos(meds);

    expect(contextos.map((c) => c.valor)).toEqual(['A', 'B']);
    expect(meds).toEqual(snapshot);
  });
});

describe('useCatalogMedicamentos', () => {
  it('requests a single big page and exposes its content', async () => {
    const meds = [makeMedicamento()];
    mockFetchMedicamentos.mockResolvedValue(makePage(meds));

    const { result } = renderHook(() => useCatalogMedicamentos(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetchMedicamentos).toHaveBeenCalledWith({ page: 0, size: 500 });
    expect(result.current.data).toEqual(meds);
  });

  it('surfaces an error state when the catalog request fails', async () => {
    mockFetchMedicamentos.mockRejectedValue(new Error('catálogo caído'));

    const { result } = renderHook(() => useCatalogMedicamentos(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
