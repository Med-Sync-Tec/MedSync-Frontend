import { render, screen } from '@testing-library/react';
import { MatchTag } from './MatchTag';

describe('MatchTag', () => {
  it('renders the text', () => {
    render(<MatchTag text="5 coincidencias" />);
    expect(screen.getByText('5 coincidencias')).toBeInTheDocument();
  });

  it('uses the normal variant by default with a people icon', () => {
    render(<MatchTag text="5 coincidencias" />);
    expect(screen.getByText('people')).toBeInTheDocument();
    expect(screen.getByText('5 coincidencias')).toHaveClass('bg-blue-50', 'text-blue-700');
  });

  it('renders alert variant with a warning icon and red styles', () => {
    render(<MatchTag text="Interacción detectada" variant="alert" />);
    expect(screen.getByText('warning')).toBeInTheDocument();
    expect(screen.getByText('Interacción detectada')).toHaveClass('bg-red-50', 'text-red-700');
  });

  it('does not render the warning icon in normal variant', () => {
    render(<MatchTag text="5 coincidencias" variant="normal" />);
    expect(screen.queryByText('warning')).not.toBeInTheDocument();
  });

  it('appends a custom className', () => {
    render(<MatchTag text="5" className="extra-class" />);
    expect(screen.getByText('5')).toHaveClass('extra-class');
  });
});
