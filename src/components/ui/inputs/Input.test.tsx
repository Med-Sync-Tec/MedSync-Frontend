import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input, PasswordInput } from './Input';

describe('Input', () => {
  it('renders an input associated with its label', () => {
    render(<Input id="email" label="Correo electrónico" />);
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
  });

  it('is not marked invalid when there is no error', () => {
    render(<Input id="email" label="Correo" />);
    expect(screen.getByLabelText('Correo')).toHaveAttribute('aria-invalid', 'false');
  });

  it('shows the error message and marks the input invalid', () => {
    render(<Input id="email" label="Correo" error="Formato de correo inválido" />);

    expect(screen.getByText('Formato de correo inválido')).toBeInTheDocument();
    expect(screen.getByLabelText('Correo')).toHaveAttribute('aria-invalid', 'true');
  });

  it('applies error border styles when error is set', () => {
    render(<Input id="email" label="Correo" error="Requerido" />);
    expect(screen.getByLabelText('Correo')).toHaveClass('border-red-400');
  });

  it('calls onChange while typing', async () => {
    const onChange = jest.fn();
    render(<Input id="email" label="Correo" onChange={onChange} />);

    await userEvent.type(screen.getByLabelText('Correo'), 'abc');

    expect(onChange).toHaveBeenCalledTimes(3);
    expect(screen.getByLabelText('Correo')).toHaveValue('abc');
  });

  it('forwards the ref to the input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input id="email" label="Correo" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('respects the disabled prop', () => {
    render(<Input id="email" label="Correo" disabled />);
    expect(screen.getByLabelText('Correo')).toBeDisabled();
  });

  it('appends a custom className to the wrapper', () => {
    const { container } = render(<Input id="email" label="Correo" className="extra-class" />);
    expect(container.firstChild).toHaveClass('extra-class');
  });
});

describe('PasswordInput', () => {
  it('renders as a password field by default', () => {
    render(<PasswordInput id="password" label="Contraseña" />);
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'password');
  });

  it('shows a "Mostrar contraseña" toggle button', () => {
    render(<PasswordInput id="password" label="Contraseña" />);

    const toggle = screen.getByRole('button', { name: 'Mostrar contraseña' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
  });

  it('reveals the password when the toggle is clicked', async () => {
    render(<PasswordInput id="password" label="Contraseña" />);

    await userEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));

    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'text');
    const toggle = screen.getByRole('button', { name: 'Ocultar contraseña' });
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });

  it('hides the password again on a second toggle click', async () => {
    render(<PasswordInput id="password" label="Contraseña" />);

    await userEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
    await userEvent.click(screen.getByRole('button', { name: 'Ocultar contraseña' }));

    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'password');
  });

  it('shows the error message and marks the input invalid', () => {
    render(<PasswordInput id="password" label="Contraseña" error="Este campo es obligatorio" />);

    expect(screen.getByText('Este campo es obligatorio')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('aria-invalid', 'true');
  });

  it('forwards the ref to the input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(<PasswordInput id="password" label="Contraseña" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
