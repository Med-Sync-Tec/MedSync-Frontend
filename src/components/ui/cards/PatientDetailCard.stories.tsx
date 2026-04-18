import type { Meta, StoryObj } from '@storybook/react-vite';
import { PatientDetailCard } from './PatientDetailCard';

const defaultArgs = {
  patientName: 'Carlos Eduardo Méndez',
  status: 'estable' as const,
  personalInfo: { age: 58, gender: 'Masculino', phone: '+52 55 1234 5678', email: 'carlos.mendez@email.com' },
  medicalHistory: {
    chronicConditions: ['Hipertensión', 'Diabetes tipo 2'],
    allergies: ['Penicilina', 'Ibuprofeno'],
  },
  treatments: [
    { name: 'Enalapril', dose: '10mg', instructions: '1 tableta cada 12 horas' },
    { name: 'Metformina', dose: '500mg', instructions: '1 tableta con cada comida' },
  ],
  vitalStats: { bloodPressure: '120/80', bpm: 72, weight: 78, o2Sat: 98 },
};

const meta: Meta<typeof PatientDetailCard> = {
  title: 'UI/Cards/PatientDetailCard',
  component: PatientDetailCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: defaultArgs,
  argTypes: {
    status: { control: 'select', options: ['estable', 'critico', 'en-observacion', 'alta'] },
  },
};

export default meta;
type Story = StoryObj<typeof PatientDetailCard>;

export const Estable: Story = {};

export const Critico: Story = {
  args: { status: 'critico' },
};

export const EnObservacion: Story = {
  args: { status: 'en-observacion' },
};
