import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('renders a textarea associated with its label', () => {
    render(<Textarea id="notes" label="Notas" />);
    expect(screen.getByLabelText('Notas')).toBeInTheDocument();
  });

  it('renders without a label when label is omitted', () => {
    const { container } = render(<Textarea id="notes" />);
    expect(container.querySelector('label')).toBeNull();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('uses 4 rows by default', () => {
    render(<Textarea id="notes" label="Notas" />);
    expect(screen.getByLabelText('Notas')).toHaveAttribute('rows', '4');
  });

  it('accepts a custom rows value', () => {
    render(<Textarea id="notes" label="Notas" rows={8} />);
    expect(screen.getByLabelText('Notas')).toHaveAttribute('rows', '8');
  });

  it('is not marked invalid when there is no error', () => {
    render(<Textarea id="notes" label="Notas" />);
    expect(screen.getByLabelText('Notas')).toHaveAttribute('aria-invalid', 'false');
  });

  it('shows the error message and marks the textarea invalid', () => {
    render(<Textarea id="notes" label="Notas" error="Campo requerido" />);

    expect(screen.getByText('Campo requerido')).toBeInTheDocument();
    expect(screen.getByLabelText('Notas')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Notas')).toHaveClass('border-red-400');
  });

  it('does not render an error paragraph when there is no error', () => {
    render(<Textarea id="notes" label="Notas" />);
    expect(screen.queryByText('Campo requerido')).not.toBeInTheDocument();
  });

  it('calls onChange while typing', async () => {
    const onChange = jest.fn();
    render(<Textarea id="notes" label="Notas" onChange={onChange} />);

    await userEvent.type(screen.getByLabelText('Notas'), 'hola');

    expect(onChange).toHaveBeenCalledTimes(4);
    expect(screen.getByLabelText('Notas')).toHaveValue('hola');
  });

  it('forwards the ref to the textarea element', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea id="notes" label="Notas" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('appends a custom className to the wrapper', () => {
    const { container } = render(<Textarea id="notes" label="Notas" className="extra-class" />);
    expect(container.firstChild).toHaveClass('extra-class');
  });
});
