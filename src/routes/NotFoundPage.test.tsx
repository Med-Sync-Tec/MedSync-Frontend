import { render, screen } from '@testing-library/react';
import { NotFoundPage } from './NotFoundPage';

describe('NotFoundPage', () => {
  it('shows the 404 heading', () => {
    render(<NotFoundPage />);

    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument();
  });

  it('shows the Spanish not-found message', () => {
    render(<NotFoundPage />);

    expect(screen.getByText('Página no encontrada')).toBeInTheDocument();
  });
});
