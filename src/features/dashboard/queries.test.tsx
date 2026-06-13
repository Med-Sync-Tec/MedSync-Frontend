import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('./api', () => ({
  getDashboardData: jest.fn(),
}));

import { getDashboardData } from './api';
import { useDashboardData } from './queries';
import type { DashboardData } from './types';

const mockGetDashboardData = jest.mocked(getDashboardData);

const DASHBOARD: DashboardData = {
  novedades_48h: [],
  no_leidos: [],
  por_especialidad: [],
  alta_evidencia: [],
};

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

describe('useDashboardData', () => {
  it('fetches the dashboard data through getDashboardData', async () => {
    mockGetDashboardData.mockResolvedValue(DASHBOARD);

    const { result } = renderHook(() => useDashboardData(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGetDashboardData).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(DASHBOARD);
  });

  it('starts in loading state', () => {
    mockGetDashboardData.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useDashboardData(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('surfaces an error state when the API call fails', async () => {
    mockGetDashboardData.mockRejectedValue(new Error('falló el backend'));

    const { result } = renderHook(() => useDashboardData(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('falló el backend');
  });
});
