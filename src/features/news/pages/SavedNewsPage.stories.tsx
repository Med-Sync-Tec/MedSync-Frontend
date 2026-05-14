import type { Meta, StoryObj } from '@storybook/react-vite';
import { SavedNewsPage } from './SavedNewsPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

const queryClient = new QueryClient();

const meta = {
  title: 'Pages/News/SavedNewsPage',
  component: SavedNewsPage,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof SavedNewsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
