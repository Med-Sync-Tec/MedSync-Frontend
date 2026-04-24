import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import { Header } from './Header';
import { useAuthStore } from '@features/auth/store';

const meta: Meta<typeof Header> = {
  title: 'UI/Navigation/Header',
  component: Header,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    role: { control: 'radio', options: ['doctor', 'coo'] },
    notificationCount: { control: 'number' },
    activeLink: {
      control: 'select',
      options: ['Inicio', 'Pacientes', 'Noticias Guardadas', 'Inventario', 'Reportes'],
    },
  },
  args: {
    role: 'doctor',
    activeLink: 'Inicio',
    notificationCount: 0,
  },
  decorators: [
    (Story) => {
      useEffect(() => {
        useAuthStore.setState({
          user: {
            id: 'demo-1',
            name: 'Dra. Ana Martínez',
            email: 'ana.martinez@medsync.mx',
            role: 'DOCTOR',
          },
        });
      }, []);
      return (
        <div className="bg-background min-h-[240px]">
          <Story />
          <div className="mx-auto max-w-[1400px] px-6 py-6 text-xs text-text-subtle">
            Contenido de ejemplo debajo del header.
          </div>
        </div>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof Header>;

export const DoctorDefault: Story = {};

export const DoctorActivePacientes: Story = {
  args: { activeLink: 'Pacientes' },
};

export const DoctorWithNotifications: Story = {
  args: { notificationCount: 3 },
};

export const DoctorManyNotifications: Story = {
  args: { notificationCount: 12 },
};

export const COODefault: Story = {
  args: { role: 'coo', activeLink: 'Inventario' },
};

export const WithoutUser: Story = {
  decorators: [
    (Story) => {
      useEffect(() => {
        useAuthStore.setState({ user: null });
      }, []);
      return <Story />;
    },
  ],
};
