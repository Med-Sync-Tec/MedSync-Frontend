import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconButton } from './IconButton';

const meta: Meta<typeof IconButton> = {
  title: 'UI/Buttons/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  args: {
    icon: <span className="material-symbols-outlined text-[22px]">dark_mode</span>,
    title: 'Cambiar tema',
  },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const DarkModeToggle: Story = {};

export const LightMode: Story = {
  args: {
    icon: <span className="material-symbols-outlined text-[22px]">light_mode</span>,
    title: 'Cambiar a modo claro',
  },
};

export const Notifications: Story = {
  args: {
    icon: <span className="material-symbols-outlined text-[22px]">notifications</span>,
    title: 'Notificaciones',
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};
