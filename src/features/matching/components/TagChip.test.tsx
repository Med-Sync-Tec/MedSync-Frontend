import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagChip } from './TagChip';
import { TIPO_PALETTES } from '../palette';

describe('TagChip', () => {
  it('renders a non-interactive span when onClick is absent', () => {
    const { container } = render(
      <TagChip tipo="enfermedad" valor="diabetes" matched={false} />,
    );

    expect(screen.getByText('diabetes')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(container.firstElementChild?.tagName).toBe('SPAN');
  });

  it('renders a button and fires onClick when provided', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(
      <TagChip
        tipo="sintoma"
        valor="tos"
        matched={false}
        onClick={onClick}
        ariaLabel="Filtrar por tos"
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Filtrar por tos' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('uses the muted palette when not matched', () => {
    const { container } = render(
      <TagChip tipo="enfermedad" valor="diabetes" matched={false} />,
    );

    expect(container.firstElementChild?.className).toContain('bg-rose-50');
  });

  it('uses the active palette when matched', () => {
    const { container } = render(
      <TagChip tipo="enfermedad" valor="diabetes" matched={true} />,
    );

    expect(container.firstElementChild?.className).toContain('bg-rose-600');
  });

  it('prepends a link icon only in the matched state', () => {
    const matched = render(
      <TagChip tipo="medicamento" valor="metformina" matched={true} />,
    );
    const unmatched = render(
      <TagChip tipo="medicamento" valor="metformina" matched={false} />,
    );

    expect(matched.container.querySelectorAll('svg').length).toBe(1);
    expect(unmatched.container.querySelectorAll('svg').length).toBe(0);
  });

  it('forceMuted keeps the muted palette and dims the chip even when matched', () => {
    const { container } = render(
      <TagChip tipo="tratamiento" valor="dieta" matched={true} forceMuted />,
    );
    const className = container.firstElementChild?.className ?? '';

    expect(className).toContain(TIPO_PALETTES.tratamiento.muted);
    expect(className).not.toContain('bg-sky-600');
    expect(className).toContain('opacity-60');
  });

  it('shows the count badge with its Spanish aria-label when count > 0', () => {
    render(<TagChip tipo="enfermedad" valor="diabetes" matched={false} count={3} />);

    expect(
      screen.getByLabelText('Aparece en 3 artículos relevantes'),
    ).toHaveTextContent('3');
  });

  it('hides the count badge when count is 0', () => {
    render(<TagChip tipo="enfermedad" valor="diabetes" matched={false} count={0} />);

    expect(
      screen.queryByLabelText('Aparece en 0 artículos relevantes'),
    ).not.toBeInTheDocument();
  });

  it('marks the selected state with aria-pressed and a ring', () => {
    const { container } = render(
      <TagChip
        tipo="enfermedad"
        valor="diabetes"
        matched={false}
        selected
        onClick={() => {}}
      />,
    );

    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    expect(container.firstElementChild?.className).toContain('ring-2');
  });

  it('defaults the title to valor and accepts an override', () => {
    const { rerender } = render(
      <TagChip tipo="enfermedad" valor="diabetes" matched={false} />,
    );
    expect(screen.getByTitle('diabetes')).toBeInTheDocument();

    rerender(
      <TagChip
        tipo="enfermedad"
        valor="diabetes"
        matched={false}
        title="título custom"
      />,
    );
    expect(screen.getByTitle('título custom')).toBeInTheDocument();
  });

  it('renders trailing content', () => {
    render(
      <TagChip
        tipo="enfermedad"
        valor="diabetes"
        matched={false}
        trailing={<span data-testid="trailing-x">×</span>}
      />,
    );

    expect(screen.getByTestId('trailing-x')).toBeInTheDocument();
  });
});
