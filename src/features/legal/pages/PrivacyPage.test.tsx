import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PrivacyPage } from './PrivacyPage';

function renderPrivacyPage() {
  return render(
    <MemoryRouter>
      <PrivacyPage />
    </MemoryRouter>,
  );
}

describe('PrivacyPage', () => {
  it('sets the document title', () => {
    renderPrivacyPage();

    expect(document.title).toBe('Aviso de Privacidad — MedSync');
  });

  it('renders the main heading and eyebrow', () => {
    renderPrivacyPage();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Aviso de Privacidad' }),
    ).toBeInTheDocument();
    expect(screen.getByText('POLÍTICA DE PRIVACIDAD')).toBeInTheDocument();
    expect(screen.getByText('Última actualización: 27 de mayo de 2026')).toBeInTheDocument();
  });

  it('renders every numbered section heading', () => {
    renderPrivacyPage();

    const expectedSections = [
      '1. Naturaleza del proyecto',
      '2. Arquitectura de datos: dos bases separadas',
      '3. Datos que MedSync sí almacena directamente',
      '4. Uso de la información',
      '5. Proveedores tecnológicos',
      '6. Acceso y autenticación',
      '7. Derechos sobre los datos del paciente',
      '8. Conservación',
      '9. Cambios al aviso',
    ];
    for (const title of expectedSections) {
      expect(screen.getByRole('heading', { level: 2, name: title })).toBeInTheDocument();
    }
  });

  it('mentions the third-party providers it relies on', () => {
    renderPrivacyPage();

    expect(screen.getByText('Firebase Authentication')).toBeInTheDocument();
    expect(screen.getByText('Google Cloud Platform')).toBeInTheDocument();
    expect(screen.getByText('Groq Cloud')).toBeInTheDocument();
    expect(screen.getByText('NCBI E-utilities (PubMed)')).toBeInTheDocument();
  });
});
