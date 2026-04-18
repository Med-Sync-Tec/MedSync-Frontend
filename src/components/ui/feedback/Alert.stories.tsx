import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert } from './Alert';

const meta: Meta<typeof Alert> = {
  title: 'UI/Feedback/Alert',
  component: Alert,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    type: { control: 'radio', options: ['error', 'success'] },
  },
  args: {
    type: 'success',
    message: '¡Inicio de sesión exitoso! Redirigiendo a tu panel de control...',
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Success: Story = {};

export const Error: Story = {
  args: {
    type: 'error',
    message: 'Correo electrónico o contraseña incorrectos. Por favor, inténtalo de nuevo.',
  },
};

export const LongMessage: Story = {
  args: {
    type: 'error',
    message:
      'El servidor está tardando más de lo habitual. Verifica tu conexión a internet y vuelve a intentarlo en unos segundos.',
  },
};
