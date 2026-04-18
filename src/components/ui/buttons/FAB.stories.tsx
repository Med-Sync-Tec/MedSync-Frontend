import type { Meta, StoryObj } from '@storybook/react-vite';
import { FAB } from './FAB';

const meta: Meta<typeof FAB> = {
  title: 'UI/Buttons/FAB',
  component: FAB,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    label: 'Preguntar a MediBot IA',
  },
};

export default meta;
type Story = StoryObj<typeof FAB>;

export const MediBotDoctor: Story = {};

export const MediBotCOO: Story = {
  args: { label: 'Preguntar a MediBot COO' },
};

export const Disabled: Story = {
  args: { disabled: true, label: 'Preguntar a MediBot IA' },
};
