import { apiFetch } from '@lib/http/client';
import type { DashboardData } from './types';

export const getDashboardData = async (): Promise<DashboardData> => {
  return apiFetch<DashboardData>('/api/v1/dashboard/kpis');
};
