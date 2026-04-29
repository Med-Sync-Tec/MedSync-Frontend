import React, { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '@ui/navigation/Header';
import { ErrorBoundary } from './ErrorBoundary';

function resolveActiveNav(pathname: string): string | undefined {
  if (pathname.startsWith('/coo/dashboard')) return 'Inicio';
  if (pathname.startsWith('/coo/inventory')) return 'Inventario';
  if (pathname.startsWith('/coo/reports')) return 'Reportes';
  return undefined;
}

export const CooLayout: React.FC = () => {
  const { pathname } = useLocation();
  const activeLink = resolveActiveNav(pathname);

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Header role="coo" activeLink={activeLink} />
      <ErrorBoundary>
        <Suspense fallback={<PageSpinner />}>
          <Outlet />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

const PageSpinner: React.FC = () => (
  <div className="flex items-center justify-center py-20" role="status" aria-label="Cargando">
    <span className="material-symbols-outlined animate-spin text-3xl text-gray-400" aria-hidden="true">
      progress_activity
    </span>
  </div>
);
