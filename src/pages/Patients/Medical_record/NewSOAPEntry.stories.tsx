import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { NewSOAPEntry } from './NewSOAPEntry';

const meta = {
  title: 'Pages/NewSOAPEntry',
  component: NewSOAPEntry,
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
} satisfies Meta<typeof NewSOAPEntry>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
