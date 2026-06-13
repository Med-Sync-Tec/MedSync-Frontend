import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

jest.mock('@ui/navigation/Header', () => ({
  Header: ({ role, activeLink }: { role: string; activeLink?: string }) => (
    <div data-testid="header">
      {role}:{activeLink ?? 'ninguno'}
    </div>
  ),
}));

jest.mock('@ui/cards/ChatCard', () => ({
  ChatCard: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="chat-card">
      <button type="button" onClick={onClose}>
        cerrar chat
      </button>
    </div>
  ),
}));

const mockMediBot = {
  messages: [],
  isLoading: false,
  send: jest.fn(),
  clear: jest.fn(),
};

jest.mock('@features/chat/hooks/useMediBot', () => ({
  useMediBot: () => mockMediBot,
}));

import { CooLayout } from './CooLayout';

function renderAt(path: string, child: React.ReactNode = <div>contenido de página</div>) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<CooLayout />}>
          <Route path="*" element={child} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('CooLayout', () => {
  it('renders the header with the coo role and the outlet content', () => {
    renderAt('/coo/dashboard');

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByText('contenido de página')).toBeInTheDocument();
  });

  it.each([
    ['/coo/dashboard', 'Inicio'],
    ['/coo/medication-news', 'Por Medicamento'],
    ['/coo/saved-news', 'Guardadas'],
    ['/coo/inventory', 'Inventario'],
    ['/coo/doctors/new', 'Médicos'],
    ['/coo/profile', 'ninguno'],
  ])('resolves the active nav link for %s as %s', (path, expected) => {
    renderAt(path);

    expect(screen.getByTestId('header')).toHaveTextContent(`coo:${expected}`);
  });

  it('toggles the chat card with the FAB and closes it from the card', async () => {
    const user = userEvent.setup();
    renderAt('/coo/dashboard');

    expect(screen.queryByTestId('chat-card')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Abrir MediBot' }));
    expect(screen.getByTestId('chat-card')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'cerrar chat' }));
    expect(screen.queryByTestId('chat-card')).not.toBeInTheDocument();
  });

  it('shows the page spinner while a child route is suspended', () => {
    const Suspending = () => {
      throw new Promise(() => {});
    };
    renderAt('/coo/dashboard', <Suspending />);

    expect(screen.getByRole('status', { name: 'Cargando' })).toBeInTheDocument();
  });

  it('catches errors from child routes with its error boundary', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const Bomb = () => {
      throw new Error('error en página coo');
    };

    renderAt('/coo/dashboard', <Bomb />);

    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });
});
