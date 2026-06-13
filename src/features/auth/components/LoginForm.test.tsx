import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

jest.mock('@features/auth/api', () => ({
  signInWithEmail: jest.fn(),
  signOutCurrentUser: jest.fn(),
  fetchMe: jest.fn(),
  updateUserPassword: jest.fn(),
}));

import { signInWithEmail } from '@features/auth/api';
import { useAuthStore } from '@features/auth/store';
import type { AuthUser } from '@features/auth/schemas';
import { LoginForm } from './LoginForm';

const mockSignIn = jest.mocked(signInWithEmail);

const DOCTOR_USER: AuthUser = {
  id: 'user-1',
  email: 'ana@clinica.com',
  name: 'Dra. Ana López',
  role: 'DOCTOR',
  especialidadId: null,
};

interface RenderOptions {
  routeState?: { from?: string };
}

function renderLoginForm({ routeState }: RenderOptions = {}) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/', state: routeState ?? null }]}>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/doctor/dashboard" element={<div>Panel del doctor</div>} />
        <Route path="/coo/dashboard" element={<div>Panel del COO</div>} />
        <Route path="/cmo/dashboard" element={<div>Panel del CMO</div>} />
        <Route path="/destino-previo" element={<div>Página previa</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

async function fillAndSubmit(email: string, password: string) {
  const user = userEvent.setup();
  if (email) await user.type(screen.getByLabelText('Correo electrónico'), email);
  if (password) await user.type(screen.getByLabelText('Contraseña'), password);
  await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));
  return user;
}

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  useAuthStore.setState({ user: null, isAuthenticated: false });
});

describe('LoginForm', () => {
  it('renders the email field, password field and submit button', () => {
    renderLoginForm();

    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('shows required-field errors and does not call the API when submitted empty', async () => {
    renderLoginForm();

    await fillAndSubmit('', '');

    expect(screen.getAllByText('Este campo es obligatorio')).toHaveLength(2);
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('shows the invalid-email error for a malformed email', async () => {
    renderLoginForm();

    await fillAndSubmit('no-es-correo', 'secret123');

    expect(screen.getByText('Formato de correo inválido')).toBeInTheDocument();
    expect(screen.getByLabelText('Correo electrónico')).toHaveAttribute('aria-invalid', 'true');
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('clears the field error once the user types again', async () => {
    renderLoginForm();
    const user = await fillAndSubmit('', 'secret123');
    expect(screen.getByText('Este campo es obligatorio')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Correo electrónico'), 'a');

    expect(screen.queryByText('Este campo es obligatorio')).not.toBeInTheDocument();
  });

  it('logs in, stores the user and navigates to the doctor dashboard on success', async () => {
    mockSignIn.mockResolvedValue(DOCTOR_USER);
    renderLoginForm();

    await fillAndSubmit('ana@clinica.com', 'secret123');

    expect(mockSignIn).toHaveBeenCalledWith('ana@clinica.com', 'secret123');
    expect(useAuthStore.getState().user).toEqual(DOCTOR_USER);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(await screen.findByText('Panel del doctor')).toBeInTheDocument();
  });

  it('navigates to the COO dashboard when the user role is COO', async () => {
    mockSignIn.mockResolvedValue({ ...DOCTOR_USER, role: 'COO' });
    renderLoginForm();

    await fillAndSubmit('coo@clinica.com', 'secret123');

    expect(await screen.findByText('Panel del COO')).toBeInTheDocument();
  });

  it('redirects to the route stored in location.state.from after login', async () => {
    mockSignIn.mockResolvedValue(DOCTOR_USER);
    renderLoginForm({ routeState: { from: '/destino-previo' } });

    await fillAndSubmit('ana@clinica.com', 'secret123');

    expect(await screen.findByText('Página previa')).toBeInTheDocument();
  });

  it('shows the described error and keeps the session logged out when sign-in fails', async () => {
    mockSignIn.mockRejectedValue(new Error('Correo o contraseña incorrectos.'));
    renderLoginForm();

    await fillAndSubmit('ana@clinica.com', 'malaclave');

    expect(await screen.findByText('Correo o contraseña incorrectos.')).toBeInTheDocument();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('disables the submit button and shows a progress label while verifying', async () => {
    let resolveSignIn: (user: AuthUser) => void = () => undefined;
    mockSignIn.mockImplementation(
      () => new Promise<AuthUser>((resolve) => (resolveSignIn = resolve)),
    );
    renderLoginForm();

    await fillAndSubmit('ana@clinica.com', 'secret123');

    expect(screen.getByText('Verificando…')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /verificando/i })).toBeDisabled();

    resolveSignIn(DOCTOR_USER);
    expect(await screen.findByText('Panel del doctor')).toBeInTheDocument();
  });

  it('dismisses the error alert when closed', async () => {
    mockSignIn.mockRejectedValue(new Error('Correo o contraseña incorrectos.'));
    renderLoginForm();
    const user = await fillAndSubmit('ana@clinica.com', 'malaclave');
    const alertMessage = await screen.findByText('Correo o contraseña incorrectos.');

    // The Alert close button has no aria-label; its accessible name is the icon text "close".
    await user.click(screen.getByRole('button', { name: 'close' }));

    expect(alertMessage).not.toBeInTheDocument();
  });

  it('toggles the remember-me checkbox', async () => {
    const user = userEvent.setup();
    renderLoginForm();
    const checkbox = screen.getByRole('checkbox', { name: /mantener sesión iniciada/i });
    expect(checkbox).toBeChecked();

    await user.click(checkbox);

    expect(checkbox).not.toBeChecked();
  });

  it('toggles the password visibility', async () => {
    const user = userEvent.setup();
    renderLoginForm();
    const passwordInput = screen.getByLabelText('Contraseña');
    expect(passwordInput).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));

    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toBeInTheDocument();
  });
});
