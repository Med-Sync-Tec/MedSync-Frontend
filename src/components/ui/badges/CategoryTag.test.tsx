import { render, screen } from '@testing-library/react';
import { CategoryTag } from './CategoryTag';

describe('CategoryTag', () => {
  it('renders the label text', () => {
    render(<CategoryTag label="Cardiología" />);
    expect(screen.getByText('Cardiología')).toBeInTheDocument();
  });

  it('uses the default (gray) styles when no category is given', () => {
    render(<CategoryTag label="General" />);
    expect(screen.getByText('General')).toHaveClass('bg-gray-100', 'text-gray-700');
  });

  it('applies cardiologia category styles', () => {
    render(<CategoryTag label="Cardio" category="cardiologia" />);
    expect(screen.getByText('Cardio')).toHaveClass('bg-red-100', 'text-red-700');
  });

  it('applies farmacologia category styles', () => {
    render(<CategoryTag label="Farma" category="farmacologia" />);
    expect(screen.getByText('Farma')).toHaveClass('bg-purple-100', 'text-purple-700');
  });

  it('applies endocrinologia category styles', () => {
    render(<CategoryTag label="Endo" category="endocrinologia" />);
    expect(screen.getByText('Endo')).toHaveClass('bg-orange-100', 'text-orange-700');
  });

  it('applies infecciosas category styles', () => {
    render(<CategoryTag label="Infecto" category="infecciosas" />);
    expect(screen.getByText('Infecto')).toHaveClass('bg-teal-100', 'text-teal-700');
  });

  it('applies neurologia category styles', () => {
    render(<CategoryTag label="Neuro" category="neurologia" />);
    expect(screen.getByText('Neuro')).toHaveClass('bg-indigo-100', 'text-indigo-700');
  });

  it('appends a custom className', () => {
    render(<CategoryTag label="General" className="extra-class" />);
    expect(screen.getByText('General')).toHaveClass('extra-class');
  });
});
