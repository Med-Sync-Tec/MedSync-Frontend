import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { ErrorBoundary } from './ErrorBoundary';

export const AuthLayout: React.FC = () => (
  <ErrorBoundary>
    <Suspense fallback={null}>
      <Outlet />
    </Suspense>
  </ErrorBoundary>
);
