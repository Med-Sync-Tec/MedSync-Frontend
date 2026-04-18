import type { Meta, StoryObj } from '@storybook/react-vite';
import { CounterBadge } from './CounterBadge';

const meta: Meta<typeof CounterBadge> = {
  title: 'UI/Badges/CounterBadge',
  component: CounterBadge,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: { control: 'select', options: ['info', 'warning', 'success'] },
  },
  args: { text: '+2 nuevos', variant: 'info' },
  decorators: [
    (Story) => (
      <div className="p-4 bg-white dark:bg-[#1e293b] rounded-xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CounterBadge>;

export const NewItems: Story = {};

export const NextAppointment: Story = {
  args: { text: 'Prox: 10:00 AM', variant: 'success' },
};

export const Warning: Story = {
  args: { text: '+5 urgentes', variant: 'warning' },
};
