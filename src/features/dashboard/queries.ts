import { useQuery } from '@tanstack/react-query';
import { getDashboardData } from './api';
import { DashboardData } from './types';

export const useDashboardData = () => {
  return useQuery<DashboardData, Error>({
    queryKey: ['dashboardData'],
    queryFn: getDashboardData,
  });
};
