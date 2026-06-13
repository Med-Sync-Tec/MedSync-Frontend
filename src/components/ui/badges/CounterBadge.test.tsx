import { render, screen } from '@testing-library/react';
import { CounterBadge } from './CounterBadge';

describe('CounterBadge', () => {
  it('renders the text', () => {
    render(<CounterBadge text="3 nuevos" />);
    expect(screen.getByText('3 nuevos')).toBeInTheDocument();
  });

  it('uses the info variant by default', () => {
    render(<CounterBadge text="3 nuevos" />);
    expect(screen.getByText('3 nuevos')).toHaveClass('bg-blue-100', 'text-blue-700');
  });

  it('applies warning variant styles', () => {
    render(<CounterBadge text="2 pendientes" variant="warning" />);
    expect(screen.getByText('2 pendientes')).toHaveClass('bg-orange-100', 'text-orange-700');
  });

  it('applies success variant styles', () => {
    render(<CounterBadge text="Listo" variant="success" />);
    expect(screen.getByText('Listo')).toHaveClass('bg-green-100', 'text-green-700');
  });

  it('appends a custom className', () => {
    render(<CounterBadge text="3" className="extra-class" />);
    expect(screen.getByText('3')).toHaveClass('extra-class');
  });
});
