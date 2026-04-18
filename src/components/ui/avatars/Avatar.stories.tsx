import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'UI/Avatars/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
  args: { name: 'Carlos Ruiz', size: 'md' },
  decorators: [
    (Story) => (
      <div className="p-4 bg-white dark:bg-[#1e293b] rounded-xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {};

export const Small: Story = {
  args: { size: 'sm', name: 'Elena Gómez' },
};

export const Large: Story = {
  args: { size: 'lg', name: 'Juan Pérez' },
};

export const MultiplePatients: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar name="Carlos Ruiz" />
      <Avatar name="Elena Gómez" />
      <Avatar name="Juan Pérez" />
      <Avatar name="Marta Sánchez" />
    </div>
  ),
};
