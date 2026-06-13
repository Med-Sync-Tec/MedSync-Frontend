import { render, screen } from '@testing-library/react';
import { SOAPSection } from './SOAPSection';

describe('SOAPSection', () => {
  it('renders the letter chip and title', () => {
    // Arrange & Act
    render(
      <SOAPSection letter="S" title="Subjetivo">
        <p>Contenido subjetivo</p>
      </SOAPSection>
    );

    // Assert
    expect(screen.getByText('S')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Subjetivo' })).toBeInTheDocument();
  });

  it('renders the children content', () => {
    render(
      <SOAPSection letter="O" title="Objetivo">
        <p>Signos vitales estables</p>
      </SOAPSection>
    );
    expect(screen.getByText('Signos vitales estables')).toBeInTheDocument();
  });

  it('renders the subtitle when provided', () => {
    render(
      <SOAPSection letter="A" title="Análisis" subtitle="Evaluación clínica">
        <p>contenido</p>
      </SOAPSection>
    );
    expect(screen.getByText('Evaluación clínica')).toBeInTheDocument();
  });

  it('does not render a subtitle by default', () => {
    render(
      <SOAPSection letter="A" title="Análisis">
        <p>contenido</p>
      </SOAPSection>
    );
    expect(screen.queryByText('Evaluación clínica')).not.toBeInTheDocument();
  });

  it('renders the headerAction slot', () => {
    render(
      <SOAPSection letter="P" title="Plan" headerAction={<button type="button">Editar</button>}>
        <p>contenido</p>
      </SOAPSection>
    );
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument();
  });

  it.each(['S', 'O', 'A', 'P'] as const)('renders the %s variant chip', (letter) => {
    render(
      <SOAPSection letter={letter} title="Título">
        <p>contenido</p>
      </SOAPSection>
    );
    expect(screen.getByText(letter)).toBeInTheDocument();
  });

  it('appends custom className to the container', () => {
    const { container } = render(
      <SOAPSection letter="S" title="Subjetivo" className="extra-class">
        <p>contenido</p>
      </SOAPSection>
    );
    expect(container.firstChild).toHaveClass('extra-class');
  });
});
