import type { Meta, StoryObj } from '@storybook/react';
import { FileUploadZone } from './FileUploadZone';

const meta = {
  title: 'Inputs/FileUploadZone',
  component: FileUploadZone,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof FileUploadZone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
