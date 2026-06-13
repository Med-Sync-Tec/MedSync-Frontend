import { render, screen, waitFor } from '@testing-library/react';

jest.mock('@features/auth/api', () => ({
  signOutCurrentUser: jest.fn(),
  signInWithEmail: jest.fn(),
  fetchMe: jest.fn(),
  updateUserPassword: jest.fn(),
}));

jest.mock('@lib/firebase/client', () => ({
  auth: {
    authStateReady: jest.fn().mockResolvedValue(undefined),
    currentUser: null,
  },
}));

import { THEME_STORAGE_KEY } from '@lib/theme/ThemeContext';
import { queryClient } from '@lib/query';
import { ApiError } from '@lib/http/errors';
import { useAuthStore } from '@features/auth/store';
import { signOutCurrentUser } from '@features/auth/api';
import App from './App';

beforeEach(() => {
  window.localStorage.clear();
  window.localStorage.setItem(THEME_STORAGE_KEY, 'light');
  useAuthStore.setState({ user: null, isAuthenticated: false });
  window.history.pushState({}, '', '/');
});

describe('App', () => {
  it('renders the login page at / for unauthenticated users', async () => {
    render(<App />);

    expect(await screen.findByText('Bienvenido de vuelta')).toBeInTheDocument();
  });

  it('renders without crashing inside its providers', async () => {
    const { container } = render(<App />);

    expect(await screen.findByRole('heading', { name: 'Bienvenido de vuelta' })).toBeInTheDocument();
    expect(container.firstChild).not.toBeNull();
  });

  it('logs out and redirects to / when a 401 reaches the query client', async () => {
    render(<App />);
    await screen.findByText('Bienvenido de vuelta');

    await queryClient
      .fetchQuery({
        queryKey: ['app-401-test'],
        queryFn: () => Promise.reject(new ApiError(401, 'No autorizado')),
        retry: false,
      })
      .catch(() => undefined);

    await waitFor(() => expect(jest.mocked(signOutCurrentUser)).toHaveBeenCalled());
    expect(window.location.pathname).toBe('/');
    queryClient.clear();
  });
});
