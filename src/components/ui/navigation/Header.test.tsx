import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Header } from './Header';
import { useAuthStore } from '@features/auth/store';
import { ThemeProvider } from '@lib/theme';
import { signOutCurrentUser } from '@features/auth/api';

jest.mock('./GlobalSearch', () => ({
  GlobalSearch: () => <div data-testid="global-search" />,
}));

jest.mock('@features/auth/api', () => ({
  signOutCurrentUser: jest.fn(() => Promise.resolve()),
}));

const doctorUser = {
  id: 'u1',
  email: 'ana.lopez@medsync.mx',
  name: 'Ana López',
  role: 'DOCTOR' as const,
};

function renderHeader(props: Partial<React.ComponentProps<typeof Header>> = {}) {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <Header role="doctor" {...props} />
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('Header', () => {
  beforeAll(() => {
    // jsdom does not implement matchMedia, which ThemeProvider uses to detect
    // the OS color scheme preference.
    window.matchMedia = jest.fn(() => ({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })) as unknown as typeof window.matchMedia;
  });

  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('dark');
    useAuthStore.setState({ user: doctorUser, isAuthenticated: true });
    jest.mocked(signOutCurrentUser).mockClear();
  });

  it('renders the MedSync brand link pointing to the doctor home', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: 'MedSync — Inicio' })).toHaveAttribute(
      'href',
      '/doctor/dashboard'
    );
  });

  it('points the brand link to the COO home for the coo role', () => {
    renderHeader({ role: 'coo' });
    expect(screen.getByRole('link', { name: 'MedSync — Inicio' })).toHaveAttribute(
      'href',
      '/coo/dashboard'
    );
  });

  it('renders the doctor navigation links', () => {
    renderHeader();

    const nav = screen.getByRole('navigation', { name: 'Navegación principal' });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute(
      'href',
      '/doctor/dashboard'
    );
    expect(screen.getByRole('link', { name: 'Pacientes' })).toHaveAttribute(
      'href',
      '/doctor/patients'
    );
  });

  it('renders the COO navigation links', () => {
    renderHeader({ role: 'coo' });

    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('href', '/coo/dashboard');
    expect(screen.getByRole('link', { name: 'Por Medicamento' })).toHaveAttribute(
      'href',
      '/coo/medication-news'
    );
    expect(screen.getByRole('link', { name: 'Inventario' })).toHaveAttribute(
      'href',
      '/coo/inventory'
    );
    expect(screen.getByRole('link', { name: 'Médicos' })).toHaveAttribute(
      'href',
      '/coo/doctors/new'
    );
  });

  it('marks the active link with aria-current="page"', () => {
    renderHeader({ activeLink: 'Pacientes' });

    expect(screen.getByRole('link', { name: 'Pacientes' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(screen.getByRole('link', { name: 'Inicio' })).not.toHaveAttribute('aria-current');
  });

  it('renders the embedded global search', () => {
    renderHeader();
    expect(screen.getByTestId('global-search')).toBeInTheDocument();
  });

  it('toggles between light and dark theme', async () => {
    renderHeader();

    const toggle = screen.getByRole('button', { name: 'Activar modo oscuro' });
    await userEvent.click(toggle);

    expect(screen.getByRole('button', { name: 'Activar modo claro' })).toBeInTheDocument();
    expect(document.documentElement).toHaveClass('dark');

    await userEvent.click(screen.getByRole('button', { name: 'Activar modo claro' }));
    expect(document.documentElement).not.toHaveClass('dark');
  });

  it('shows the user initials, name and email', () => {
    renderHeader();

    expect(screen.getByText('AL')).toBeInTheDocument();
    expect(screen.getByText('Ana López')).toBeInTheDocument();
    expect(screen.getByText('ana.lopez@medsync.mx')).toBeInTheDocument();
  });

  it('does not render the user menu when no user is logged in', () => {
    useAuthStore.setState({ user: null, isAuthenticated: false });
    renderHeader();

    expect(screen.queryByRole('button', { name: /Menú de usuario/ })).not.toBeInTheDocument();
  });

  it('opens the user menu with a profile link for the current role', async () => {
    renderHeader();

    const trigger = screen.getByRole('button', { name: 'Menú de usuario — Ana López' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menu', { name: 'Menú de usuario' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Perfil' })).toHaveAttribute(
      'href',
      '/doctor/profile'
    );
  });

  it('closes the user menu when Escape is pressed', async () => {
    renderHeader();

    await userEvent.click(screen.getByRole('button', { name: 'Menú de usuario — Ana López' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('logs out the user from the menu', async () => {
    renderHeader();

    await userEvent.click(screen.getByRole('button', { name: 'Menú de usuario — Ana López' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Cerrar sesión' }));

    expect(signOutCurrentUser).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  it('toggles the mobile navigation menu', async () => {
    renderHeader();

    const toggle = screen.getByRole('button', { name: 'Abrir menú' });
    expect(screen.queryByRole('navigation', { name: 'Navegación móvil' })).not.toBeInTheDocument();

    await userEvent.click(toggle);

    expect(screen.getByRole('navigation', { name: 'Navegación móvil' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cerrar menú' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });

  it('closes the mobile navigation when a mobile link is clicked', async () => {
    renderHeader();

    await userEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    const mobileNav = screen.getByRole('navigation', { name: 'Navegación móvil' });

    await userEvent.click(within(mobileNav).getByRole('link', { name: 'Inicio' }));

    expect(
      screen.queryByRole('navigation', { name: 'Navegación móvil' })
    ).not.toBeInTheDocument();
  });
});
