import type { Meta, StoryObj } from '@storybook/react-vite';
import { LoginForm } from './LoginForm';

const meta: Meta<typeof LoginForm> = {
  title: 'Auth/LoginForm',
  component: LoginForm,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-[460px] p-8 bg-white dark:bg-[#1e293b] rounded-2xl shadow-xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof LoginForm>;

export const Default: Story = {};

export const Hint: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Credenciales válidas para la demo: admin@medsync.com / 123456. Otras combinaciones muestran el Alert de error.',
      },
    },
  },
};
