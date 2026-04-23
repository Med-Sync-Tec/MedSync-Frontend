import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Pagination } from './Pagination';

const meta: Meta<typeof Pagination> = {
  title: 'UI/Buttons/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="p-6 bg-surface rounded-xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Pagination>;

const Interactive = ({ totalPages, initial }: { totalPages: number; initial: number }) => {
  const [page, setPage] = useState(initial);
  return <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />;
};

export const Default: Story = {
  render: () => <Interactive totalPages={12} initial={2} />,
};

export const FirstPage: Story = {
  render: () => <Interactive totalPages={12} initial={1} />,
};

export const LastPage: Story = {
  render: () => <Interactive totalPages={12} initial={12} />,
};

export const FewPages: Story = {
  render: () => <Interactive totalPages={5} initial={3} />,
};
