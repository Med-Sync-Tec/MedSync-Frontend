import { render, screen } from '@testing-library/react';
import { SOAPLetterBadge } from './SOAPLetterBadge';

describe('SOAPLetterBadge', () => {
  it('renders the section letter and the provided title', () => {
    render(<SOAPLetterBadge section="S" title="Lo que dice el paciente" />);
    expect(screen.getByText('S')).toBeInTheDocument();
    expect(screen.getByText('Lo que dice el paciente')).toBeInTheDocument();
  });

  it('falls back to the default title when title is empty', () => {
    render(<SOAPLetterBadge section="A" title="" />);
    expect(screen.getByText('Análisis')).toBeInTheDocument();
  });

  it('falls back to "Subjetivo" for section S with empty title', () => {
    render(<SOAPLetterBadge section="S" title="" />);
    expect(screen.getByText('Subjetivo')).toBeInTheDocument();
  });

  it('falls back to "Objetivo" for section O with empty title', () => {
    render(<SOAPLetterBadge section="O" title="" />);
    expect(screen.getByText('Objetivo')).toBeInTheDocument();
  });

  it('falls back to "Plan" for section P with empty title', () => {
    render(<SOAPLetterBadge section="P" title="" />);
    expect(screen.getByText('Plan')).toBeInTheDocument();
  });

  it.each([
    ['S', 'text-blue-600'],
    ['O', 'text-teal-600'],
    ['A', 'text-purple-600'],
    ['P', 'text-green-600'],
  ] as const)('colors the %s letter with %s', (section, colorClass) => {
    render(<SOAPLetterBadge section={section} title="Título" />);
    expect(screen.getByText(section)).toHaveClass(colorClass);
  });

  it('appends a custom className to the wrapper', () => {
    const { container } = render(
      <SOAPLetterBadge section="S" title="Título" className="extra-class" />
    );
    expect(container.firstChild).toHaveClass('extra-class');
  });
});
