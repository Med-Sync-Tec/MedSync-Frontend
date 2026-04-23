import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChatCard } from './ChatCard';

const meta: Meta<typeof ChatCard> = {
  title: 'UI/Cards/ChatCard',
  component: ChatCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    title: 'MediBot IA',
    onClose: () => {},
  },
  decorators: [
    (Story) => (
      <div className="p-6 bg-gray-100 dark:bg-background rounded-2xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ChatCard>;

export const Empty: Story = {};

export const WithMessages: Story = {
  args: {
    initialMessages: [
      { id: '1', role: 'bot', text: '¡Hola! Soy MediBot. ¿En qué puedo ayudarte hoy?' },
      { id: '2', role: 'user', text: '¿Cuáles son los efectos secundarios del Enalapril?' },
      { id: '3', role: 'bot', text: 'El Enalapril puede causar tos seca, mareos, hipotensión y en casos raros angioedema. Es importante monitorear la presión arterial al inicio del tratamiento.' },
    ],
  },
};

export const COO: Story = {
  args: { title: 'MediBot COO' },
};
