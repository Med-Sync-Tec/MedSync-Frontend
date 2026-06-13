import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Guardar</Button>);
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
  });

  it('uses type="button" by default', () => {
    render(<Button>Guardar</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('allows overriding the type to submit', () => {
    render(<Button type="submit">Enviar</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('applies primary variant styles by default', () => {
    render(<Button>Guardar</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary');
  });

  it('applies secondary variant styles', () => {
    render(<Button variant="secondary">Cancelar</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-white');
  });

  it('applies outline variant styles', () => {
    render(<Button variant="outline">Ver más</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-transparent');
  });

  it('applies danger variant styles', () => {
    render(<Button variant="danger">Eliminar</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-600');
  });

  it('applies full width when fullWidth is true', () => {
    render(<Button fullWidth>Guardar</Button>);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });

  it('does not apply full width by default', () => {
    render(<Button>Guardar</Button>);
    expect(screen.getByRole('button')).not.toHaveClass('w-full');
  });

  it('renders the icon when provided', () => {
    render(<Button icon={<span data-testid="icon" />}>Guardar</Button>);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('replaces the icon with a spinner and disables the button when isLoading', () => {
    render(
      <Button isLoading icon={<span data-testid="icon" />}>
        Guardando
      </Button>
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
    expect(button.querySelector('svg.animate-spin')).toBeInTheDocument();
  });

  it('is disabled when disabled prop is set', () => {
    render(<Button disabled>Guardar</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls onClick when clicked', async () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Guardar</Button>);

    await userEvent.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const onClick = jest.fn();
    render(
      <Button onClick={onClick} disabled>
        Guardar
      </Button>
    );

    await userEvent.click(screen.getByRole('button'));

    expect(onClick).not.toHaveBeenCalled();
  });

  it('forwards the ref to the underlying button element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Guardar</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('appends a custom className', () => {
    render(<Button className="extra-class">Guardar</Button>);
    expect(screen.getByRole('button')).toHaveClass('extra-class');
  });
});
