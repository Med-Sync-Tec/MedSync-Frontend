import { render, screen } from '@testing-library/react';
import { PatientListSkeleton } from './PatientListSkeleton';

describe('PatientListSkeleton', () => {
  it('renders an accessible loading list with 6 rows by default', () => {
    render(<PatientListSkeleton />);

    const list = screen.getByRole('status', { name: 'Cargando lista de pacientes' });
    expect(list).toBeInTheDocument();
    expect(list.querySelectorAll('li')).toHaveLength(6);
  });

  it('renders the requested number of rows', () => {
    render(<PatientListSkeleton rows={3} />);

    const list = screen.getByRole('status');
    expect(list.querySelectorAll('li')).toHaveLength(3);
  });
});
