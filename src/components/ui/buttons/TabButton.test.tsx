import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TabButton } from './TabButton';

describe('TabButton', () => {
  it('renders the label and the count', () => {
    render(<TabButton label="Pendientes" count={4} />);
    expect(screen.getByText('Pendientes')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('uses type="button"', () => {
    render(<TabButton label="Pendientes" count={4} />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('applies active styles when active is true', () => {
    render(<TabButton label="Pendientes" count={4} active />);
    expect(screen.getByRole('button')).toHaveClass('bg-primary', 'text-white');
  });

  it('applies inactive styles by default', () => {
    render(<TabButton label="Pendientes" count={4} />);
    const button = screen.getByRole('button');
    expect(button).not.toHaveClass('bg-primary');
    expect(button).toHaveClass('bg-white');
  });

  it('renders an icon when provided', () => {
    render(<TabButton label="Pendientes" count={4} icon={<span data-testid="icon" />} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = jest.fn();
    render(<TabButton label="Pendientes" count={4} onClick={onClick} />);

    await userEvent.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('appends a custom className', () => {
    render(<TabButton label="Pendientes" count={4} className="extra-class" />);
    expect(screen.getByRole('button')).toHaveClass('extra-class');
  });
});
