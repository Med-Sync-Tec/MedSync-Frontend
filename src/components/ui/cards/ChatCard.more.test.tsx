import { render, screen } from '@testing-library/react';
import { ChatCard } from './ChatCard';
import type { MediBotMessage } from '@features/chat/hooks/useMediBot';

describe('ChatCard markdown rendering', () => {
  it('renders ### headers from bot messages as bold paragraphs', () => {
    // Arrange
    const messages: MediBotMessage[] = [
      { id: 'b1', role: 'bot', text: '### Diagnóstico sugerido' },
    ];

    // Act
    render(<ChatCard messages={messages} onSend={jest.fn()} />);

    // Assert
    const header = screen.getByText('Diagnóstico sugerido');
    expect(header.tagName).toBe('P');
    expect(header).toHaveClass('font-semibold');
  });

  it('renders bullet blocks from bot messages as lists', () => {
    const messages: MediBotMessage[] = [
      { id: 'b1', role: 'bot', text: '- Primer punto\n- Segundo punto' },
    ];

    render(<ChatCard messages={messages} onSend={jest.fn()} />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Primer punto');
    expect(items[1]).toHaveTextContent('Segundo punto');
  });

  it('renders **bold** spans inside bot messages as strong elements', () => {
    const messages: MediBotMessage[] = [
      { id: 'b1', role: 'bot', text: 'Texto con **énfasis** clínico' },
    ];

    render(<ChatCard messages={messages} onSend={jest.fn()} />);

    const strong = screen.getByText('énfasis');
    expect(strong.tagName).toBe('STRONG');
  });

  it('renders mixed bot markdown with header, list and paragraph blocks', () => {
    const messages: MediBotMessage[] = [
      {
        id: 'b1',
        role: 'bot',
        text: '### Resumen\n\n- Uno\n- Dos\n\nLínea uno\nLínea dos',
      },
    ];

    render(<ChatCard messages={messages} onSend={jest.fn()} />);

    expect(screen.getByText('Resumen')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText(/Línea uno/)).toBeInTheDocument();
  });

  it('does not apply markdown rendering to user messages', () => {
    const messages: MediBotMessage[] = [
      { id: 'u1', role: 'user', text: '### no es encabezado' },
    ];

    render(<ChatCard messages={messages} onSend={jest.fn()} />);

    expect(screen.getByText('### no es encabezado')).toBeInTheDocument();
  });

  it('shows the empty-state greeting when there are no messages', () => {
    render(<ChatCard messages={[]} onSend={jest.fn()} />);
    expect(
      screen.getByText('Hola, soy MediBot. ¿En qué puedo ayudarte?')
    ).toBeInTheDocument();
  });

  it('appends custom className to the container', () => {
    const { container } = render(
      <ChatCard messages={[]} onSend={jest.fn()} className="extra-class" />
    );
    expect(container.firstChild).toHaveClass('extra-class');
  });
});
