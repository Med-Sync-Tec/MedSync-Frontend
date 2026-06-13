import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';

const Bomb = () => {
  throw new Error('error en página pública');
};

function renderWithChild(child: React.ReactNode) {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/" element={child} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('AuthLayout', () => {
  it('renders the matched child route through the outlet', () => {
    renderWithChild(<div>página de login</div>);

    expect(screen.getByText('página de login')).toBeInTheDocument();
  });

  it('catches errors from child routes with its error boundary', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    renderWithChild(<Bomb />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });
});
