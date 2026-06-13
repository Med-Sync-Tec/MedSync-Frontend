import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('renders a checkbox with its label', () => {
    render(<Checkbox id="remember" label="Recordarme" />);
    expect(screen.getByRole('checkbox', { name: 'Recordarme' })).toBeInTheDocument();
  });

  it('associates the label with the input via the id', () => {
    render(<Checkbox id="remember" label="Recordarme" />);

    const input = screen.getByRole('checkbox');
    expect(input).toHaveAttribute('id', 'remember');
    expect(screen.getByText('Recordarme')).toHaveAttribute('for', 'remember');
  });

  it('toggles when clicking the label', async () => {
    render(<Checkbox id="remember" label="Recordarme" />);

    await userEvent.click(screen.getByText('Recordarme'));

    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('calls onChange when toggled', async () => {
    const onChange = jest.fn();
    render(<Checkbox id="remember" label="Recordarme" onChange={onChange} />);

    await userEvent.click(screen.getByRole('checkbox'));

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('respects the disabled prop', async () => {
    const onChange = jest.fn();
    render(<Checkbox id="remember" label="Recordarme" disabled onChange={onChange} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();

    await userEvent.click(checkbox);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('forwards the ref to the input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Checkbox id="remember" label="Recordarme" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.type).toBe('checkbox');
  });

  it('appends a custom className to the wrapper', () => {
    const { container } = render(
      <Checkbox id="remember" label="Recordarme" className="extra-class" />
    );
    expect(container.firstChild).toHaveClass('extra-class');
  });
});
