import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ArticleCard } from './ArticleCard';
import { ArticleDetailDrawer } from './ArticleDetailDrawer';
import type { Article } from '../../../features/news/types';

const SAMPLE_ARTICLE: Article = {
  id: 'art-demo-001',
  titulo: 'Nuevo protocolo de tratamiento para insuficiencia cardíaca con fracción de eyección reducida',
  autores: 'Rodríguez G., Fernández M., et al.',
  revista: 'NEJM',
  anioPub: '2026',
  mesPub: 'Jan',
  doi: '10.1056/NEJMoa2600001',
  abstractText:
    'Un estudio reciente publicado en el New England Journal of Medicine demuestra que la combinación de sacubitrilo/valsartán con dapagliflozina reduce significativamente la mortalidad cardiovascular en un 27% a 18 meses de seguimiento.',
  keywords: 'insuficiencia cardíaca, sacubitrilo, dapagliflozina, mortalidad cardiovascular',
  tipoPublicacion: 'Journal Article',
  url: 'https://pubmed.ncbi.nlm.nih.gov/demo',
  tags: [
    { id: 'tag-1', tipo: 'enfermedad', valor: 'Cardiología', createdAt: '2026-01-01T00:00:00Z' },
    { id: 'tag-2', tipo: 'tratamiento', valor: 'Cardiofármacos', createdAt: '2026-01-01T00:00:00Z' },
    { id: 'tag-3', tipo: 'medicamento', valor: 'Sacubitrilo', createdAt: '2026-01-01T00:00:00Z' },
  ],
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: '2026-01-15T12:00:00Z',
};

const meta: Meta<typeof ArticleCard> = {
  title: 'UI/Cards/ArticleCard',
  component: ArticleCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'radio', options: ['full', 'compact'] },
    saved: { control: 'boolean' },
    categoryType: {
      control: 'select',
      options: ['cardiologia', 'farmacologia', 'endocrinologia', 'infecciosas', 'neurologia', 'default'],
    },
  },
  args: {
    category: 'Cardiología',
    categoryType: 'cardiologia',
    timestamp: 'Hace 2 horas',
    title: 'Nuevo protocolo de tratamiento para insuficiencia cardíaca con fracción de eyección reducida',
    excerpt:
      'Un estudio reciente demuestra que la combinación de sacubitrilo/valsartán con dapagliflozina reduce significativamente la mortalidad cardiovascular.',
    source: 'NEJM • 2026',
    matchText: '32 Coincidencias',
    variant: 'full',
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl p-4 bg-background rounded-2xl">
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

export const WithUrl: Story = {
  name: 'Con URL (enlace externo)',
  args: {},
};

export const WithAlert: Story = {
  name: 'Con Alerta crítica',
  args: {
    matchText: 'Alerta: Inmunocomprometidos',
    matchVariant: 'alert',
    category: 'Infecciosas',
    categoryType: 'infecciosas',
  },
};

export const Neurologia: Story = {
  args: {
    category: 'Neurología',
    categoryType: 'neurologia',
    title: 'Biomarcadores en LCR como predictores tempranos de Alzheimer',
    excerpt: 'Nuevos marcadores en líquido cefalorraquídeo permiten detectar con 91% de precisión la enfermedad 5 años antes de los síntomas.',
    source: 'Neurology • 2026',
    matchText: '18 Coincidencias',
  },
};

export const Farmacologia: Story = {
  args: {
    category: 'Farmacología',
    categoryType: 'farmacologia',
    title: 'Interacciones de nueva generación en terapia oncológica combinada con inhibidores de checkpoint',
    excerpt: 'Revisión sistemática de 1,200 casos reportados en la base de datos internacional de farmacovigilancia.',
    source: 'Clinical Pharmacology • 2025',
    matchText: '5 Coincidencias',
  },
};

export const Compact: Story = {
  args: { variant: 'compact' },
};

export const CompactSaved: Story = {
  args: { variant: 'compact', saved: true },
};

// Historia interactiva con drawer integrado
const WithDrawerDemo = () => {
  const [selected, setSelected] = useState<Article | null>(null);
  const [saved, setSaved] = useState(false);

  return (
    <div className="max-w-2xl space-y-3">
      <p className="text-sm text-text-muted mb-4">
        Haz click en la tarjeta para abrir el drawer de detalle. El botón de guardar no propaga el click al drawer.
      </p>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setSelected(SAMPLE_ARTICLE)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelected(SAMPLE_ARTICLE); }}
        className="cursor-pointer"
      >
        <ArticleCard
          category="Cardiología"
          categoryType="cardiologia"
          timestamp="Hace 2 horas"
          title={SAMPLE_ARTICLE.titulo}
          excerpt={SAMPLE_ARTICLE.abstractText}
          source="NEJM • 2026"
          matchText="32 Coincidencias"
          saved={saved}
          onSave={(e) => { e?.stopPropagation(); setSaved((p) => !p); }}
        />
      </div>
      <ArticleDetailDrawer
        article={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
};

export const WithDrawer: Story = {
  name: 'Con Drawer de Detalle (interactivo)',
  render: () => <WithDrawerDemo />,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-background p-6">
        <Story />
      </div>
    ),
  ],
};
