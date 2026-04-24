import type { Meta, StoryObj } from '@storybook/react-vite';
import { FilterChip } from './FilterChip';

const meta: Meta<typeof FilterChip> = {
  title: 'UI/Buttons/FilterChip',
  component: FilterChip,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    label: 'Problemas cardiacos',
  },
  decorators: [
    (Story) => (
      <div className="p-6 bg-surface rounded-xl flex gap-2 flex-wrap">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FilterChip>;

export const Default: Story = {};

export const WithRemove: Story = {
  args: { onRemove: () => alert('Filtro eliminado') },
};

export const ClearSearch: Story = {
  args: { label: 'Limpiar búsqueda', onRemove: () => {} },
};

export const Multiple: Story = {
  render: () => (
    <div className="flex gap-2 flex-wrap">
      <FilterChip label="Problemas cardiacos" onRemove={() => {}} />
      <FilterChip label="Hipertensión" onRemove={() => {}} />
      <FilterChip label="Limpiar búsqueda" onRemove={() => {}} />
    </div>
  ),
};
