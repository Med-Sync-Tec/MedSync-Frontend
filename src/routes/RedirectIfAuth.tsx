import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@features/auth/store';
import type { UserRole } from '@features/auth/schemas';

const LANDING_BY_ROLE: Record<UserRole, string> = {
  DOCTOR: '/doctor/dashboard',
  COO: '/coo/dashboard',
  CMO: '/cmo/dashboard',
};

interface RedirectIfAuthProps {
  children: React.ReactNode;
}

export const RedirectIfAuth: React.FC<RedirectIfAuthProps> = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated && user) {
    return <Navigate to={LANDING_BY_ROLE[user.role]} replace />;
  }
  return <>{children}</>;
};
