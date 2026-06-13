import { act } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Alert } from './Alert';

const AUTO_DISMISS_MS = 5000;

describe('Alert', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the message', () => {
    render(<Alert type="error" message="Algo salió mal" />);
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
  });

  it('shows the error icon for type="error"', () => {
    render(<Alert type="error" message="Algo salió mal" />);
    expect(screen.getByText('error')).toBeInTheDocument();
  });

  it('shows the check icon for type="success"', () => {
    render(<Alert type="success" message="Guardado con éxito" />);
    expect(screen.getByText('check_circle')).toBeInTheDocument();
  });

  it('applies red styles for errors and green styles for success', () => {
    const { container, unmount } = render(<Alert type="error" message="Error" />);
    expect(container.firstChild).toHaveClass('text-red-600');
    unmount();

    const { container: successContainer } = render(<Alert type="success" message="Ok" />);
    expect(successContainer.firstChild).toHaveClass('text-green-700');
  });

  it('hides the alert and calls onClose when the close button is clicked', async () => {
    const onClose = jest.fn();
    render(<Alert type="error" message="Algo salió mal" onClose={onClose} />);

    await userEvent.click(screen.getByRole('button'));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Algo salió mal')).not.toBeInTheDocument();
  });

  it('auto-dismisses after 5 seconds and calls onClose', () => {
    jest.useFakeTimers();
    const onClose = jest.fn();
    render(<Alert type="success" message="Guardado" onClose={onClose} />);

    expect(screen.getByText('Guardado')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(AUTO_DISMISS_MS);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Guardado')).not.toBeInTheDocument();
  });

  it('does not auto-dismiss before 5 seconds', () => {
    jest.useFakeTimers();
    render(<Alert type="success" message="Guardado" />);

    act(() => {
      jest.advanceTimersByTime(AUTO_DISMISS_MS - 1);
    });

    expect(screen.getByText('Guardado')).toBeInTheDocument();
  });

  it('works without an onClose handler', () => {
    jest.useFakeTimers();
    render(<Alert type="error" message="Sin handler" />);

    act(() => {
      jest.advanceTimersByTime(AUTO_DISMISS_MS);
    });

    expect(screen.queryByText('Sin handler')).not.toBeInTheDocument();
  });
});
