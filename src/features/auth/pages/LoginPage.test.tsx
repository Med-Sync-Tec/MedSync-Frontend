import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@lib/theme';

jest.mock('@features/auth/components/LoginForm', () => ({
  LoginForm: () => <div data-testid="login-form" />,
}));

import { LoginPage } from './LoginPage';

const THEME_STORAGE_KEY = 'medsync-theme';

function renderLoginPage() {
  return render(
    <ThemeProvider>
      <LoginPage />
    </ThemeProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  // Seed the theme so getInitialTheme never reaches window.matchMedia (missing in jsdom).
  localStorage.setItem(THEME_STORAGE_KEY, 'light');
  document.documentElement.classList.remove('dark');
});

afterEach(() => {
  jest.useRealTimers();
});

describe('LoginPage', () => {
  it('renders the welcome heading and the login form', () => {
    renderLoginPage();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Bienvenido de vuelta' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });

  it('renders the footer legal links', () => {
    renderLoginPage();

    expect(screen.getByRole('link', { name: 'Privacidad' })).toHaveAttribute(
      'href',
      '/privacidad',
    );
    expect(screen.getByRole('link', { name: 'Términos' })).toHaveAttribute('href', '/terminos');
  });

  it('toggles to dark mode and persists the preference', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.click(screen.getByRole('button', { name: 'Cambiar a modo oscuro' }));

    expect(screen.getByRole('button', { name: 'Cambiar a modo claro' })).toBeInTheDocument();
    expect(document.documentElement).toHaveClass('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('starts the carousel on the first slide', () => {
    renderLoginPage();
    const dots = screen.getAllByRole('tab');

    expect(dots).toHaveLength(3);
    expect(dots[0]).toHaveAttribute('aria-selected', 'true');
    expect(dots[1]).toHaveAttribute('aria-selected', 'false');
  });

  it('advances to the next slide with the next button', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.click(screen.getByRole('button', { name: 'Siguiente' }));

    expect(screen.getAllByRole('tab')[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('wraps to the last slide when going back from the first', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.click(screen.getByRole('button', { name: 'Anterior' }));

    expect(screen.getAllByRole('tab')[2]).toHaveAttribute('aria-selected', 'true');
  });

  it('jumps directly to a slide when its dot is clicked', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.click(screen.getByRole('tab', { name: 'Ir a la diapositiva 3' }));

    expect(screen.getAllByRole('tab')[2]).toHaveAttribute('aria-selected', 'true');
  });

  it('auto-advances the carousel after the slide interval', () => {
    jest.useFakeTimers();
    renderLoginPage();

    act(() => {
      jest.advanceTimersByTime(6500);
    });

    expect(screen.getAllByRole('tab')[1]).toHaveAttribute('aria-selected', 'true');
  });
});
