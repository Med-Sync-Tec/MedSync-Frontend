import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import type { AuthUser, UserRole } from '@features/auth/schemas';

jest.mock('@features/auth/api', () => ({
  signOutCurrentUser: jest.fn(),
}));

import { useAuthStore } from '@features/auth/store';
import { RedirectIfAuth } from './RedirectIfAuth';

function makeUser(role: UserRole): AuthUser {
  return {
    id: 'u1',
    email: 'user@medsync.mx',
    name: 'Usuario Prueba',
    role,
    especialidadId: null,
  };
}

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route
          path="/"
          element={
            <RedirectIfAuth>
              <div>formulario de login</div>
            </RedirectIfAuth>
          }
        />
        <Route path="/doctor/dashboard" element={<div>panel doctor</div>} />
        <Route path="/coo/dashboard" element={<div>panel coo</div>} />
        <Route path="/cmo/dashboard" element={<div>panel cmo</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  useAuthStore.setState({ user: null, isAuthenticated: false });
});

describe('RedirectIfAuth', () => {
  it('renders children when the user is not authenticated', () => {
    renderLogin();

    expect(screen.getByText('formulario de login')).toBeInTheDocument();
  });

  it.each([
    ['DOCTOR', 'panel doctor'],
    ['COO', 'panel coo'],
    ['CMO', 'panel cmo'],
  ] as const)('redirects an authenticated %s to their landing page', (role, landingText) => {
    useAuthStore.setState({ user: makeUser(role), isAuthenticated: true });

    renderLogin();

    expect(screen.queryByText('formulario de login')).not.toBeInTheDocument();
    expect(screen.getByText(landingText)).toBeInTheDocument();
  });

  it('renders children when authenticated flag is set but user is missing', () => {
    useAuthStore.setState({ user: null, isAuthenticated: true });

    renderLogin();

    expect(screen.getByText('formulario de login')).toBeInTheDocument();
  });
});
