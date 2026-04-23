import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatCard } from './StatCard';

const meta: Meta<typeof StatCard> = {
  title: 'UI/Cards/StatCard',
  component: StatCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    label: 'Citas de Hoy',
    value: 8,
    icon: <span className="material-symbols-outlined text-xl">calendar_today</span>,
  },
  decorators: [
    (Story) => (
      <div className="w-52 p-4 bg-background rounded-2xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof StatCard>;

export const Default: Story = {};

export const AlertasCriticas: Story = {
  args: {
    label: 'Alertas Críticas',
    value: 3,
    badge: '+2 nuevos',
    badgeVariant: 'warning',
    icon: <span className="material-symbols-outlined text-xl">warning</span>,
  },
};

export const Coincidencias: Story = {
  args: {
    label: 'Coincidencias',
    value: 28,
    icon: <span className="material-symbols-outlined text-xl">people</span>,
  },
};

export const CitasConBadge: Story = {
  args: {
    label: 'Citas de Hoy',
    value: 8,
    badge: 'Prox: 10:00 AM',
    badgeVariant: 'success',
    icon: <span className="material-symbols-outlined text-xl">calendar_today</span>,
  },
};

export const Pendientes: Story = {
  args: {
    label: 'Pendientes',
    value: 5,
    icon: <span className="material-symbols-outlined text-xl">pending_actions</span>,
  },
};

export const DashboardRow: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-4 p-4 bg-background rounded-2xl">
      <StatCard
        label="Alertas Críticas"
        value={3}
        badge="+2 nuevos"
        badgeVariant="warning"
        icon={<span className="material-symbols-outlined text-xl">warning</span>}
      />
      <StatCard
        label="Coincidencias"
        value={28}
        icon={<span className="material-symbols-outlined text-xl">people</span>}
      />
      <StatCard
        label="Citas de Hoy"
        value={8}
        badge="Prox: 10:00 AM"
        badgeVariant="success"
        icon={<span className="material-symbols-outlined text-xl">calendar_today</span>}
      />
      <StatCard
        label="Pendientes"
        value={5}
        icon={<span className="material-symbols-outlined text-xl">pending_actions</span>}
      />
    </div>
  ),
};
