import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { RoleSelector, type RoleType } from './RoleSelector';

const meta: Meta<typeof RoleSelector> = {
  title: 'UI/Selectors/RoleSelector',
  component: RoleSelector,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[460px] p-6 bg-white dark:bg-[#1e293b] rounded-xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RoleSelector>;

const Interactive = (args: { role: RoleType }) => {
  const [role, setRole] = useState<RoleType>(args.role);
  return <RoleSelector role={role} onChange={setRole} />;
};

export const DoctorSelected: Story = {
  render: () => <Interactive role="doctor" />,
};

export const COOSelected: Story = {
  render: () => <Interactive role="coo" />,
};
