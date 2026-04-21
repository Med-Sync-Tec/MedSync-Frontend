import type { Meta, StoryObj } from '@storybook/react-vite';
import { CategoryTag } from './CategoryTag';

const meta: Meta<typeof CategoryTag> = {
  title: 'UI/Badges/CategoryTag',
  component: CategoryTag,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { label: 'Cardiología', category: 'cardiologia' },
  decorators: [
    (Story) => (
      <div className="p-4 bg-white dark:bg-[#1e293b] rounded-xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CategoryTag>;

export const Cardiologia: Story = {};

export const Farmacologia: Story = {
  args: { label: 'Farmacología', category: 'farmacologia' },
};

export const Endocrinologia: Story = {
  args: { label: 'Endocrinología', category: 'endocrinologia' },
};

export const Infecciosas: Story = {
  args: { label: 'Infecciosas', category: 'infecciosas' },
};

export const Neurologia: Story = {
  args: { label: 'Neurología', category: 'neurologia' },
};

export const AllCategories: Story = {
  render: () => (
    <div className="flex gap-2 flex-wrap">
      <CategoryTag label="Cardiología" category="cardiologia" />
      <CategoryTag label="Farmacología" category="farmacologia" />
      <CategoryTag label="Endocrinología" category="endocrinologia" />
      <CategoryTag label="Infecciosas" category="infecciosas" />
      <CategoryTag label="Neurología" category="neurologia" />
    </div>
  ),
};
