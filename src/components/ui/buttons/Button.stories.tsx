import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Buttons/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline'],
    },
    fullWidth: { control: 'boolean' },
    isLoading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    children: 'Iniciar Sesión',
    variant: 'primary',
    fullWidth: false,
    isLoading: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { variant: 'primary' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Cancelar' },
};

export const Outline: Story = {
  args: { variant: 'outline', children: 'Ver más' },
};

export const FullWidth: Story = {
  args: { fullWidth: true, children: 'Continuar' },
  parameters: { layout: 'padded' },
};

export const Loading: Story = {
  args: { isLoading: true, fullWidth: true, children: 'Iniciando sesión...' },
};

export const Disabled: Story = {
  args: { disabled: true, children: 'No disponible' },
};

export const WithIcon: Story = {
  args: {
    children: 'Guardar',
    icon: <span className="material-symbols-outlined text-lg">save</span>,
  },
};
