import { isValidElement, type ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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

import { ThemeProvider } from '@lib/theme';
import { THEME_STORAGE_KEY } from '@lib/theme/ThemeContext';
import { useAuthStore } from '@features/auth/store';
import { AuthLayout, DoctorLayout, CooLayout } from '@layouts/index';
import { routes } from './index';
import { RequireAuth } from './RequireAuth';
import { RedirectIfAuth } from './RedirectIfAuth';

function elementChild(node: ReactNode): ReactNode {
  if (!isValidElement<{ children?: ReactNode }>(node)) return undefined;
  return node.props.children;
}

function collectPaths(): string[] {
  return routes.flatMap((route) => {
    const own = route.path ? [route.path] : [];
    const children = (route.children ?? []).flatMap((child) => (child.path ? [child.path] : []));
    return [...own, ...children];
  });
}

beforeEach(() => {
  globalThis.localStorage.clear();
  globalThis.localStorage.setItem(THEME_STORAGE_KEY, 'light');
  useAuthStore.setState({ user: null, isAuthenticated: false });
});

describe('routes table — structure', () => {
  it('registers all expected paths', () => {
    const paths = collectPaths();

    expect(paths).toEqual(
      expect.arrayContaining([
        '/',
        '/doctor/dashboard',
        '/doctor/patients',
        '/doctor/profile',
        '/patients/:patientId/history',
        '/patients/:patientId/consultas/new',
        '/coo/dashboard',
        '/coo/medication-news',
        '/coo/profile',
        '/coo/inventory',
        '/coo/doctors/new',
        '/privacidad',
        '/terminos',
        '/404',
        '*',
      ]),
    );
  });

  it('wraps the public login route in AuthLayout and RedirectIfAuth', () => {
    const publicBlock = routes[0];

    expect(isValidElement(publicBlock.element) && publicBlock.element.type).toBe(AuthLayout);
    const loginRoute = publicBlock.children?.[0];
    expect(loginRoute?.path).toBe('/');
    expect(isValidElement(loginRoute?.element) && loginRoute.element.type).toBe(RedirectIfAuth);
  });

  it('guards the doctor block with RequireAuth around DoctorLayout', () => {
    const doctorBlock = routes[1];

    expect(isValidElement(doctorBlock.element) && doctorBlock.element.type).toBe(RequireAuth);
    const layout = elementChild(doctorBlock.element);
    expect(isValidElement(layout) && layout.type).toBe(DoctorLayout);
  });

  it('guards the coo block with RequireAuth around CooLayout', () => {
    const cooBlock = routes[2];

    expect(isValidElement(cooBlock.element) && cooBlock.element.type).toBe(RequireAuth);
    const layout = elementChild(cooBlock.element);
    expect(isValidElement(layout) && layout.type).toBe(CooLayout);
  });
});

function renderRouterAt(path: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

describe('routes table — rendering', () => {
  it('renders the 404 page at /404', () => {
    renderRouterAt('/404');

    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument();
    expect(screen.getByText('Página no encontrada')).toBeInTheDocument();
  });

  it('redirects unknown paths to the 404 page', () => {
    renderRouterAt('/esta-ruta-no-existe');

    expect(screen.getByText('Página no encontrada')).toBeInTheDocument();
  });

  it('shows the login page at / when not authenticated', async () => {
    renderRouterAt('/');

    expect(await screen.findByText('Bienvenido de vuelta')).toBeInTheDocument();
  });

  it('redirects unauthenticated users from private routes to the login page', async () => {
    renderRouterAt('/doctor/dashboard');

    expect(await screen.findByText('Bienvenido de vuelta')).toBeInTheDocument();
  });
});
