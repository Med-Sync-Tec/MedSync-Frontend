import type { Meta, StoryObj } from '@storybook/react-vite';
import { MatchTag } from './MatchTag';

const meta: Meta<typeof MatchTag> = {
  title: 'UI/Badges/MatchTag',
  component: MatchTag,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: { control: 'radio', options: ['normal', 'alert'] },
  },
  args: { text: '32 Coincidencias', variant: 'normal' },
  decorators: [
    (Story) => (
      <div className="p-4 bg-white dark:bg-[#1e293b] rounded-xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MatchTag>;

export const Coincidencias: Story = {};

export const MayorCoincidencia: Story = {
  args: { text: 'Mayor Coincidencia: 4' },
};

export const AlertaInmuno: Story = {
  args: { text: 'Alerta: Inmunocomprometidos', variant: 'alert' },
};
