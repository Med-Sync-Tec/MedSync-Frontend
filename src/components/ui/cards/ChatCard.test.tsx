import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatCard } from './ChatCard';
import type { MediBotMessage } from '@features/chat/hooks/useMediBot';

const messages: MediBotMessage[] = [
  { id: '1', role: 'user', text: 'Hola' },
  { id: '2', role: 'bot', text: 'Hola, soy MediBot.' },
];

describe('ChatCard', () => {
  it('renders user and bot messages', () => {
    render(<ChatCard messages={messages} onSend={vi.fn()} />);
    expect(screen.getByText('Hola')).toBeInTheDocument();
    expect(screen.getByText('Hola, soy MediBot.')).toBeInTheDocument();
  });

  it('shows typing indicator when isLoading=true', () => {
    render(<ChatCard messages={[]} onSend={vi.fn()} isLoading={true} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('does not show typing indicator when isLoading=false', () => {
    render(<ChatCard messages={[]} onSend={vi.fn()} isLoading={false} />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('calls onSend when user submits a message', async () => {
    const onSend = vi.fn();
    render(<ChatCard messages={[]} onSend={onSend} />);

    const input = screen.getByPlaceholderText(/MediBot/i);
    await userEvent.type(input, 'mi pregunta');
    await userEvent.keyboard('{Enter}');

    expect(onSend).toHaveBeenCalledWith('mi pregunta');
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    render(<ChatCard messages={[]} onSend={vi.fn()} onClose={onClose} />);

    await userEvent.click(screen.getByLabelText(/cerrar/i));
    expect(onClose).toHaveBeenCalled();
  });
});
