import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ArticleDetailDrawer } from './ArticleDetailDrawer';
import type { Article } from '../../../features/news/types';

// Artículo de muestra completo
const sampleArticle: Article = {
  id: 'art-001',
  titulo: 'Nuevo estudio vincula patrones de sueño con riesgo de arritmia en pacientes con hipertensión arterial',
  autores: 'García R., Martínez L., Sánchez P., et al.',
  revista: 'Journal of Cardiology',
  anioPub: '2024',
  mesPub: 'Oct',
  doi: '10.1016/j.jcard.2024.10.001',
  abstractText:
    'El reciente metaanálisis publicado en el Journal of Cardiology revela un cambio significativo en el paradigma del manejo de la hipertensión arterial. Los datos recopilados de más de 45,000 pacientes sugieren que una intervención farmacológica agresiva en las etapas iniciales de la pre-hipertensión reduce el riesgo de eventos cardiovasculares mayores en un 22%.\n\nLos investigadores enfatizan la importancia de la medicina personalizada, utilizando biomarcadores específicos para predecir la respuesta terapéutica. Este estudio establece las bases para las nuevas guías clínicas de 2024, priorizando la estabilidad hemodinámica a largo plazo sobre el control puntual de la presión.',
  keywords: 'arritmia, hipertensión, sueño, biomarcadores, medicina personalizada',
  tipoPublicacion: 'Journal Article',
  url: 'https://pubmed.ncbi.nlm.nih.gov/example',
  tags: [
    { id: 'tag-1', tipo: 'enfermedad', valor: 'Cardiología Clínica', createdAt: '2024-10-01T00:00:00Z' },
    { id: 'tag-2', tipo: 'tratamiento', valor: 'Antihipertensivos', createdAt: '2024-10-01T00:00:00Z' },
    { id: 'tag-3', tipo: 'sintoma', valor: 'Arritmia', createdAt: '2024-10-01T00:00:00Z' },
  ],
  createdAt: '2024-10-24T10:00:00Z',
  updatedAt: '2024-10-24T12:00:00Z',
};

const articleNoTags: Article = {
  ...sampleArticle,
  id: 'art-002',
  titulo: 'Eficacia de la dapagliflozina en pacientes con insuficiencia renal crónica estadio 3',
  autores: 'López A., Torres B.',
  revista: 'NEJM',
  tags: [],
  abstractText: 'Estudio multicéntrico que evalúa la seguridad y eficacia del uso de inhibidores SGLT-2 en pacientes con TFGe entre 25-45 mL/min/1.73m². Los resultados preliminares muestran una reducción significativa de eventos renales adversos.',
};

const articleNoUrl: Article = {
  ...sampleArticle,
  id: 'art-003',
  titulo: 'Asociación entre microbiota intestinal y desarrollo de diabetes tipo 2',
  url: '',
  tags: [
    { id: 'tag-4', tipo: 'enfermedad', valor: 'Endocrinología', createdAt: '2024-10-01T00:00:00Z' },
    { id: 'tag-5', tipo: 'medicamento', valor: 'Probióticos', createdAt: '2024-10-01T00:00:00Z' },
  ],
};

// Wrapper interactivo para controlar open/close
const DrawerWrapper = ({ article }: { article: Article }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="p-6 bg-background min-h-screen">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:opacity-90 active:scale-95 transition-all"
      >
        Abrir Detalle de Artículo
      </button>
      <p className="mt-3 text-sm text-text-muted">
        También puedes cerrar con la tecla <kbd className="px-1.5 py-0.5 rounded bg-surface-subtle text-xs font-mono border border-border-strong">Esc</kbd> o haciendo click afuera.
      </p>
      <ArticleDetailDrawer
        article={open ? article : null}
        onClose={() => setOpen(false)}
      />
    </div>
  );
};

const meta: Meta<typeof ArticleDetailDrawer> = {
  title: 'UI/Cards/ArticleDetailDrawer',
  component: ArticleDetailDrawer,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof ArticleDetailDrawer>;

export const Cardiologia: Story = {
  render: () => <DrawerWrapper article={sampleArticle} />,
  name: 'Cardiología (Alta Confianza)',
};

export const SinTags: Story = {
  render: () => <DrawerWrapper article={articleNoTags} />,
  name: 'Sin Tags (Baja Confianza)',
};

export const SinURL: Story = {
  render: () => <DrawerWrapper article={articleNoUrl} />,
  name: 'Endocrinología (Sin URL externa)',
};

export const NeurologiaMedia: Story = {
  render: () => (
    <DrawerWrapper
      article={{
        ...sampleArticle,
        id: 'art-004',
        titulo: 'Biomarcadores en líquido cefalorraquídeo como predictores de enfermedad de Alzheimer temprana',
        revista: 'Neurology',
        tags: [
          { id: 'tag-6', tipo: 'sintoma', valor: 'Neurología', createdAt: '2024-10-01T00:00:00Z' },
        ],
      }}
    />
  ),
  name: 'Neurología (Confianza Media)',
};

export const FarmacologiaAlta: Story = {
  render: () => (
    <DrawerWrapper
      article={{
        ...sampleArticle,
        id: 'art-005',
        titulo: 'Interacciones farmacológicas de nueva generación en terapia oncológica combinada',
        revista: 'Clinical Pharmacology & Therapeutics',
        tags: [
          { id: 'tag-7', tipo: 'medicamento', valor: 'Farmacología', createdAt: '2024-10-01T00:00:00Z' },
          { id: 'tag-8', tipo: 'tratamiento', valor: 'Oncología', createdAt: '2024-10-01T00:00:00Z' },
          { id: 'tag-9', tipo: 'enfermedad', valor: 'Cáncer', createdAt: '2024-10-01T00:00:00Z' },
        ],
      }}
    />
  ),
  name: 'Farmacología (Alta Confianza)',
};
