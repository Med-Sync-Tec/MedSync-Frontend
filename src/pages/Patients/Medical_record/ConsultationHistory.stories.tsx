import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { ConsultationHistory } from './ConsultationHistory';

const meta = {
  title: 'Pages/ConsultationHistory',
  component: ConsultationHistory,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ConsultationHistory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
