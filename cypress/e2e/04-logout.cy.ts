/**
 * Flujo 4 — Logout.
 * Con sesión activa, cerrar sesión desde el menú del header regresa al login
 * y las rutas privadas vuelven a quedar bloqueadas.
 */
describe('Logout', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/**', { statusCode: 200, body: [] });
    cy.intercept('GET', '**/api/patients', { fixture: 'patients.json' }).as('listPatients');
  });

  it('cierra la sesión desde el menú del header y bloquea rutas privadas', () => {
    cy.visitAs('/doctor/patients', 'DOCTOR');
    cy.wait('@listPatients');

    cy.get('button[aria-label^="Menú de usuario"]').click();
    cy.contains('button', 'Cerrar sesión').click();

    // RequireAuth detecta la sesión cerrada y redirige al login.
    cy.location('pathname').should('eq', '/');
    cy.get('#email').should('be.visible');

    // El estado persistido quedó sin sesión: las rutas privadas rebotan.
    cy.visit('/doctor/patients');
    cy.location('pathname').should('eq', '/');
  });
});
