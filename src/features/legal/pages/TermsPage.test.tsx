import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TermsPage } from './TermsPage';

function renderTermsPage() {
  return render(
    <MemoryRouter>
      <TermsPage />
    </MemoryRouter>,
  );
}

describe('TermsPage', () => {
  it('sets the document title', () => {
    renderTermsPage();

    expect(document.title).toBe('Términos y Condiciones — MedSync');
  });

  it('renders the main heading and eyebrow', () => {
    renderTermsPage();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Términos y Condiciones' }),
    ).toBeInTheDocument();
    expect(screen.getByText('TÉRMINOS DEL SERVICIO')).toBeInTheDocument();
    expect(screen.getByText('Última actualización: 27 de mayo de 2026')).toBeInTheDocument();
  });

  it('renders every numbered section heading', () => {
    renderTermsPage();

    const expectedSections = [
      '1. Naturaleza del servicio',
      '2. Cuentas y acceso',
      '3. Uso aceptable',
      '4. Datos del paciente y base del hospital',
      '5. Inteligencia artificial',
      '6. Disponibilidad',
      '7. Propiedad intelectual',
      '8. Limitación de responsabilidad',
      '9. Ley aplicable',
      '10. Contacto',
    ];
    for (const title of expectedSections) {
      expect(screen.getByRole('heading', { level: 2, name: title })).toBeInTheDocument();
    }
  });

  it('links to the privacy notice', () => {
    renderTermsPage();

    expect(screen.getByRole('link', { name: 'Aviso de Privacidad' })).toHaveAttribute(
      'href',
      '/privacidad',
    );
  });
});
