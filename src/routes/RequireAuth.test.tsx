import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import type { AuthUser } from '@features/auth/schemas';

jest.mock('@features/auth/api', () => ({
  signOutCurrentUser: jest.fn(),
}));

import { useAuthStore } from '@features/auth/store';
import { RequireAuth } from './RequireAuth';

const DOCTOR_USER: AuthUser = {
  id: 'u1',
  email: 'doc@medsync.mx',
  name: 'Dra. Prueba',
  role: 'DOCTOR',
  especialidadId: null,
};

const LoginProbe = () => {
  const location = useLocation();
  const state = location.state as { from?: string } | null;
  return <div>login desde {state?.from ?? 'ninguno'}</div>;
};

function renderAt(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<LoginProbe />} />
        <Route
          path="/privado"
          element={
            <RequireAuth>
              <div>contenido privado</div>
            </RequireAuth>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  useAuthStore.setState({ user: null, isAuthenticated: false });
});

describe('RequireAuth', () => {
  it('renders children when the user is authenticated', () => {
    useAuthStore.setState({ user: DOCTOR_USER, isAuthenticated: true });

    renderAt('/privado');

    expect(screen.getByText('contenido privado')).toBeInTheDocument();
  });

  it('redirects to / when the user is not authenticated', () => {
    renderAt('/privado');

    expect(screen.queryByText('contenido privado')).not.toBeInTheDocument();
    expect(screen.getByText(/login desde/)).toBeInTheDocument();
  });

  it('passes the original pathname in the navigation state', () => {
    renderAt('/privado');

    expect(screen.getByText('login desde /privado')).toBeInTheDocument();
  });
});
