import { render, screen } from '@testing-library/react';
import {
  ConsultationTimelineSkeleton,
  PatientDetailCardSkeleton,
} from './PatientDetailCardSkeleton';

describe('PatientDetailCardSkeleton', () => {
  it('renders an accessible loading card', () => {
    const { container } = render(<PatientDetailCardSkeleton />);

    expect(
      screen.getByRole('status', { name: 'Cargando datos del paciente' }),
    ).toBeInTheDocument();
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });
});

describe('ConsultationTimelineSkeleton', () => {
  it('renders 4 placeholder rows by default', () => {
    render(<ConsultationTimelineSkeleton />);

    const status = screen.getByRole('status', {
      name: 'Cargando historial de consultas',
    });
    expect(status.children).toHaveLength(4);
  });

  it('renders the requested number of rows', () => {
    render(<ConsultationTimelineSkeleton items={2} />);

    const status = screen.getByRole('status');
    expect(status.children).toHaveLength(2);
  });
});
