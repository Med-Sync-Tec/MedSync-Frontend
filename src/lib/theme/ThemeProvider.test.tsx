import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from './ThemeProvider';
import { useTheme, getInitialTheme, THEME_STORAGE_KEY } from './ThemeContext';

const matchMediaMock = jest.fn();

function setPrefersDark(prefersDark: boolean): void {
  matchMediaMock.mockImplementation((query: string) => ({
    matches: prefersDark,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
}

const originalMatchMedia = window.matchMedia;

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.classList.remove('dark');
  setPrefersDark(false);
  window.matchMedia = matchMediaMock as unknown as typeof window.matchMedia;
});

afterEach(() => {
  window.matchMedia = originalMatchMedia;
});

const ThemeProbe = () => {
  const { theme, toggle, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button type="button" onClick={toggle}>
        alternar
      </button>
      <button type="button" onClick={() => setTheme('dark')}>
        forzar oscuro
      </button>
      <button type="button" onClick={() => setTheme('light')}>
        forzar claro
      </button>
    </div>
  );
};

describe('getInitialTheme', () => {
  it('returns the stored theme when localStorage has "dark"', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');

    expect(getInitialTheme()).toBe('dark');
  });

  it('returns the stored theme when localStorage has "light"', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'light');

    expect(getInitialTheme()).toBe('light');
  });

  it('falls back to the OS preference when nothing is stored (dark)', () => {
    setPrefersDark(true);

    expect(getInitialTheme()).toBe('dark');
  });

  it('falls back to the OS preference when nothing is stored (light)', () => {
    setPrefersDark(false);

    expect(getInitialTheme()).toBe('light');
  });

  it('ignores invalid stored values and falls back to the OS preference', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'neon');
    setPrefersDark(true);

    expect(getInitialTheme()).toBe('dark');
  });
});

describe('useTheme', () => {
  it('throws when used outside of ThemeProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const Orphan = () => {
      useTheme();
      return null;
    };

    expect(() => render(<Orphan />)).toThrow('useTheme must be used within <ThemeProvider>');

    consoleSpy.mockRestore();
  });
});

describe('ThemeProvider', () => {
  it('renders its children', () => {
    render(
      <ThemeProvider>
        <p>contenido hijo</p>
      </ThemeProvider>,
    );

    expect(screen.getByText('contenido hijo')).toBeInTheDocument();
  });

  it('starts in light mode and does not apply the dark class', () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(document.documentElement).not.toHaveClass('dark');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('initializes from a persisted dark theme and applies the dark class', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(document.documentElement).toHaveClass('dark');
  });

  it('toggle switches from light to dark, applies the class and persists', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'alternar' }));

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(document.documentElement).toHaveClass('dark');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('toggle switches back from dark to light and removes the class', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'alternar' }));

    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(document.documentElement).not.toHaveClass('dark');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('setTheme forces a specific theme', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'forzar oscuro' }));
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(document.documentElement).toHaveClass('dark');

    await user.click(screen.getByRole('button', { name: 'forzar claro' }));
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(document.documentElement).not.toHaveClass('dark');
  });
});
