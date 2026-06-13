import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SegmentedToggle, type SegmentOption } from './SegmentedToggle';

const options: SegmentOption[] = [
  { value: 'noticias', label: 'Noticias' },
  { value: 'guardadas', label: 'Guardadas' },
];

describe('SegmentedToggle', () => {
  it('renders a radiogroup with one radio per option', () => {
    render(<SegmentedToggle options={options} value="noticias" onChange={jest.fn()} />);

    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });

  it('renders the labels of all options', () => {
    render(<SegmentedToggle options={options} value="noticias" onChange={jest.fn()} />);

    expect(screen.getByText('Noticias')).toBeInTheDocument();
    expect(screen.getByText('Guardadas')).toBeInTheDocument();
  });

  it('marks only the active option as checked', () => {
    render(<SegmentedToggle options={options} value="guardadas" onChange={jest.fn()} />);

    expect(screen.getByRole('radio', { name: 'Guardadas' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    expect(screen.getByRole('radio', { name: 'Noticias' })).toHaveAttribute(
      'aria-checked',
      'false'
    );
  });

  it('calls onChange with the value of the clicked option', async () => {
    const onChange = jest.fn();
    render(<SegmentedToggle options={options} value="noticias" onChange={onChange} />);

    await userEvent.click(screen.getByRole('radio', { name: 'Guardadas' }));

    expect(onChange).toHaveBeenCalledWith('guardadas');
  });

  it('renders the option icon when provided', () => {
    const withIcons: SegmentOption[] = [
      { value: 'a', label: 'A', icon: <span data-testid="icon-a" /> },
      { value: 'b', label: 'B' },
    ];
    render(<SegmentedToggle options={withIcons} value="a" onChange={jest.fn()} />);

    expect(screen.getByTestId('icon-a')).toBeInTheDocument();
  });

  it('styles the active option with white text', () => {
    render(<SegmentedToggle options={options} value="noticias" onChange={jest.fn()} />);

    expect(screen.getByRole('radio', { name: 'Noticias' })).toHaveClass('text-white');
    expect(screen.getByRole('radio', { name: 'Guardadas' })).not.toHaveClass('text-white');
  });
});
