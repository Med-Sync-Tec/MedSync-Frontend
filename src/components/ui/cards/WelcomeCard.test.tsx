import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WelcomeCard } from './WelcomeCard';

describe('WelcomeCard', () => {
  it('greets the doctor by name', () => {
    // Arrange & Act
    render(<WelcomeCard doctorName="Dra. Ramírez" />);

    // Assert
    expect(screen.getByText('Buenos días, Dra. Ramírez')).toBeInTheDocument();
  });

  it('shows the provided date instead of today', () => {
    render(<WelcomeCard doctorName="Dra. Ramírez" date="lunes, 1 de enero" />);
    expect(screen.getByText('lunes, 1 de enero')).toBeInTheDocument();
  });

  it('shows the default summary when none is provided', () => {
    render(<WelcomeCard doctorName="Dra. Ramírez" />);
    expect(
      screen.getByText('Tienes 8 citas programadas y 3 alertas pendientes.')
    ).toBeInTheDocument();
  });

  it('shows a custom summary', () => {
    render(<WelcomeCard doctorName="Dra. Ramírez" summary="Sin pendientes hoy." />);
    expect(screen.getByText('Sin pendientes hoy.')).toBeInTheDocument();
  });

  it('calls onViewSchedule when "Ver agenda" is clicked', async () => {
    const onViewSchedule = jest.fn();
    render(<WelcomeCard doctorName="Dra. Ramírez" onViewSchedule={onViewSchedule} />);

    await userEvent.click(screen.getByRole('button', { name: 'Ver agenda' }));

    expect(onViewSchedule).toHaveBeenCalledTimes(1);
  });

  it('calls onViewAlerts when "Ver alertas" is clicked', async () => {
    const onViewAlerts = jest.fn();
    render(<WelcomeCard doctorName="Dra. Ramírez" onViewAlerts={onViewAlerts} />);

    await userEvent.click(screen.getByRole('button', { name: 'Ver alertas' }));

    expect(onViewAlerts).toHaveBeenCalledTimes(1);
  });
});
