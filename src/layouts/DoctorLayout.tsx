import React, { Suspense, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '@ui/navigation/Header';
import { ChatCard } from '@ui/cards/ChatCard';
import { FAB } from '@ui/buttons/FAB';
import { useMediBot } from '@features/chat/hooks/useMediBot';
import { ErrorBoundary } from './ErrorBoundary';

const Fab = FAB;

function resolveActiveNav(pathname: string): string | undefined {
  if (pathname.startsWith('/doctor/dashboard')) return 'Inicio';
  if (pathname.startsWith('/doctor/saved-news')) return 'Noticias Guardadas';
  if (pathname.startsWith('/doctor/patients')) return 'Pacientes';
  if (pathname.startsWith('/patients')) return 'Pacientes';
  if (pathname.startsWith('/medical-record')) return 'Pacientes';
  return undefined;
}

export const DoctorLayout: React.FC = () => {
  const { pathname } = useLocation();
  const activeLink = resolveActiveNav(pathname);
  const [chatOpen, setChatOpen] = useState(false);
  const { messages, isLoading, send } = useMediBot();

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Header role="doctor" activeLink={activeLink} />
      <ErrorBoundary>
        <Suspense fallback={<PageSpinner />}>
          <Outlet />
        </Suspense>
      </ErrorBoundary>

      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 flex flex-col items-end gap-3">
        {chatOpen && (
          <ChatCard
            messages={messages}
            isLoading={isLoading}
            onClose={() => setChatOpen(false)}
            onSend={send}
          />
        )}
        <Fab
          label={chatOpen ? '' : 'MediBot IA'}
          icon={
            chatOpen
              ? <span className="material-symbols-outlined text-2xl">close</span>
              : <span className="material-symbols-outlined text-2xl">smart_toy</span>
          }
          onClick={() => setChatOpen((prev) => !prev)}
          aria-label={chatOpen ? 'Cerrar MediBot' : 'Abrir MediBot'}
        />
      </div>
    </div>
  );
};

const PageSpinner: React.FC = () => (
  <output className="flex items-center justify-center py-20" aria-label="Cargando">
    <span className="material-symbols-outlined animate-spin text-3xl text-gray-400" aria-hidden="true">
      progress_activity
    </span>
  </output>
);
