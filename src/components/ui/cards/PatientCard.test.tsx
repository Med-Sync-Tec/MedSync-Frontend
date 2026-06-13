import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PatientCard } from './PatientCard';

describe('PatientCard', () => {
  it('renders the patient name and id', () => {
    // Arrange & Act
    render(<PatientCard name="María González" patientId="PAC-001" />);

    // Assert
    expect(screen.getByText('María González')).toBeInTheDocument();
    expect(screen.getByText('#PAC-001')).toBeInTheDocument();
  });

  it('calls onClick when the card is clicked', async () => {
    const onClick = jest.fn();
    render(<PatientCard name="María González" patientId="PAC-001" onClick={onClick} />);

    await userEvent.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('marks the card as pressed when selected', () => {
    render(<PatientCard name="María González" patientId="PAC-001" selected />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('is not pressed by default', () => {
    render(<PatientCard name="María González" patientId="PAC-001" />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows the attention label when needsAttention is true', () => {
    render(<PatientCard name="María González" patientId="PAC-001" needsAttention />);
    expect(screen.getByText('Atención')).toBeInTheDocument();
  });

  it('hides the attention label by default', () => {
    render(<PatientCard name="María González" patientId="PAC-001" />);
    expect(screen.queryByText('Atención')).not.toBeInTheDocument();
  });

  it('forwards the ref to the underlying button', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<PatientCard ref={ref} name="María González" patientId="PAC-001" />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('appends custom className', () => {
    render(<PatientCard name="María González" patientId="PAC-001" className="extra-class" />);
    expect(screen.getByRole('button')).toHaveClass('extra-class');
  });

  it('renders without errors for every status variant', () => {
    const statuses = ['estable', 'critico', 'en-observacion', 'alta'] as const;
    for (const status of statuses) {
      const { unmount } = render(
        <PatientCard name="María González" patientId="PAC-001" status={status} />
      );
      expect(screen.getByRole('button')).toBeInTheDocument();
      unmount();
    }
  });
});
