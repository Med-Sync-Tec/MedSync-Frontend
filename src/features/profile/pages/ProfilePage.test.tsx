import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

jest.mock('@features/auth/api', () => ({
  updateUserPassword: jest.fn(),
  signOutCurrentUser: jest.fn(),
  signInWithEmail: jest.fn(),
  fetchMe: jest.fn(),
}));

jest.mock('@features/matching/queries', () => ({
  useEspecialidades: jest.fn(),
}));

import { updateUserPassword } from '@features/auth/api';
import { useEspecialidades } from '@features/matching/queries';
import { useAuthStore } from '@features/auth/store';
import type { AuthUser } from '@features/auth/schemas';
import { ProfilePage } from './ProfilePage';

const mockUpdatePassword = jest.mocked(updateUserPassword);
const mockUseEspecialidades = jest.mocked(useEspecialidades);

const DOCTOR_USER: AuthUser = {
  id: 'user-1',
  email: 'ana@clinica.com',
  name: 'Ana López',
  role: 'DOCTOR',
  especialidadId: 'esp-cardio',
};

const ESPECIALIDADES_BY_ID = new Map([
  ['esp-cardio', { id: 'esp-cardio', nombre: 'Cardiología', slug: 'cardiologia' }],
]);

function mockEspecialidades(byId: Map<string, unknown> = ESPECIALIDADES_BY_ID) {
  mockUseEspecialidades.mockReturnValue({ byId } as unknown as ReturnType<
    typeof useEspecialidades
  >);
}

function renderProfilePage(user: AuthUser | null = DOCTOR_USER) {
  useAuthStore.setState({ user, isAuthenticated: Boolean(user) });
  return render(
    <MemoryRouter>
      <ProfilePage />
    </MemoryRouter>,
  );
}

async function fillPasswordForm(current: string, next: string, confirm: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Contraseña actual'), current);
  await user.type(screen.getByLabelText('Nueva contraseña'), next);
  await user.type(screen.getByLabelText('Confirmar contraseña'), confirm);
  await user.click(screen.getByRole('button', { name: /actualizar contraseña/i }));
  return user;
}

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  mockEspecialidades();
});

afterEach(() => {
  useAuthStore.setState({ user: null, isAuthenticated: false });
});

describe('ProfilePage', () => {
  it('renders nothing when there is no authenticated user', () => {
    const { container } = renderProfilePage(null);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows the profile data of a doctor: name, email, role and initials', () => {
    renderProfilePage();

    expect(screen.getByRole('heading', { name: /mi perfil/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ana López' })).toBeInTheDocument();
    expect(screen.getByText('ana@clinica.com')).toBeInTheDocument();
    expect(screen.getByText('Doctor')).toBeInTheDocument();
    expect(screen.getByText('AL')).toBeInTheDocument();
  });

  it('shows the specialty badge for a doctor with an assigned specialty', () => {
    renderProfilePage();

    expect(screen.getByText('Cardiología')).toBeInTheDocument();
  });

  it('does not show a specialty badge when the doctor has none assigned', () => {
    renderProfilePage({ ...DOCTOR_USER, especialidadId: null });

    expect(screen.queryByText('Cardiología')).not.toBeInTheDocument();
    expect(screen.queryByText('Sin especialidad')).not.toBeInTheDocument();
  });

  it('shows the administration role for non-doctor users without specialty badge', () => {
    renderProfilePage({ ...DOCTOR_USER, role: 'COO', name: 'Carlos Ortiz' });

    expect(screen.getByText('Administración')).toBeInTheDocument();
    expect(screen.queryByText('Cardiología')).not.toBeInTheDocument();
  });

  it('disables the submit button until all three password fields are filled', async () => {
    const user = userEvent.setup();
    renderProfilePage();
    const submit = screen.getByRole('button', { name: /actualizar contraseña/i });
    expect(submit).toBeDisabled();

    await user.type(screen.getByLabelText('Contraseña actual'), 'actual123');
    await user.type(screen.getByLabelText('Nueva contraseña'), 'nueva123');
    expect(submit).toBeDisabled();

    await user.type(screen.getByLabelText('Confirmar contraseña'), 'nueva123');
    expect(submit).toBeEnabled();
  });

  it('shows an error when the new passwords do not match and skips the API call', async () => {
    renderProfilePage();

    await fillPasswordForm('actual123', 'nueva123', 'otra456');

    expect(screen.getByText('Las nuevas contraseñas no coinciden.')).toBeInTheDocument();
    expect(mockUpdatePassword).not.toHaveBeenCalled();
  });

  it('shows an error when the new password is shorter than 6 characters', async () => {
    renderProfilePage();

    await fillPasswordForm('actual123', 'abc', 'abc');

    expect(
      screen.getByText('La contraseña debe tener al menos 6 caracteres.'),
    ).toBeInTheDocument();
    expect(mockUpdatePassword).not.toHaveBeenCalled();
  });

  it('updates the password, shows the success message and clears the fields', async () => {
    mockUpdatePassword.mockResolvedValue(undefined);
    renderProfilePage();

    await fillPasswordForm('actual123', 'nueva123', 'nueva123');

    expect(mockUpdatePassword).toHaveBeenCalledWith('actual123', 'nueva123');
    expect(
      await screen.findByText('Contraseña actualizada correctamente.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña actual')).toHaveValue('');
    expect(screen.getByLabelText('Nueva contraseña')).toHaveValue('');
    expect(screen.getByLabelText('Confirmar contraseña')).toHaveValue('');
  });

  it('shows the wrong-current-password message for auth/invalid-credential errors', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockUpdatePassword.mockRejectedValue(
      Object.assign(new Error('invalid'), { code: 'auth/invalid-credential' }),
    );
    renderProfilePage();

    await fillPasswordForm('incorrecta', 'nueva123', 'nueva123');

    expect(
      await screen.findByText('La contraseña actual es incorrecta.'),
    ).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it('shows a generic error message for unknown failures', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockUpdatePassword.mockRejectedValue(new Error('network down'));
    renderProfilePage();

    await fillPasswordForm('actual123', 'nueva123', 'nueva123');

    expect(
      await screen.findByText(
        'Ocurrió un error al actualizar la contraseña. Revisa que tu contraseña actual sea correcta.',
      ),
    ).toBeInTheDocument();
    consoleSpy.mockRestore();
  });
});
