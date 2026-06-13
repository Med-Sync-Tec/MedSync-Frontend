import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('./api', () => ({
  getMatchingArticles: jest.fn(),
  getCooMatchingArticles: jest.fn(),
  getMatchingPatients: jest.fn(),
  listEspecialidades: jest.fn(),
}));

import {
  getMatchingArticles,
  getCooMatchingArticles,
  getMatchingPatients,
  listEspecialidades,
} from './api';
import {
  matchingKeys,
  useMatchingArticles,
  useMatchingPatients,
  useCooMatchingArticles,
  useEspecialidades,
} from './queries';

const mockGetMatchingArticles = jest.mocked(getMatchingArticles);
const mockGetCooMatchingArticles = jest.mocked(getCooMatchingArticles);
const mockGetMatchingPatients = jest.mocked(getMatchingPatients);
const mockListEspecialidades = jest.mocked(listEspecialidades);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('matchingKeys', () => {
  it('namespaces every key under "matching"', () => {
    expect(matchingKeys.all).toEqual(['matching']);
    expect(matchingKeys.articles('p1')).toEqual(['matching', 'articles', 'p1']);
    expect(matchingKeys.patients('a1')).toEqual(['matching', 'patients', 'a1']);
    expect(matchingKeys.cooArticles()).toEqual(['matching', 'coo-articles']);
    expect(matchingKeys.especialidades()).toEqual(['matching', 'especialidades']);
  });
});

describe('useMatchingArticles', () => {
  it('fetches articles for the given patient', async () => {
    mockGetMatchingArticles.mockResolvedValue([]);

    const { result } = renderHook(() => useMatchingArticles('pat-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGetMatchingArticles).toHaveBeenCalledWith('pat-1');
    expect(result.current.data).toEqual([]);
  });

  it('stays disabled when patientId is undefined', async () => {
    const { result } = renderHook(() => useMatchingArticles(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockGetMatchingArticles).not.toHaveBeenCalled();
  });

  it('surfaces query errors', async () => {
    mockGetMatchingArticles.mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useMatchingArticles('pat-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

describe('useMatchingPatients', () => {
  it('fetches patients for the given article', async () => {
    mockGetMatchingPatients.mockResolvedValue([]);

    const { result } = renderHook(() => useMatchingPatients('art-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGetMatchingPatients).toHaveBeenCalledWith('art-1');
  });

  it('stays disabled when articleId is undefined', () => {
    const { result } = renderHook(() => useMatchingPatients(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockGetMatchingPatients).not.toHaveBeenCalled();
  });

  it('stays disabled when enabled is false even with an articleId', () => {
    const { result } = renderHook(() => useMatchingPatients('art-1', false), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockGetMatchingPatients).not.toHaveBeenCalled();
  });
});

describe('useCooMatchingArticles', () => {
  it('fetches the COO matching feed', async () => {
    mockGetCooMatchingArticles.mockResolvedValue([]);

    const { result } = renderHook(() => useCooMatchingArticles(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGetCooMatchingArticles).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual([]);
  });
});

describe('useEspecialidades', () => {
  it('exposes an empty byId map before data arrives', () => {
    mockListEspecialidades.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useEspecialidades(), {
      wrapper: createWrapper(),
    });

    expect(result.current.byId.size).toBe(0);
  });

  it('builds a byId lookup map from the catalog', async () => {
    const catalog = [
      { id: 'e1', nombre: 'Cardiología' },
      { id: 'e2', nombre: 'Neurología' },
    ];
    mockListEspecialidades.mockResolvedValue(catalog);

    const { result } = renderHook(() => useEspecialidades(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.byId.size).toBe(2);
    expect(result.current.byId.get('e1')).toEqual(catalog[0]);
    expect(result.current.byId.get('e2')).toEqual(catalog[1]);
  });

  it('keeps byId stable across rerenders with the same data', async () => {
    mockListEspecialidades.mockResolvedValue([{ id: 'e1', nombre: 'Cardiología' }]);

    const { result, rerender } = renderHook(() => useEspecialidades(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const firstMap = result.current.byId;
    rerender();

    expect(result.current.byId).toBe(firstMap);
  });
});
