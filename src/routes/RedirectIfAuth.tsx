import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@features/auth/store';

interface RedirectIfAuthProps {
  children: React.ReactNode;
  to?: string;
}

export const RedirectIfAuth: React.FC<RedirectIfAuthProps> = ({
  children,
  to = '/medical-record/history',
}) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to={to} replace />;
  }
  return <>{children}</>;
};
