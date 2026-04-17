import type { Meta, StoryObj } from '@storybook/react-vite';
import { Login } from './Login';

const meta: Meta<typeof Login> = {
  title: 'Pages/Login',
  component: Login,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof Login>;

export const Default: Story = {};
