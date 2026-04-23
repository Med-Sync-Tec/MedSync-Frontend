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
  },
  args: { name: 'Carlos Ruiz', patientId: '10234', selected: false },
  decorators: [
    (Story) => (
      <div className="w-64 p-2 bg-surface rounded-xl">
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

const patientList = [
  { name: 'Carlos Ruiz', id: '10234' },
  { name: 'Elena Gómez', id: '10235' },
  { name: 'Juan Pérez', id: '10236' },
  { name: 'Marta Sánchez', id: '10237' },
];

const PatientListDemo = () => {
  const [selected, setSelected] = useState('10234');
  return (
    <div className="w-64 bg-surface rounded-xl p-2 space-y-1">
      {patientList.map((p) => (
        <PatientCard
          key={p.id}
          name={p.name}
          patientId={p.id}
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
