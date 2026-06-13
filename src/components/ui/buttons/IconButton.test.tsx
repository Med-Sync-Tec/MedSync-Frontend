import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IconButton } from './IconButton';

describe('IconButton', () => {
  it('renders the provided icon', () => {
    render(<IconButton icon={<span data-testid="icon" />} aria-label="Notificaciones" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('uses type="button" by default', () => {
    render(<IconButton icon={<span />} aria-label="Notificaciones" />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('calls onClick when clicked', async () => {
    const onClick = jest.fn();
    render(<IconButton icon={<span />} aria-label="Notificaciones" onClick={onClick} />);

    await userEvent.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const onClick = jest.fn();
    render(<IconButton icon={<span />} aria-label="Notificaciones" onClick={onClick} disabled />);

    await userEvent.click(screen.getByRole('button'));

    expect(onClick).not.toHaveBeenCalled();
  });

  it('forwards the ref to the underlying button element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<IconButton icon={<span />} aria-label="Notificaciones" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('exposes the accessible name from aria-label', () => {
    render(<IconButton icon={<span />} aria-label="Notificaciones" />);
    expect(screen.getByRole('button', { name: 'Notificaciones' })).toBeInTheDocument();
  });

  it('appends a custom className', () => {
    render(<IconButton icon={<span />} aria-label="Notificaciones" className="extra-class" />);
    expect(screen.getByRole('button')).toHaveClass('extra-class');
  });
});
