import type { Meta, StoryObj } from '@storybook/react-vite';
import { IARecommendationModal } from './IARecommendationModal';

const meta: Meta<typeof IARecommendationModal> = {
  title: 'UI/Cards/IARecommendationModal',
  component: IARecommendationModal,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    status: { control: 'radio', options: ['loading', 'normal', 'critical'] },
  },
  args: {
    status: 'normal',
    recommendation:
      'Basado en los síntomas descritos y el historial del paciente, se recomienda ajustar la dosis de Enalapril a 20mg diarios y programar un electrocardiograma de control en los próximos 7 días.',
    onAccept: () => {},
    onReject: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof IARecommendationModal>;

export const Normal: Story = {};

export const Loading: Story = {
  args: { status: 'loading', recommendation: undefined },
};

export const Critical: Story = {
  args: {
    status: 'critical',
    recommendation:
      'ALERTA: Se detecta posible interacción medicamentosa severa entre Warfarina y el AINE prescrito. Se recomienda suspender el AINE inmediatamente y consultar con el especialista.',
  },
};
