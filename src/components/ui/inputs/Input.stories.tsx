import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input, PasswordInput } from './Input';

const meta: Meta<typeof Input> = {
  title: 'UI/Inputs/Input',
  component: Input,
  tags: ['autodocs'],
  args: {
    label: 'Correo electrónico',
    id: 'email',
    name: 'email',
    type: 'email',
    placeholder: 'tucorreo@ejemplo.com',
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
type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { defaultValue: 'admin@medsync.com' },
};

export const WithError: Story = {
  args: {
    error: 'Este campo es obligatorio',
    defaultValue: '',
  },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'bloqueado@medsync.com' },
};

export const Password: StoryObj<typeof PasswordInput> = {
  render: (args) => <PasswordInput {...args} />,
  args: {
    label: 'Contraseña',
    id: 'password',
    name: 'password',
    placeholder: 'Ingresa tu contraseña',
  },
};

export const PasswordWithError: StoryObj<typeof PasswordInput> = {
  render: (args) => <PasswordInput {...args} />,
  args: {
    label: 'Contraseña',
    id: 'password',
    name: 'password',
    placeholder: 'Ingresa tu contraseña',
    error: 'La contraseña debe tener al menos 6 caracteres',
  },
};
