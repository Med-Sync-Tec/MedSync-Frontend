import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  it('renders a search input with the default placeholder', () => {
    render(<SearchBar />);
    expect(screen.getByPlaceholderText('Buscar noticias, pacientes...')).toBeInTheDocument();
  });

  it('accepts a custom placeholder', () => {
    render(<SearchBar placeholder="Buscar médicos..." />);
    expect(screen.getByPlaceholderText('Buscar médicos...')).toBeInTheDocument();
  });

  it('calls onSearch with the current value while typing', async () => {
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} />);

    await userEvent.type(screen.getByRole('searchbox'), 'ana');

    expect(onSearch).toHaveBeenCalledTimes(3);
    expect(onSearch).toHaveBeenLastCalledWith('ana');
  });

  it('also calls the native onChange handler', async () => {
    const onChange = jest.fn();
    const onSearch = jest.fn();
    render(<SearchBar onChange={onChange} onSearch={onSearch} />);

    await userEvent.type(screen.getByRole('searchbox'), 'a');

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('a');
  });

  it('works without an onSearch handler', async () => {
    render(<SearchBar />);

    await userEvent.type(screen.getByRole('searchbox'), 'ana');

    expect(screen.getByRole('searchbox')).toHaveValue('ana');
  });

  it('forwards the ref to the input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(<SearchBar ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.type).toBe('search');
  });

  it('appends a custom className to the wrapper', () => {
    const { container } = render(<SearchBar className="extra-class" />);
    expect(container.firstChild).toHaveClass('extra-class');
  });
});
