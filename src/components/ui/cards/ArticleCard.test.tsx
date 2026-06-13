import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Heart } from 'lucide-react';
import { ArticleCard } from './ArticleCard';
import type { SpecialtyVisual } from '@features/matching/specialtyVisuals';

const baseProps = {
  category: 'Cardiología',
  timestamp: 'hace 2 h',
  title: 'Nuevas guías de hipertensión',
  excerpt: 'Resumen del estudio sobre presión arterial.',
  source: 'The Lancet',
};

const cardiologiaVisual: SpecialtyVisual = {
  key: 'cardiologia',
  name: 'Cardiología Visual',
  Icon: Heart,
  sidebar: 'bg-rose-600',
  badgeBg: 'bg-rose-50',
  badgeText: 'text-rose-700',
  badgeBorder: 'border-rose-200',
  dot: 'bg-rose-500',
};

describe('ArticleCard', () => {
  it('renders title, excerpt, source, category and timestamp in full variant', () => {
    // Arrange & Act
    render(<ArticleCard {...baseProps} />);

    // Assert
    expect(screen.getByText('Nuevas guías de hipertensión')).toBeInTheDocument();
    expect(screen.getByText('Resumen del estudio sobre presión arterial.')).toBeInTheDocument();
    expect(screen.getByText('The Lancet')).toBeInTheDocument();
    expect(screen.getByText('Cardiología')).toBeInTheDocument();
    expect(screen.getByText('hace 2 h')).toBeInTheDocument();
  });

  it('shows the save label when not saved', () => {
    render(<ArticleCard {...baseProps} />);
    expect(screen.getByRole('button', { name: 'Guardar artículo' })).toBeInTheDocument();
  });

  it('shows the unsave label when saved', () => {
    render(<ArticleCard {...baseProps} saved />);
    expect(screen.getByRole('button', { name: 'Quitar de guardados' })).toBeInTheDocument();
  });

  it('calls onSave when the bookmark is clicked', async () => {
    const onSave = jest.fn();
    render(<ArticleCard {...baseProps} onSave={onSave} />);

    await userEvent.click(screen.getByRole('button', { name: 'Guardar artículo' }));

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('stops click propagation to the parent when saving', async () => {
    const onParentClick = jest.fn();
    render(
      <div onClick={onParentClick}> {/* NOSONAR */}
        <ArticleCard {...baseProps} onSave={jest.fn()} />
      </div>
    );

    await userEvent.click(screen.getByRole('button', { name: 'Guardar artículo' }));

    expect(onParentClick).not.toHaveBeenCalled();
  });

  it('renders the match tag when matchText is provided', () => {
    render(<ArticleCard {...baseProps} matchText="3 pacientes" />);
    expect(screen.getByText('3 pacientes')).toBeInTheDocument();
  });

  it('does not render a match tag by default', () => {
    render(<ArticleCard {...baseProps} />);
    expect(screen.queryByText(/pacientes/)).not.toBeInTheDocument();
  });

  it('renders extraActions in the full variant footer', () => {
    render(<ArticleCard {...baseProps} extraActions={<button type="button">Analizar con IA</button>} />);
    expect(screen.getByRole('button', { name: 'Analizar con IA' })).toBeInTheDocument();
  });

  it('renders compact variant with title and source but without excerpt', () => {
    render(<ArticleCard {...baseProps} variant="compact" />);

    expect(screen.getByText('Nuevas guías de hipertensión')).toBeInTheDocument();
    expect(screen.getByText('The Lancet')).toBeInTheDocument();
    expect(
      screen.queryByText('Resumen del estudio sobre presión arterial.')
    ).not.toBeInTheDocument();
  });

  it('supports saving from the compact variant', async () => {
    const onSave = jest.fn();
    render(<ArticleCard {...baseProps} variant="compact" onSave={onSave} />);

    await userEvent.click(screen.getByRole('button', { name: 'Guardar artículo' }));

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('replaces the category tag with the specialty badge when specialtyVisual is provided', () => {
    render(<ArticleCard {...baseProps} specialtyVisual={cardiologiaVisual} />);

    expect(screen.getByText('Cardiología Visual')).toBeInTheDocument();
    expect(screen.queryByText('Cardiología')).not.toBeInTheDocument();
  });

  it('uses the categoryType sidebar icon when no specialtyVisual is given', () => {
    render(<ArticleCard {...baseProps} categoryType="farmacologia" />);
    expect(screen.getByText('medication')).toBeInTheDocument();
  });

  it('appends custom className to the container', () => {
    const { container } = render(<ArticleCard {...baseProps} className="extra-class" />);
    expect(container.firstChild).toHaveClass('extra-class');
  });
});
