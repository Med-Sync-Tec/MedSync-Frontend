import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LegalPageShell, LegalSection } from './LegalPageShell';

function renderShell() {
  return render(
    <MemoryRouter>
      <LegalPageShell
        eyebrow="DOCUMENTO LEGAL"
        title="Título de prueba"
        lastUpdated="1 de enero de 2026"
      >
        <p>Contenido del documento</p>
        <LegalSection title="1. Primera sección">
          <p>Texto de la sección</p>
        </LegalSection>
      </LegalPageShell>
    </MemoryRouter>,
  );
}

describe('LegalPageShell', () => {
  it('renders the eyebrow, title and last-updated date', () => {
    renderShell();

    expect(screen.getByText('DOCUMENTO LEGAL')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Título de prueba' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Última actualización: 1 de enero de 2026')).toBeInTheDocument();
  });

  it('renders the children content', () => {
    renderShell();

    expect(screen.getByText('Contenido del documento')).toBeInTheDocument();
  });

  it('links back to the home page from the header', () => {
    renderShell();

    expect(screen.getByRole('link', { name: 'MedSync — Inicio' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: '← Volver al inicio' })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it('shows the footer with the current year and legal links', () => {
    renderShell();

    const year = new Date().getFullYear();
    expect(
      screen.getByText(`© ${year} MedSync. Todos los derechos reservados.`),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Privacidad' })).toHaveAttribute(
      'href',
      '/privacidad',
    );
    expect(screen.getByRole('link', { name: 'Términos' })).toHaveAttribute('href', '/terminos');
  });
});

describe('LegalSection', () => {
  it('renders the section heading as an h2 with its content', () => {
    render(
      <LegalSection title="Sección aislada">
        <p>Cuerpo de la sección</p>
      </LegalSection>,
    );

    expect(
      screen.getByRole('heading', { level: 2, name: 'Sección aislada' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Cuerpo de la sección')).toBeInTheDocument();
  });
});
