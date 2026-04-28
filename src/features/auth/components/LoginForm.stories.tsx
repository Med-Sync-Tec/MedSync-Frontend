import type { Meta, StoryObj } from '@storybook/react-vite';
import { LoginForm } from './LoginForm';

const meta: Meta<typeof LoginForm> = {
  title: 'Auth/LoginForm',
  component: LoginForm,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-[460px] p-8 bg-surface rounded-2xl shadow-xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof LoginForm>;

export const Default: Story = {
  args: { role: 'doctor' },
};

export const AsCoo: Story = {
  args: { role: 'coo' },
  parameters: {
    docs: {
      description: {
        story:
          'El backend valida que el usuario autenticado tenga rol COO. Si no coincide, devuelve 403.',
      },
    },
  },
};

export const Hint: Story = {
  args: { role: 'doctor' },
  parameters: {
    docs: {
      description: {
        story:
          'Credenciales válidas para la demo: admin@medsync.com / 123456. Otras combinaciones muestran el Alert de error.',
      },
    },
  },
};
