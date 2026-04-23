import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArticleCard } from './ArticleCard';

const meta: Meta<typeof ArticleCard> = {
  title: 'UI/Cards/ArticleCard',
  component: ArticleCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'radio', options: ['full', 'compact'] },
    saved: { control: 'boolean' },
  },
  args: {
    category: 'Cardiología',
    categoryType: 'cardiologia',
    timestamp: 'Hace 2 horas',
    title: 'Nuevo protocolo de tratamiento para insuficiencia cardíaca con fracción de eyección reducida',
    excerpt: 'Un estudio reciente publicado en el New England Journal of Medicine demuestra que la combinación de sacubitrilo/valsartán con dapagliflozina reduce significativamente la mortalidad cardiovascular.',
    source: 'NEJM • 2026',
    matchText: '32 Coincidencias',
    variant: 'full',
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm p-4 bg-background rounded-2xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ArticleCard>;

export const Full: Story = {};

export const Saved: Story = {
  args: { saved: true },
};

export const WithAlert: Story = {
  args: {
    matchText: 'Alerta: Inmunocomprometidos',
    matchVariant: 'alert',
    category: 'Infecciosas',
    categoryType: 'infecciosas',
  },
};

export const Compact: Story = {
  args: { variant: 'compact' },
};

export const CompactSaved: Story = {
  args: { variant: 'compact', saved: true },
};
