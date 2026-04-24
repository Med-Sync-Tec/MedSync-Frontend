import React, { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '@ui/navigation/Header';
import { ErrorBoundary } from './ErrorBoundary';

function resolveActiveNav(pathname: string): string | undefined {
  if (pathname.startsWith('/doctor/dashboard')) return 'Inicio';
  if (pathname.startsWith('/doctor/saved-news')) return 'Noticias Guardadas';
  if (pathname.startsWith('/doctor/patients')) return 'Pacientes';
  if (pathname.startsWith('/medical-record')) return 'Pacientes';
  return undefined;
}

export const DoctorLayout: React.FC = () => {
  const { pathname } = useLocation();
  const activeLink = resolveActiveNav(pathname);

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Header role="doctor" activeLink={activeLink} />
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
