import type { Meta, StoryObj } from '@storybook/react';
import { SOAPModal } from './SOAPModal';

const meta = {
  title: 'Feedback/SOAPModal',
  component: SOAPModal,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof SOAPModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Close clicked'),
    date: '2024-04-20',
    doctorName: 'García Pérez',
    soap: {
      subjective: 'Paciente refiere sentirse bien, sin cefaleas ni visión borrosa.',
      objective: 'TA: 125/80 mmHg, FC: 72 lpm. Sin edemas.',
      assessment: 'Hipertensión arterial controlada.',
      plan: 'Continuar con Enalapril 10mg cada 12h. Control en 3 meses.',
    },
  },
};
