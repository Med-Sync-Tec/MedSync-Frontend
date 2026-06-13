import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from './ErrorBoundary';

interface BombProps {
  shouldThrow: boolean;
  message?: string;
}

const Bomb = ({ shouldThrow, message = 'falló el componente' }: BombProps) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div>contenido sano</div>;
};

let consoleSpy: ReturnType<typeof jest.spyOn>;

beforeEach(() => {
  consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  consoleSpy.mockRestore();
});

describe('ErrorBoundary', () => {
  it('renders children when nothing throws', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('contenido sano')).toBeInTheDocument();
  });

  it('shows the default fallback UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow message="explotó algo" />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
    expect(screen.getByText('explotó algo')).toBeInTheDocument();
    expect(screen.queryByText('contenido sano')).not.toBeInTheDocument();
  });

  it('shows a generic message when the error has no message', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow message="" />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Error inesperado en la aplicación.')).toBeInTheDocument();
  });

  it('logs the error to console.error', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow message="error registrado" />
      </ErrorBoundary>,
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      '[ErrorBoundary]',
      expect.objectContaining({ message: 'error registrado' }),
      expect.anything(),
    );
  });

  it('renders the custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>respaldo personalizado</div>}>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    );

    expect(screen.getByText('respaldo personalizado')).toBeInTheDocument();
    expect(screen.queryByText('Algo salió mal')).not.toBeInTheDocument();
  });

  it('recovers and re-renders children after clicking "Reintentar"', async () => {
    const user = userEvent.setup();
    let shouldThrow = true;
    const Flaky = () => <Bomb shouldThrow={shouldThrow} />;

    render(
      <ErrorBoundary>
        <Flaky />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();

    shouldThrow = false;
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(screen.getByText('contenido sano')).toBeInTheDocument();
    expect(screen.queryByText('Algo salió mal')).not.toBeInTheDocument();
  });
});
