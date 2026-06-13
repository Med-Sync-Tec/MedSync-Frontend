/**
 * Flujo 5 — Páginas públicas y 404.
 * Las páginas legales cargan sin sesión y cualquier ruta inexistente cae en
 * la página 404. No requiere stubs: estas rutas no llaman al backend.
 */
describe('Páginas públicas y 404', () => {
  it('carga el aviso de privacidad', () => {
    cy.visit('/privacidad');

    cy.contains('Aviso de Privacidad').should('be.visible');
    cy.title().should('include', 'Aviso de Privacidad');
  });

  it('carga los términos y condiciones', () => {
    cy.visit('/terminos');

    cy.contains('Términos y Condiciones').should('be.visible');
  });

  it('redirige rutas inexistentes a /404', () => {
    cy.visit('/esta-ruta-no-existe');

    cy.location('pathname').should('eq', '/404');
    cy.contains('h1', '404').should('be.visible');
    cy.contains('Página no encontrada').should('be.visible');
  });
});
