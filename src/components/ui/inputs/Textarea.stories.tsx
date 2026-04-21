import type { Meta, StoryObj } from '@storybook/react-vite';
import { Textarea } from './Textarea';

const meta: Meta<typeof Textarea> = {
  title: 'UI/Inputs/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  args: {
    label: 'Subjetivo',
    id: 'soap-s',
    placeholder: 'El paciente refiere dolor de cabeza persistente desde hace 3 días...',
  },
  decorators: [
    (Story) => (
      <div className="w-96 p-6 bg-white dark:bg-[#1e293b] rounded-xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { defaultValue: 'Paciente refiere cefalea intensa desde hace 2 días, sin náuseas.' },
};

export const WithError: Story = {
  args: { error: 'Este campo es obligatorio' },
};

export const NoLabel: Story = {
  args: { label: undefined, placeholder: 'Escribe aquí...' },
};
