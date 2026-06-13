
jest.mock('./api', () => ({
  signOutCurrentUser: jest.fn(),
}));

import { signOutCurrentUser } from './api';
import { useAuthStore } from './store';
import type { AuthUser } from './schemas';

const mockSignOut = jest.mocked(signOutCurrentUser);

const DOCTOR_USER: AuthUser = {
  id: 'user-1',
  email: 'doctor@clinica.com',
  name: 'Dra. Ana López',
  role: 'DOCTOR',
  especialidadId: null,
};

const STORAGE_KEY = 'medsync-auth';

function readPersistedState(): { user: AuthUser | null; isAuthenticated: boolean } | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  return JSON.parse(raw).state;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockSignOut.mockResolvedValue(undefined);
  localStorage.clear();
  useAuthStore.setState({ user: null, isAuthenticated: false });
});

describe('useAuthStore', () => {
  it('starts logged out', () => {
    const state = useAuthStore.getState();

    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('login stores the user and marks the session as authenticated', () => {
    useAuthStore.getState().login(DOCTOR_USER);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(DOCTOR_USER);
    expect(state.isAuthenticated).toBe(true);
  });

  it('login persists user and isAuthenticated to localStorage under medsync-auth', () => {
    useAuthStore.getState().login(DOCTOR_USER);

    const persisted = readPersistedState();
    expect(persisted).toEqual({ user: DOCTOR_USER, isAuthenticated: true });
  });

  it('logout signs out from Firebase and clears the session', async () => {
    useAuthStore.getState().login(DOCTOR_USER);

    await useAuthStore.getState().logout();

    expect(mockSignOut).toHaveBeenCalledTimes(1);
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('logout clears the persisted session in localStorage', async () => {
    useAuthStore.getState().login(DOCTOR_USER);

    await useAuthStore.getState().logout();

    expect(readPersistedState()).toEqual({ user: null, isAuthenticated: false });
  });

  it('logout keeps the session intact when the Firebase sign-out fails', async () => {
    useAuthStore.getState().login(DOCTOR_USER);
    mockSignOut.mockRejectedValue(new Error('network down'));

    await expect(useAuthStore.getState().logout()).rejects.toThrow('network down');

    const state = useAuthStore.getState();
    expect(state.user).toEqual(DOCTOR_USER);
    expect(state.isAuthenticated).toBe(true);
  });

  it('login replaces a previously logged-in user', () => {
    const cooUser: AuthUser = {
      id: 'user-2',
      email: 'coo@clinica.com',
      name: 'Carlos Ortiz',
      role: 'COO',
      especialidadId: null,
    };
    useAuthStore.getState().login(DOCTOR_USER);

    useAuthStore.getState().login(cooUser);

    expect(useAuthStore.getState().user).toEqual(cooUser);
  });
});
