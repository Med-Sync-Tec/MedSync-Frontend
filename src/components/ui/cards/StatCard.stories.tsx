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
      <div className="w-72 p-4 bg-background rounded-2xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof StatCard>;

export const Default: Story = {};

export const NovedadesKpi: Story = {
  name: 'Novedades 48h (KPI)',
  args: {
    label: 'Novedades 48h',
    value: 100,
    icon: <span className="material-symbols-outlined text-xl">bolt</span>,
    iconBg: 'var(--color-info-subtle)',
    iconColor: 'var(--color-info)',
  },
};

export const PorEspecialidadKpi: Story = {
  name: 'Por Especialidad (KPI)',
  args: {
    label: 'Por Especialidad',
    value: 42,
    icon: <span className="material-symbols-outlined text-xl">assignment</span>,
    iconBg: 'var(--color-success-subtle)',
    iconColor: 'var(--color-success-strong)',
  },
};

export const AltaEvidenciaKpi: Story = {
  name: 'Alta Evidencia (KPI)',
  args: {
    label: 'Alta Evidencia',
    value: 94,
    icon: <span className="material-symbols-outlined text-xl">verified</span>,
    iconBg: 'var(--color-caution-subtle)',
    iconColor: 'var(--color-caution)',
  },
};

export const NoLeidosKpi: Story = {
  name: 'No Leídos (KPI)',
  args: {
    label: 'No Leídos',
    value: 100,
    icon: <span className="material-symbols-outlined text-xl">mark_as_unread</span>,
    iconBg: 'var(--color-danger-subtle)',
    iconColor: 'var(--color-danger)',
  },
};

export const ConBadge: Story = {
  name: 'Con Badge de alerta',
  args: {
    label: 'Alertas Críticas',
    value: 3,
    badge: '+2 nuevos',
    badgeVariant: 'warning',
    icon: <span className="material-symbols-outlined text-xl">warning</span>,
  },
};

export const ValorCero: Story = {
  name: 'Valor en cero',
  args: {
    label: 'Por Especialidad',
    value: 0,
    icon: <span className="material-symbols-outlined text-xl">assignment</span>,
    iconBg: 'var(--color-success-subtle)',
    iconColor: 'var(--color-success-strong)',
  },
};

export const DashboardGrid: Story = {
  name: 'Grid de Dashboard (2×2)',
  render: () => (
    <div className="grid grid-cols-2 gap-3 p-4 bg-background rounded-2xl w-[520px]">
      <StatCard
        label="Novedades 48h"
        value={100}
        icon={<span className="material-symbols-outlined text-xl">bolt</span>}
        iconBg="var(--color-info-subtle)"
        iconColor="var(--color-info)"
      />
      <StatCard
        label="Por Especialidad"
        value={0}
        icon={<span className="material-symbols-outlined text-xl">assignment</span>}
        iconBg="var(--color-success-subtle)"
        iconColor="var(--color-success-strong)"
      />
      <StatCard
        label="Alta Evidencia"
        value={94}
        icon={<span className="material-symbols-outlined text-xl">verified</span>}
        iconBg="var(--color-caution-subtle)"
        iconColor="var(--color-caution)"
      />
      <StatCard
        label="No Leídos"
        value={100}
        icon={<span className="material-symbols-outlined text-xl">mark_as_unread</span>}
        iconBg="var(--color-danger-subtle)"
        iconColor="var(--color-danger)"
      />
    </div>
  ),
};
