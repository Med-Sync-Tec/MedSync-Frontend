import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { PatientDetailCard } from './PatientDetailCard';
import {
  ExpedienteSchema,
  PatientConsultaLiteSchema,
  PatientSchema,
} from '@features/patients/schemas';
import {
  calculateAge,
  daysBetween,
  formatDate,
  formatDateShort,
  formatRelative,
  parseDate,
} from '@features/patients/utils';

const patient = PatientSchema.parse({
  id: 'p-1',
  expedienteExternoId: 'EXP-001',
  nombre: 'María González',
  fechaNacimiento: '1990-05-10',
  genero: 'Femenino',
  medicoId: 'd-1',
  activo: true,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-06-01T10:00:00Z',
});

const expediente = ExpedienteSchema.parse({
  id: 'HOSP-77',
  pacienteExternoId: 'EXP-001',
  doctorResponsableId: 'd-1',
  createdAt: '2024-01-15T10:00:00Z',
});

const consultaVieja = PatientConsultaLiteSchema.parse({
  id: 'c-1',
  fecha: '2024-02-01T09:00:00Z',
  diagnostico: 'Gripe',
  prescripcion: 'Paracetamol',
});

const consultaReciente = PatientConsultaLiteSchema.parse({
  id: 'c-2',
  fecha: '2024-05-20T09:00:00Z',
  diagnostico: 'Control',
  prescripcion: '',
});

describe('PatientDetailCard', () => {
  it('renders the patient name, initials, gender and active status', () => {
    // Arrange & Act
    render(<PatientDetailCard patient={patient} consultas={[]} />);

    // Assert
    expect(screen.getByRole('heading', { name: 'María González' })).toBeInTheDocument();
    expect(screen.getByText('MG')).toBeInTheDocument();
    expect(screen.getByText('Femenino')).toBeInTheDocument();
    expect(screen.getByText('Activo')).toBeInTheDocument();
  });

  it('renders the computed age', () => {
    render(<PatientDetailCard patient={patient} consultas={[]} />);
    expect(screen.getByText(`${calculateAge('1990-05-10')} años`)).toBeInTheDocument();
  });

  it('shows "Edad n/d" when the birth date is invalid', () => {
    const invalidBirth = { ...patient, fechaNacimiento: 'no-es-fecha' };
    render(<PatientDetailCard patient={invalidBirth} consultas={[]} />);
    expect(screen.getByText('Edad n/d')).toBeInTheDocument();
  });

  it('shows "Inactivo" for inactive patients', () => {
    const inactive = { ...patient, activo: false };
    render(<PatientDetailCard patient={inactive} consultas={[]} />);
    expect(screen.getByText('Inactivo')).toBeInTheDocument();
  });

  it('renders the registro rows with formatted dates', () => {
    render(<PatientDetailCard patient={patient} consultas={[]} />);

    expect(screen.getByText('#EXP-001')).toBeInTheDocument();
    expect(screen.getByText('EXP-001')).toBeInTheDocument();
    expect(screen.getByText(formatDate(patient.fechaNacimiento))).toBeInTheDocument();
    expect(screen.getByText(formatDate(patient.createdAt))).toBeInTheDocument();
  });

  it('renders the hospital expediente row only when provided', () => {
    const { rerender } = render(<PatientDetailCard patient={patient} consultas={[]} />);
    expect(screen.queryByText('Expediente hospital')).not.toBeInTheDocument();

    rerender(<PatientDetailCard patient={patient} expediente={expediente} consultas={[]} />);
    expect(screen.getByText('Expediente hospital')).toBeInTheDocument();
    expect(screen.getByText('HOSP-77')).toBeInTheDocument();
  });

  it('summarizes consultations sorted by date', () => {
    render(
      <PatientDetailCard patient={patient} consultas={[consultaVieja, consultaReciente]} />
    );

    expect(screen.getByText('2')).toBeInTheDocument();
    // Earliest consultation drives the "Desde" caption
    expect(screen.getByText(`Desde ${formatDateShort(consultaVieja.fecha)}`)).toBeInTheDocument();
    // Most recent consultation drives the "Última" stat
    expect(screen.getByText(formatDateShort(consultaReciente.fecha))).toBeInTheDocument();

    const lastConsultaDate = parseDate(consultaReciente.fecha);
    expect(lastConsultaDate).not.toBeNull();
    const expectedRelative = formatRelative(
      daysBetween(lastConsultaDate ?? new Date(), new Date())
    );
    // The same relative string can also appear in the activity footer
    expect(screen.getAllByText(expectedRelative).length).toBeGreaterThan(0);
  });

  it('shows the empty state when there are no consultations', () => {
    render(<PatientDetailCard patient={patient} consultas={[]} />);

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('Sin historial')).toBeInTheDocument();
    expect(screen.getByText('Sin consultas')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('credits the last activity author when provided', () => {
    render(
      <PatientDetailCard
        patient={patient}
        consultas={[]}
        lastActivityAuthor="Dra. Ramírez"
        lastActivityAt="2024-06-02T10:00:00Z"
      />
    );

    expect(screen.getByText('Dra. Ramírez')).toBeInTheDocument();
    expect(screen.getByText(/Última edición por/)).toBeInTheDocument();
  });

  it('falls back to a generic activity message without author', () => {
    render(<PatientDetailCard patient={patient} consultas={[]} />);
    expect(screen.getByText(/Última actualización del expediente/)).toBeInTheDocument();
  });

  it('forwards the ref and appends custom className', () => {
    const ref = createRef<HTMLElement>();
    const { container } = render(
      <PatientDetailCard ref={ref} patient={patient} consultas={[]} className="extra-class" />
    );

    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(container.firstChild).toHaveClass('extra-class');
  });
});
