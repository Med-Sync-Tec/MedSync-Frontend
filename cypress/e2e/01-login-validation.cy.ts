/**
 * Flujo 1 — Login: validación del formulario.
 * Cubre la validación client-side de Zod (LoginCredentialsSchema) sin tocar
 * Firebase ni el backend: ningún request sale porque la validación corta antes.
 */
describe('Login — validación del formulario', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('muestra errores en ambos campos al enviar vacío', () => {
    cy.contains('button', 'Iniciar sesión').click();

    cy.contains('p', 'Este campo es obligatorio').should('be.visible');
    cy.get('#email').should('have.attr', 'aria-invalid', 'true');
    cy.get('#password').should('have.attr', 'aria-invalid', 'true');
  });

  it('rechaza un correo con formato inválido', () => {
    cy.get('#email').type('correo-invalido');
    cy.get('#password').type('secreta123');
    cy.contains('button', 'Iniciar sesión').click();

    cy.contains('Formato de correo inválido').should('be.visible');
    cy.get('#email').should('have.attr', 'aria-invalid', 'true');
    cy.get('#password').should('have.attr', 'aria-invalid', 'false');
  });

  it('limpia el error del campo al volver a escribir', () => {
    cy.contains('button', 'Iniciar sesión').click();
    cy.get('#email').should('have.attr', 'aria-invalid', 'true');

    cy.get('#email').type('doctor@clinica.com');

    cy.get('#email').should('have.attr', 'aria-invalid', 'false');
  });

  it('permite mostrar y ocultar la contraseña', () => {
    cy.get('#password').type('secreta123').should('have.attr', 'type', 'password');

    cy.get('button[aria-label="Mostrar contraseña"]').click();
    cy.get('#password').should('have.attr', 'type', 'text');

    cy.get('button[aria-label="Ocultar contraseña"]').click();
    cy.get('#password').should('have.attr', 'type', 'password');
  });
});
