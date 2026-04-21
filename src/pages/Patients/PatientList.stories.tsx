import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { PatientList } from './PatientList';

const meta = {
  title: 'Pages/PatientList',
  component: PatientList,
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
} satisfies Meta<typeof PatientList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
