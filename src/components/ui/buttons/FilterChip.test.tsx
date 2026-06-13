import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterChip } from './FilterChip';

describe('FilterChip', () => {
  it('renders the label text', () => {
    render(<FilterChip label="Cardiología" />);
    expect(screen.getByText('Cardiología')).toBeInTheDocument();
  });

  it('does not render a remove button when onRemove is not provided', () => {
    render(<FilterChip label="Cardiología" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders a remove button with an accessible label when onRemove is provided', () => {
    render(<FilterChip label="Cardiología" onRemove={jest.fn()} />);
    expect(
      screen.getByRole('button', { name: 'Eliminar filtro Cardiología' })
    ).toBeInTheDocument();
  });

  it('calls onRemove when the remove button is clicked', async () => {
    const onRemove = jest.fn();
    render(<FilterChip label="Cardiología" onRemove={onRemove} />);

    await userEvent.click(screen.getByRole('button', { name: 'Eliminar filtro Cardiología' }));

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('appends a custom className', () => {
    const { container } = render(<FilterChip label="Cardiología" className="extra-class" />);
    expect(container.firstChild).toHaveClass('extra-class');
  });
});
