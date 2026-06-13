/**
 * Flujo 3 — Doctor: lista de pacientes y navegación al historial.
 * Con sesión de DOCTOR simulada y GET /api/patients stubbeado con un fixture,
 * verifica que la lista se renderiza y que al hacer clic en un paciente se
 * navega a su historial de consultas.
 */
describe('Doctor — lista de pacientes', () => {
  beforeEach(() => {
    // Catch-all para sub-recursos del paciente (consultas, contextos, …).
    cy.intercept('GET', '**/api/patients/p1/**', { statusCode: 200, body: [] });
    cy.fixture('patients.json').then((patients: unknown[]) => {
      cy.intercept('GET', '**/api/patients/p1', { statusCode: 200, body: patients[0] });
    });
    cy.intercept('GET', '**/api/patients', { fixture: 'patients.json' }).as('listPatients');
  });

  it('muestra los pacientes que devuelve la API', () => {
    cy.visitAs('/doctor/patients', 'DOCTOR');
    cy.wait('@listPatients');

    cy.contains('h1', 'Gestión de pacientes').should('be.visible');
    cy.contains('2 pacientes registrados').should('be.visible');
    cy.contains('Juan Pérez García').should('be.visible');
    cy.contains('María López Hernández').should('be.visible');
  });

  it('navega al historial del paciente al hacer clic en su tarjeta', () => {
    cy.visitAs('/doctor/patients', 'DOCTOR');
    cy.wait('@listPatients');

    cy.contains('button', 'Juan Pérez García').click();

    cy.location('pathname').should('eq', '/patients/p1/history');
  });

  it('muestra el estado vacío cuando no hay pacientes', () => {
    cy.intercept('GET', '**/api/patients', { statusCode: 200, body: [] }).as('emptyPatients');
    cy.visitAs('/doctor/patients', 'DOCTOR');
    cy.wait('@emptyPatients');

    cy.contains('Aún no tienes pacientes').should('be.visible');
  });
});
