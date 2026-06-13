
jest.mock('@lib/http/client', () => ({
  apiFetch: jest.fn(),
}));

import { apiFetch } from '@lib/http/client';
import { getDashboardData } from './api';
import type { DashboardData } from './types';

const mockApiFetch = jest.mocked(apiFetch);

const EMPTY_DASHBOARD: DashboardData = {
  novedades_48h: [],
  no_leidos: [],
  por_especialidad: [],
  alta_evidencia: [],
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getDashboardData', () => {
  it('calls GET /api/v1/dashboard/kpis', async () => {
    mockApiFetch.mockResolvedValue(EMPTY_DASHBOARD);

    await getDashboardData();

    expect(mockApiFetch).toHaveBeenCalledTimes(1);
    expect(mockApiFetch).toHaveBeenCalledWith('/api/v1/dashboard/kpis');
  });

  it('returns the payload from the backend unchanged', async () => {
    mockApiFetch.mockResolvedValue(EMPTY_DASHBOARD);

    const result = await getDashboardData();

    expect(result).toEqual(EMPTY_DASHBOARD);
  });

  it('propagates errors thrown by apiFetch', async () => {
    mockApiFetch.mockRejectedValue(new Error('network down'));

    await expect(getDashboardData()).rejects.toThrow('network down');
  });
});
