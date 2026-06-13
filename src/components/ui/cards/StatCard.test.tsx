import { render, screen } from '@testing-library/react';
import { StatCard } from './StatCard';

describe('StatCard', () => {
  it('renders label and numeric value', () => {
    // Arrange & Act
    render(<StatCard label="Pacientes activos" value={42} icon={<span>groups</span>} />);

    // Assert
    expect(screen.getByText('Pacientes activos')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders string values', () => {
    render(<StatCard label="Promedio" value="8.5" icon={<span>star</span>} />);
    expect(screen.getByText('8.5')).toBeInTheDocument();
  });

  it('renders a badge when provided', () => {
    render(
      <StatCard
        label="Alertas"
        value={3}
        icon={<span>bell</span>}
        badge="+2 hoy"
        badgeVariant="warning"
      />
    );
    expect(screen.getByText('+2 hoy')).toBeInTheDocument();
  });

  it('does not render a badge by default', () => {
    const { container } = render(<StatCard label="Alertas" value={3} icon={<span>bell</span>} />);
    expect(container.querySelector('.rounded.text-xs')).not.toBeInTheDocument();
  });

  it('clones a valid element icon and enlarges its className', () => {
    render(<StatCard label="Citas" value={5} icon={<span className="ic">event</span>} />);
    const icon = screen.getByText('event');
    expect(icon.className).toContain('ic');
    expect(icon.className).toContain('!text-2xl');
  });

  it('renders non-element icons as-is', () => {
    render(<StatCard label="Citas" value={5} icon="texto-icono" />);
    expect(screen.getByText('texto-icono')).toBeInTheDocument();
  });

  it('applies custom iconBg and iconColor styles', () => {
    const { container } = render(
      <StatCard label="Citas" value={5} icon={<span>event</span>} iconBg="#ff0000" iconColor="#00ff00" />
    );
    const iconWrapper = container.querySelector('.rounded-xl');
    expect(iconWrapper).toHaveStyle({ backgroundColor: '#ff0000' });
  });

  it('appends custom className to the container', () => {
    const { container } = render(
      <StatCard label="Citas" value={5} icon={<span>event</span>} className="extra-class" />
    );
    expect(container.firstChild).toHaveClass('extra-class');
  });
});
