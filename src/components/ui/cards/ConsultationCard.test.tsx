import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConsultationCard } from './ConsultationCard';
import { ConsultationSummarySchema } from '@features/consultations/schemas';

const consultation = ConsultationSummarySchema.parse({
  id: 'c-1',
  date: '2024-03-15T12:00:00',
  reason: 'Dolor torácico',
  diagnosis: 'Angina estable',
  type: 'general',
});

describe('ConsultationCard', () => {
  it('renders reason, diagnosis and type label', () => {
    // Arrange & Act
    render(<ConsultationCard consultation={consultation} onViewSOAP={jest.fn()} />);

    // Assert
    expect(screen.getByText('Dolor torácico')).toBeInTheDocument();
    expect(screen.getByText('Angina estable')).toBeInTheDocument();
    expect(screen.getByText('Medicina general')).toBeInTheDocument();
  });

  it('renders the formatted date parts for a valid date', () => {
    render(<ConsultationCard consultation={consultation} onViewSOAP={jest.fn()} />);

    expect(screen.getByText('MAR')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
  });

  it('renders em dashes when the date is invalid', () => {
    const invalid = { ...consultation, date: 'no-es-fecha' };
    render(<ConsultationCard consultation={invalid} onViewSOAP={jest.fn()} />);

    expect(screen.getAllByText('—')).toHaveLength(2);
  });

  it('calls onViewSOAP with the consultation id', async () => {
    const onViewSOAP = jest.fn();
    render(<ConsultationCard consultation={consultation} onViewSOAP={onViewSOAP} />);

    await userEvent.click(screen.getByRole('button', { name: 'Ver SOAP de Dolor torácico' }));

    expect(onViewSOAP).toHaveBeenCalledWith('c-1');
  });

  it('renders specialist and follow-up type labels', () => {
    const especialista = { ...consultation, type: 'especialista' as const };
    const { rerender } = render(
      <ConsultationCard consultation={especialista} onViewSOAP={jest.fn()} />
    );
    expect(screen.getByText('Especialista')).toBeInTheDocument();

    const seguimiento = { ...consultation, type: 'seguimiento' as const };
    rerender(<ConsultationCard consultation={seguimiento} onViewSOAP={jest.fn()} />);
    expect(screen.getByText('Seguimiento')).toBeInTheDocument();
  });

  it('appends custom className to the article', () => {
    const { container } = render(
      <ConsultationCard consultation={consultation} onViewSOAP={jest.fn()} className="extra-class" />
    );
    expect(container.firstChild).toHaveClass('extra-class');
  });
});
