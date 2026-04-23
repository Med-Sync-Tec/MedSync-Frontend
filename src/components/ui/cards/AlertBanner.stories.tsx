import type { Meta, StoryObj } from '@storybook/react-vite';
import { AlertBanner } from './AlertBanner';

const meta: Meta<typeof AlertBanner> = {
  title: 'UI/Cards/AlertBanner',
  component: AlertBanner,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    type: { control: 'radio', options: ['info', 'warning', 'tip'] },
  },
  args: {
    type: 'tip',
    message: 'Recuerde actualizar el historial médico del paciente antes de la próxima consulta.',
  },
  decorators: [
    (Story) => (
      <div className="max-w-lg p-4 bg-surface rounded-xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AlertBanner>;

export const Tip: Story = {};

export const Warning: Story = {
  args: {
    type: 'warning',
    message: 'El paciente tiene alergia a la Penicilina. Verifique el tratamiento prescrito.',
  },
};

export const Info: Story = {
  args: {
    type: 'info',
    message: 'Próxima cita programada para el 20 de abril a las 10:00 AM.',
  },
};
