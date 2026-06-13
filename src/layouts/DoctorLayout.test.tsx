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

import { DoctorLayout } from './DoctorLayout';

function renderAt(path: string, child: React.ReactNode = <div>contenido de página</div>) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<DoctorLayout />}>
          <Route path="*" element={child} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('DoctorLayout', () => {
  it('renders the header with the doctor role and the outlet content', () => {
    renderAt('/doctor/dashboard');

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByText('contenido de página')).toBeInTheDocument();
  });

  it.each([
    ['/doctor/dashboard', 'Inicio'],
    ['/doctor/saved-news', 'Noticias Guardadas'],
    ['/doctor/patients', 'Pacientes'],
    ['/patients/123/history', 'Pacientes'],
    ['/medical-record/123', 'Pacientes'],
    ['/doctor/profile', 'ninguno'],
  ])('resolves the active nav link for %s as %s', (path, expected) => {
    renderAt(path);

    expect(screen.getByTestId('header')).toHaveTextContent(`doctor:${expected}`);
  });

  it('does not show the chat card initially', () => {
    renderAt('/doctor/dashboard');

    expect(screen.queryByTestId('chat-card')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Abrir MediBot' })).toBeInTheDocument();
    expect(screen.getByText('MediBot IA')).toBeInTheDocument();
  });

  it('opens the chat card when clicking the FAB', async () => {
    const user = userEvent.setup();
    renderAt('/doctor/dashboard');

    await user.click(screen.getByRole('button', { name: 'Abrir MediBot' }));

    expect(screen.getByTestId('chat-card')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cerrar MediBot' })).toBeInTheDocument();
  });

  it('closes the chat card from the card itself', async () => {
    const user = userEvent.setup();
    renderAt('/doctor/dashboard');

    await user.click(screen.getByRole('button', { name: 'Abrir MediBot' }));
    await user.click(screen.getByRole('button', { name: 'cerrar chat' }));

    expect(screen.queryByTestId('chat-card')).not.toBeInTheDocument();
  });

  it('toggles the chat closed when clicking the FAB twice', async () => {
    const user = userEvent.setup();
    renderAt('/doctor/dashboard');

    await user.click(screen.getByRole('button', { name: 'Abrir MediBot' }));
    await user.click(screen.getByRole('button', { name: 'Cerrar MediBot' }));

    expect(screen.queryByTestId('chat-card')).not.toBeInTheDocument();
  });

  it('shows the page spinner while a child route is suspended', () => {
    const Suspending = () => {
      throw new Promise(() => {});
    };
    renderAt('/doctor/dashboard', <Suspending />);

    expect(screen.getByRole('status', { name: 'Cargando' })).toBeInTheDocument();
  });

  it('catches errors from child routes with its error boundary', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const Bomb = () => {
      throw new Error('error en página privada');
    };

    renderAt('/doctor/dashboard', <Bomb />);

    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });
});
