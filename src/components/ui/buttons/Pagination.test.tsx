import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('renders a navigation landmark labeled "Paginación"', () => {
    render(<Pagination currentPage={1} totalPages={3} onPageChange={jest.fn()} />);
    expect(screen.getByRole('navigation', { name: 'Paginación' })).toBeInTheDocument();
  });

  it('renders every page without ellipsis when totalPages <= 7', () => {
    render(<Pagination currentPage={1} totalPages={7} onPageChange={jest.fn()} />);

    for (let page = 1; page <= 7; page++) {
      expect(screen.getByRole('button', { name: String(page) })).toBeInTheDocument();
    }
    expect(screen.queryByText('...')).not.toBeInTheDocument();
  });

  it('shows pages 1-5, ellipsis and last page when current page is near the start', () => {
    render(<Pagination currentPage={3} totalPages={10} onPageChange={jest.fn()} />);

    [1, 2, 3, 4, 5, 10].forEach((page) => {
      expect(screen.getByRole('button', { name: String(page) })).toBeInTheDocument();
    });
    expect(screen.getAllByText('...')).toHaveLength(1);
    expect(screen.queryByRole('button', { name: '6' })).not.toBeInTheDocument();
  });

  it('shows first page, ellipsis and last five pages when current page is near the end', () => {
    render(<Pagination currentPage={8} totalPages={10} onPageChange={jest.fn()} />);

    [1, 6, 7, 8, 9, 10].forEach((page) => {
      expect(screen.getByRole('button', { name: String(page) })).toBeInTheDocument();
    });
    expect(screen.getAllByText('...')).toHaveLength(1);
    expect(screen.queryByRole('button', { name: '2' })).not.toBeInTheDocument();
  });

  it('shows two ellipses around the current page in the middle of a long range', () => {
    render(<Pagination currentPage={10} totalPages={20} onPageChange={jest.fn()} />);

    [1, 9, 10, 11, 20].forEach((page) => {
      expect(screen.getByRole('button', { name: String(page) })).toBeInTheDocument();
    });
    expect(screen.getAllByText('...')).toHaveLength(2);
  });

  it('marks the current page with aria-current="page"', () => {
    render(<Pagination currentPage={2} totalPages={5} onPageChange={jest.fn()} />);

    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: '3' })).not.toHaveAttribute('aria-current');
  });

  it('calls onPageChange with the clicked page number', async () => {
    const onPageChange = jest.fn();
    render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />);

    await userEvent.click(screen.getByRole('button', { name: '4' }));

    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it('calls onPageChange with the previous page when clicking "Página anterior"', async () => {
    const onPageChange = jest.fn();
    render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Página anterior' }));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange with the next page when clicking "Página siguiente"', async () => {
    const onPageChange = jest.fn();
    render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Página siguiente' }));

    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it('disables the previous button on the first page', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Página siguiente' })).toBeEnabled();
  });

  it('disables the next button on the last page', () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Página siguiente' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeEnabled();
  });

  it('does not call onPageChange when clicking a disabled boundary button', async () => {
    const onPageChange = jest.fn();
    render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Página anterior' }));

    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('appends a custom className to the nav', () => {
    render(
      <Pagination currentPage={1} totalPages={3} onPageChange={jest.fn()} className="extra-class" />
    );
    expect(screen.getByRole('navigation', { name: 'Paginación' })).toHaveClass('extra-class');
  });
});
