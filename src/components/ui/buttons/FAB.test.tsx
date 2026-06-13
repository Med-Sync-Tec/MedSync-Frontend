import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FAB } from './FAB';

const Fab = FAB;

describe('FAB', () => { // NOSONAR
  it('renders the label text', () => { // NOSONAR
    render(<Fab label="Pregúntale a MediBot" />);
    expect(screen.getByText('Pregúntale a MediBot')).toBeInTheDocument();
  });

  it('renders the default smart_toy icon when no icon is given', () => { // NOSONAR
    render(<Fab label="MediBot" />);
    expect(screen.getByText('smart_toy')).toBeInTheDocument();
  });

  it('renders a custom icon instead of the default', () => { // NOSONAR
    render(<Fab label="MediBot" icon={<span data-testid="custom-icon" />} />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    expect(screen.queryByText('smart_toy')).not.toBeInTheDocument();
  });

  it('renders a button with type="button"', () => { // NOSONAR
    render(<Fab label="MediBot" />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('calls onClick when the button is clicked', async () => { // NOSONAR
    const onClick = jest.fn();
    render(<Fab label="MediBot" onClick={onClick} />);

    await userEvent.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('forwards an aria-label to the button', () => { // NOSONAR
    render(<Fab label="MediBot" aria-label="Abrir chat" />);
    expect(screen.getByRole('button', { name: 'Abrir chat' })).toBeInTheDocument();
  });

  it('appends a custom className to the wrapper', () => { // NOSONAR
    const { container } = render(<Fab label="MediBot" className="extra-class" />);
    expect(container.firstChild).toHaveClass('extra-class');
  });
});
