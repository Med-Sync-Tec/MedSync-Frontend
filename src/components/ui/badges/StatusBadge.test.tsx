import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('renders "Estable" with green styles', () => {
    render(<StatusBadge status="estable" />);
    expect(screen.getByText('Estable')).toHaveClass('bg-green-100', 'text-green-700');
  });

  it('renders "Crítico" with red styles', () => {
    render(<StatusBadge status="critico" />);
    expect(screen.getByText('Crítico')).toHaveClass('bg-red-100', 'text-red-700');
  });

  it('renders "En Observación" with orange styles', () => {
    render(<StatusBadge status="en-observacion" />);
    expect(screen.getByText('En Observación')).toHaveClass('bg-orange-100', 'text-orange-700');
  });

  it('renders "Alta" with blue styles', () => {
    render(<StatusBadge status="alta" />);
    expect(screen.getByText('Alta')).toHaveClass('bg-blue-100', 'text-blue-700');
  });

  it('appends a custom className', () => {
    render(<StatusBadge status="estable" className="extra-class" />);
    expect(screen.getByText('Estable')).toHaveClass('extra-class');
  });
});
