import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SOAPModal, type SOAPData } from './SOAPModal';

const soap: SOAPData = {
  subjective: 'Paciente refiere dolor torácico',
  objective: 'TA 120/80, FC 72',
  assessment: 'Probable angina estable',
  plan: 'ECG y prueba de esfuerzo',
};

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  date: '2024-03-15T12:00:00',
  doctorName: 'Laura García',
  soap,
};

describe('SOAPModal', () => {
  it('renders nothing when isOpen is false', () => {
    render(<SOAPModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders a dialog with the SOAP title when open', () => {
    render(<SOAPModal {...defaultProps} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('Resumen SOAP')).toBeInTheDocument();
  });

  it('shows the formatted date and the doctor name', () => {
    render(<SOAPModal {...defaultProps} />);
    expect(screen.getByText(/15 de marzo de 2024/)).toBeInTheDocument();
    expect(screen.getByText(/Dr\. Laura García/)).toBeInTheDocument();
  });

  it('renders the four SOAP section titles', () => {
    render(<SOAPModal {...defaultProps} />);

    expect(screen.getByText('Subjetivo')).toBeInTheDocument();
    expect(screen.getByText('Objetivo')).toBeInTheDocument();
    expect(screen.getByText('Análisis')).toBeInTheDocument();
    expect(screen.getByText('Plan')).toBeInTheDocument();
  });

  it('renders the content of each SOAP section', () => {
    render(<SOAPModal {...defaultProps} />);

    expect(screen.getByText('Paciente refiere dolor torácico')).toBeInTheDocument();
    expect(screen.getByText('TA 120/80, FC 72')).toBeInTheDocument();
    expect(screen.getByText('Probable angina estable')).toBeInTheDocument();
    expect(screen.getByText('ECG y prueba de esfuerzo')).toBeInTheDocument();
  });

  it('calls onClose when the header close button is clicked', async () => {
    const onClose = jest.fn();
    render(<SOAPModal {...defaultProps} onClose={onClose} />);

    await userEvent.click(screen.getByRole('button', { name: 'Cerrar resumen' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the footer "Cerrar" button is clicked', async () => {
    const onClose = jest.fn();
    render(<SOAPModal {...defaultProps} onClose={onClose} />);

    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape is pressed', async () => {
    const onClose = jest.fn();
    render(<SOAPModal {...defaultProps} onClose={onClose} />);

    await userEvent.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not listen for Escape while closed', async () => {
    const onClose = jest.fn();
    render(<SOAPModal {...defaultProps} isOpen={false} onClose={onClose} />);

    await userEvent.keyboard('{Escape}');

    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = jest.fn();
    render(<SOAPModal {...defaultProps} onClose={onClose} />);

    const backdrop = screen.getByRole('dialog').firstElementChild;
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop as Element);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
