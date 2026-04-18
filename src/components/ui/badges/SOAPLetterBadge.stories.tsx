import type { Meta, StoryObj } from '@storybook/react-vite';
import { SOAPLetterBadge } from './SOAPLetterBadge';

const meta: Meta<typeof SOAPLetterBadge> = {
  title: 'UI/Badges/SOAPLetterBadge',
  component: SOAPLetterBadge,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    section: { control: 'select', options: ['S', 'O', 'A', 'P'] },
  },
  args: { section: 'S', title: 'Subjetivo' },
  decorators: [
    (Story) => (
      <div className="p-6 bg-white dark:bg-[#1e293b] rounded-xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SOAPLetterBadge>;

export const Subjetivo: Story = {};

export const Objetivo: Story = {
  args: { section: 'O', title: 'Objetivo' },
};

export const Analisis: Story = {
  args: { section: 'A', title: 'Análisis' },
};

export const Plan: Story = {
  args: { section: 'P', title: 'Plan' },
};

export const AllSections: Story = {
  render: () => (
    <div className="space-y-4">
      <SOAPLetterBadge section="S" title="Subjetivo" />
      <SOAPLetterBadge section="O" title="Objetivo" />
      <SOAPLetterBadge section="A" title="Análisis" />
      <SOAPLetterBadge section="P" title="Plan" />
    </div>
  ),
};
