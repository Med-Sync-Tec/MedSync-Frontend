import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IARecommendationModal } from './IARecommendationModal';

describe('IARecommendationModal', () => {
  it('renders the normal recommendation label and text by default', () => {
    // Arrange & Act
    render(<IARecommendationModal recommendation="Aumentar dosis de metformina" />);

    // Assert
    expect(screen.getByText('Recomendación MedSync AI')).toBeInTheDocument();
    expect(screen.getByText('Aumentar dosis de metformina')).toBeInTheDocument();
  });

  it('renders the loading state without action buttons', () => {
    render(<IARecommendationModal status="loading" onAccept={jest.fn()} onReject={jest.fn()} />);

    expect(screen.getByText('Analizando con IA...')).toBeInTheDocument();
    expect(screen.getByText('Procesando datos clínicos del paciente...')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders the critical alert label with red accept button', () => {
    render(
      <IARecommendationModal status="critical" recommendation="Interacción grave" onAccept={jest.fn()} />
    );

    expect(screen.getByText('Alerta Crítica MedSync AI')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aplicar sugerencia' })).toHaveClass('bg-red-600');
  });

  it('calls onAccept when "Aplicar sugerencia" is clicked', async () => {
    const onAccept = jest.fn();
    render(<IARecommendationModal recommendation="r" onAccept={onAccept} />);

    await userEvent.click(screen.getByRole('button', { name: 'Aplicar sugerencia' }));

    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it('calls onReject when "Descartar" is clicked', async () => {
    const onReject = jest.fn();
    render(<IARecommendationModal recommendation="r" onReject={onReject} />);

    await userEvent.click(screen.getByRole('button', { name: 'Descartar' }));

    expect(onReject).toHaveBeenCalledTimes(1);
  });

  it('hides action buttons when callbacks are not provided', () => {
    render(<IARecommendationModal recommendation="r" />);

    expect(screen.queryByRole('button', { name: 'Aplicar sugerencia' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Descartar' })).not.toBeInTheDocument();
  });

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = jest.fn();
    const { container } = render(<IARecommendationModal recommendation="r" onClose={onClose} />);

    const backdrop = container.querySelector('.backdrop-blur-sm');
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop as Element);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
