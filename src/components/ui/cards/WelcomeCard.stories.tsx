import type { Meta, StoryObj } from '@storybook/react-vite';
import { WelcomeCard } from './WelcomeCard';

const meta: Meta<typeof WelcomeCard> = {
  title: 'UI/Cards/WelcomeCard',
  component: WelcomeCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    doctorName: 'Dra. Elisa',
    summary: 'Tienes 8 citas programadas y 3 alertas críticas pendientes.',
  },
  decorators: [
    (Story) => (
      <div className="max-w-xl p-6 bg-gray-50 dark:bg-[#0f172a] rounded-2xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof WelcomeCard>;

export const Default: Story = {};

export const WithDate: Story = {
  args: { date: 'Lunes, 17 de abril' },
};
