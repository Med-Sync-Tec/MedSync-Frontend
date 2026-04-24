import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusBadge } from './StatusBadge';

const meta: Meta<typeof StatusBadge> = {
  title: 'UI/Badges/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    status: { control: 'select', options: ['estable', 'critico', 'en-observacion', 'alta'] },
  },
  args: { status: 'estable' },
  decorators: [
    (Story) => (
      <div className="p-4 bg-surface rounded-xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

export const Estable: Story = {};

export const Critico: Story = {
  args: { status: 'critico' },
};

export const EnObservacion: Story = {
  args: { status: 'en-observacion' },
};

export const Alta: Story = {
  args: { status: 'alta' },
};

export const AllStatuses: Story = {
  render: () => (
    <div className="flex gap-2 flex-wrap">
      <StatusBadge status="estable" />
      <StatusBadge status="critico" />
      <StatusBadge status="en-observacion" />
      <StatusBadge status="alta" />
    </div>
  ),
};
