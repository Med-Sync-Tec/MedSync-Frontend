import type { Meta, StoryObj } from '@storybook/react-vite';
import { TabButton } from './TabButton';

const meta: Meta<typeof TabButton> = {
  title: 'UI/Buttons/TabButton',
  component: TabButton,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    active: { control: 'boolean' },
    count: { control: 'number' },
  },
  args: {
    label: 'Cardiología',
    count: 142,
    active: false,
  },
  decorators: [
    (Story) => (
      <div className="p-6 bg-gray-50 dark:bg-[#0f172a] rounded-xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TabButton>;

export const Default: Story = {};

export const Active: Story = {
  args: { active: true },
};

export const Cardiology: Story = {
  args: {
    label: 'Cardiología',
    count: 142,
    icon: <span className="material-symbols-outlined text-base">favorite</span>,
  },
};

export const Alerts: Story = {
  args: {
    label: 'Alertas',
    count: 12,
    active: true,
    icon: <span className="material-symbols-outlined text-base">warning</span>,
  },
};
