import { render, screen } from '@testing-library/react';
import { AlertBanner } from './AlertBanner';

describe('AlertBanner', () => {
  it('renders the message text', () => {
    // Arrange & Act
    render(<AlertBanner message="Recuerda completar la nota SOAP" />);

    // Assert
    expect(screen.getByText('Recuerda completar la nota SOAP')).toBeInTheDocument();
  });

  it('renders the info icon by default', () => {
    render(<AlertBanner message="mensaje" />);
    expect(screen.getByText('info')).toBeInTheDocument();
  });

  it('renders the warning icon for warning type', () => {
    render(<AlertBanner type="warning" message="mensaje" />);
    expect(screen.getByText('warning')).toBeInTheDocument();
  });

  it('renders the lightbulb icon for tip type', () => {
    render(<AlertBanner type="tip" message="mensaje" />);
    expect(screen.getByText('lightbulb')).toBeInTheDocument();
  });

  it('appends custom className to the container', () => {
    const { container } = render(<AlertBanner message="mensaje" className="extra-class" />);
    expect(container.firstChild).toHaveClass('extra-class');
  });

  it('applies warning styles to the container', () => {
    const { container } = render(<AlertBanner type="warning" message="mensaje" />);
    expect(container.firstChild).toHaveClass('bg-orange-50');
  });
});
