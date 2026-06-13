import { render, screen } from '@testing-library/react';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('renders the initials of the first two words of the name', () => {
    render(<Avatar name="Ana López Pérez" />);
    expect(screen.getByText('AL')).toBeInTheDocument();
  });

  it('renders a single initial for a one-word name', () => {
    render(<Avatar name="Ana" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('uppercases the initials', () => {
    render(<Avatar name="juan perez" />);
    expect(screen.getByText('JP')).toBeInTheDocument();
  });

  it('exposes the full name via aria-label and title', () => {
    render(<Avatar name="Ana López" />);
    const avatar = screen.getByLabelText('Ana López');
    expect(avatar).toHaveAttribute('title', 'Ana López');
  });

  it('applies the medium size styles by default', () => {
    render(<Avatar name="Ana López" />);
    expect(screen.getByLabelText('Ana López')).toHaveClass('w-10', 'h-10', 'text-sm');
  });

  it('applies small size styles when size="sm"', () => {
    render(<Avatar name="Ana López" size="sm" />);
    expect(screen.getByLabelText('Ana López')).toHaveClass('w-8', 'h-8', 'text-xs');
  });

  it('applies large size styles when size="lg"', () => {
    render(<Avatar name="Ana López" size="lg" />);
    expect(screen.getByLabelText('Ana López')).toHaveClass('w-12', 'h-12', 'text-base');
  });

  it('picks a deterministic background color for the same name', () => {
    const { unmount } = render(<Avatar name="Ana López" />);
    const firstClasses = screen.getByLabelText('Ana López').className;
    unmount();

    render(<Avatar name="Ana López" />);
    const secondClasses = screen.getByLabelText('Ana López').className;

    expect(firstClasses).toBe(secondClasses);
    expect(firstClasses).toMatch(/bg-(blue|teal|purple|orange|green|red|indigo|pink)-500/);
  });

  it('appends a custom className', () => {
    render(<Avatar name="Ana López" className="extra-class" />);
    expect(screen.getByLabelText('Ana López')).toHaveClass('extra-class');
  });
});
