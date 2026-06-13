import { render, screen } from '@testing-library/react';
import { FileUploadZone } from './FileUploadZone';

describe('FileUploadZone', () => {
  it('renders the section heading', () => {
    render(<FileUploadZone />);
    expect(screen.getByText('Estudios y Archivos Adjuntos')).toBeInTheDocument();
  });

  it('renders the drag-and-drop instructions', () => {
    render(<FileUploadZone />);
    expect(
      screen.getByText('Arrastre archivos aquí o haga clic para subir')
    ).toBeInTheDocument();
  });

  it('renders the supported formats hint', () => {
    render(<FileUploadZone />);
    expect(
      screen.getByText('Soporta RX, PDF de laboratorio, Fotos (Max 20MB)')
    ).toBeInTheDocument();
  });

  it('renders a hidden multiple file input', () => {
    const { container } = render(<FileUploadZone />);

    const input = container.querySelector('input[type="file"]');
    expect(input).not.toBeNull();
    expect(input).toHaveAttribute('multiple');
    expect(input).toHaveClass('hidden');
  });

  it('appends a custom className to the wrapper', () => {
    const { container } = render(<FileUploadZone className="extra-class" />);
    expect(container.firstChild).toHaveClass('extra-class');
  });
});
