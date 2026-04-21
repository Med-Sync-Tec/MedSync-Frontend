import type { Meta, StoryObj } from '@storybook/react';
import { ConsultationCard } from './ConsultationCard';

const meta = {
  title: 'Cards/ConsultationCard',
  component: ConsultationCard,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof ConsultationCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const General: Story = {
  args: {
    consultation: {
      id: '1',
      date: '2024-03-15T10:00:00Z',
      reason: 'Control de Hipertensión',
      diagnosis: 'Hipertensión arterial controlada, ajuste leve de dosis.',
      type: 'general',
    },
    onViewSOAP: (id) => console.log('Ver SOAP', id),
  },
};

export const Especialista: Story = {
  args: {
    consultation: {
      id: '2',
      date: '2024-03-15T10:00:00Z',
      reason: 'Evaluación Cardiológica',
      diagnosis: 'Soplo sistólico grado I.',
      type: 'especialista',
    },
    onViewSOAP: (id) => console.log('Ver SOAP', id),
  },
};

export const Seguimiento: Story = {
  args: {
    consultation: {
      id: '3',
      date: '2024-03-15T10:00:00Z',
      reason: 'Chequeo Mensual',
      diagnosis: 'Paciente estable.',
      type: 'seguimiento',
    },
    onViewSOAP: (id) => console.log('Ver SOAP', id),
  },
};
