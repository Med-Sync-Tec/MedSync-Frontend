import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChatInput } from './ChatInput';

const meta: Meta<typeof ChatInput> = {
  title: 'UI/Inputs/ChatInput',
  component: ChatInput,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-96 p-4 bg-white dark:bg-[#1e293b] rounded-xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ChatInput>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true },
};
