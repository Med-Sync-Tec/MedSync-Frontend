/**
 * Flujo 2 — Protección de rutas.
 * Verifica los guards de routing: RequireAuth (rutas privadas exigen sesión)
 * y RedirectIfAuth (usuarios logueados no ven el login). La sesión se simula
 * con cy.visitAs (seed de localStorage) y la API se stubbea.
 */
describe('Protección de rutas', () => {
  beforeEach(() => {
    // Catch-all: cualquier llamada al backend responde vacío para que las
    // páginas privadas no dependan de un backend real.
    cy.intercept('GET', '**/api/**', { statusCode: 200, body: [] });
    cy.intercept('GET', '**/api/v1/dashboard/kpis', {
      statusCode: 200,
      body: { novedades_48h: [], no_leidos: [], por_especialidad: [], alta_evidencia: [] },
    });
  });

  it('redirige al login al visitar una ruta privada sin sesión', () => {
    cy.visit('/doctor/dashboard');

    cy.location('pathname').should('eq', '/');
    cy.get('#email').should('be.visible');
  });

  it('permite entrar al dashboard con sesión de DOCTOR', () => {
    cy.visitAs('/doctor/dashboard', 'DOCTOR');

    cy.location('pathname').should('eq', '/doctor/dashboard');
    cy.get('button[aria-label^="Menú de usuario"]').should('contain.text', 'Dra. Prueba E2E');
  });

  it('redirige del login al dashboard si ya hay sesión activa', () => {
    cy.visitAs('/', 'DOCTOR');

    cy.location('pathname').should('eq', '/doctor/dashboard');
  });

  it('protege también las rutas de COO', () => {
    cy.visit('/coo/dashboard');

    cy.location('pathname').should('eq', '/');
  });
});
