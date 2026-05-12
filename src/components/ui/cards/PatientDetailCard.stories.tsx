import type { Meta, StoryObj } from '@storybook/react-vite';
import { PatientDetailCard } from './PatientDetailCard';
import type { Expediente, Patient, PatientConsultaLite } from '@features/patients/types';

const basePatient: Patient = {
  id: 'p-001',
  expedienteExternoId: 'HG-2024-10234',
  nombre: 'Carlos Eduardo Méndez',
  fechaNacimiento: '1967-08-22',
  genero: 'Masculino',
  medicoId: 'doc-004',
  activo: true,
  createdAt: '2022-01-14T08:15:00Z',
  updatedAt: '2025-11-02T14:30:00Z',
};

const baseExpediente: Expediente = {
  id: 'exp-001',
  pacienteExternoId: 'HG-2024-10234',
  doctorResponsableId: 'doc-004',
  createdAt: '2022-01-14T08:20:00Z',
};

const baseConsultas: PatientConsultaLite[] = [
  {
    id: '1',
    fecha: '2024-03-15T10:00:00Z',
    diagnostico: 'Hipertensión arterial controlada',
    prescripcion: 'Enalapril 10 mg cada 12 horas',
  },
  {
    id: '2',
    fecha: '2024-02-10T09:30:00Z',
    diagnostico: 'Faringoamigdalitis viral aguda',
    prescripcion: 'Paracetamol 500 mg cada 8 horas por 3 días',
  },
  {
    id: '3',
    fecha: '2024-01-05T11:15:00Z',
    diagnostico: 'Hipertensión arterial controlada',
    prescripcion: 'Continuar Enalapril 10 mg cada 12 horas',
  },
];

const meta: Meta<typeof PatientDetailCard> = {
  title: 'UI/Cards/PatientDetailCard',
  component: PatientDetailCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    patient: basePatient,
    expediente: baseExpediente,
    consultas: baseConsultas,
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm bg-background p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PatientDetailCard>;

export const Activo: Story = {};

export const Inactivo: Story = {
  args: { patient: { ...basePatient, activo: false } },
};

export const SinExpediente: Story = {
  args: { expediente: undefined },
};

export const SinConsultas: Story = {
  args: { consultas: [] },
};

export const UnaConsulta: Story = {
  args: { consultas: [baseConsultas[0]] },
};

export const PacienteMayor: Story = {
  args: {
    patient: {
      ...basePatient,
      nombre: 'María Teresa Hernández',
      fechaNacimiento: '1942-02-11',
      genero: 'Femenino',
    },
  },
};
