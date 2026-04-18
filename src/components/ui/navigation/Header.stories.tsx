import type { Meta, StoryObj } from '@storybook/react-vite';
import { Header } from './Header';

const meta: Meta<typeof Header> = {
  title: 'UI/Navigation/Header',
  component: Header,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    role: { control: 'radio', options: ['doctor', 'coo'] },
    notificationCount: { control: 'number' },
  },
  args: {
    role: 'doctor',
    activeLink: 'Inicio',
    notificationCount: 0,
  },
};

export default meta;
type Story = StoryObj<typeof Header>;

export const DoctorDefault: Story = {};

export const DoctorWithNotifications: Story = {
  args: { notificationCount: 3 },
};

export const DoctorPacientesActive: Story = {
  args: { activeLink: 'Pacientes' },
};

export const COODefault: Story = {
  args: { role: 'coo' },
};

export const COOWithNotifications: Story = {
  args: { role: 'coo', notificationCount: 7 },
};
