import type { AuthUser, UserRole } from '../../src/features/auth/schemas';

const AUTH_STORAGE_KEY = 'medsync-auth';

const SESSION_BY_ROLE: Record<Extract<UserRole, 'DOCTOR' | 'COO'>, AuthUser> = {
  DOCTOR: {
    id: 'e2e-doctor-1',
    email: 'doctor.e2e@medsync.test',
    name: 'Dra. Prueba E2E',
    role: 'DOCTOR',
    especialidadId: null,
  },
  COO: {
    id: 'e2e-coo-1',
    email: 'coo.e2e@medsync.test',
    name: 'COO Prueba E2E',
    role: 'COO',
    especialidadId: null,
  },
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Visita una ruta con una sesión simulada: seedea el storage de Zustand
       * (`medsync-auth`) antes de que la app cargue, que es lo que lee
       * `RequireAuth`. No toca Firebase ni el backend.
       */
      visitAs(path: string, role?: 'DOCTOR' | 'COO'): Chainable<Cypress.AUTWindow>;
    }
  }
}

Cypress.Commands.add('visitAs', (path: string, role: 'DOCTOR' | 'COO' = 'DOCTOR') => {
  const persisted = {
    state: { user: SESSION_BY_ROLE[role], isAuthenticated: true },
    version: 0,
  };
  return cy.visit(path, {
    onBeforeLoad(win) {
      win.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(persisted));
    },
  });
});

export {};
