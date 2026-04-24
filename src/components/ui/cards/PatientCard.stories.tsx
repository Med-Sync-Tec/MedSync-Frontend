import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { PatientCard } from './PatientCard';

const meta: Meta<typeof PatientCard> = {
  title: 'UI/Cards/PatientCard',
  component: PatientCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    selected: { control: 'boolean' },
    needsAttention: { control: 'boolean' },
    status: { control: 'select', options: ['estable', 'critico', 'en-observacion', 'alta'] },
  },
  args: {
    name: 'Carlos Ruiz',
    patientId: '10234',
    status: 'estable',
    selected: false,
    needsAttention: false,
  },
  decorators: [
    (Story) => (
      <div className="w-72 p-2 bg-surface rounded-xl border border-border-subtle">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PatientCard>;

export const Default: Story = {};

export const Selected: Story = {
  args: { selected: true },
};

export const Critico: Story = {
  args: { status: 'critico', needsAttention: true },
};

export const EnObservacion: Story = {
  args: { status: 'en-observacion' },
};

export const Alta: Story = {
  args: { status: 'alta' },
};

export const NeedsAttention: Story = {
  args: { needsAttention: true },
};

const samplePatients = [
  { name: 'Carlos Ruiz', id: '10234', status: 'estable' as const, attention: false },
  { name: 'Elena Gómez', id: '10235', status: 'critico' as const, attention: true },
  { name: 'Juan Pérez Rodríguez', id: '10236', status: 'en-observacion' as const, attention: false },
  { name: 'Marta Sánchez', id: '10237', status: 'estable' as const, attention: false },
  { name: 'Sofía Castañeda', id: '10238', status: 'alta' as const, attention: false },
];

const PatientListDemo = () => {
  const [selected, setSelected] = useState('10235');
  return (
    <div className="w-72 bg-surface rounded-xl p-2 border border-border-subtle space-y-0.5">
      {samplePatients.map((p) => (
        <PatientCard
          key={p.id}
          name={p.name}
          patientId={p.id}
          status={p.status}
          needsAttention={p.attention}
          selected={selected === p.id}
          onClick={() => setSelected(p.id)}
        />
      ))}
    </div>
  );
};

export const PatientList: Story = {
  render: () => <PatientListDemo />,
};
